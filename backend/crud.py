import hmac
import secrets
import hashlib
import json
from sqlalchemy.orm import Session, joinedload
from backend import models, schemas
from backend.database import SessionLocal
from datetime import datetime

# Password helpers using secure PBKDF2 with dynamic salt and fallback support
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"pbkdf2:sha256:100000:{salt}:{key.hex()}"

def verify_password(password: str, hashed: str) -> bool:
    try:
        parts = hashed.split(":")
        if len(parts) == 5:
            _, algo, iterations_str, salt, key_hex = parts
            iterations = int(iterations_str)
            new_key = hashlib.pbkdf2_hmac(algo, password.encode("utf-8"), salt.encode("utf-8"), iterations)
            return hmac.compare_digest(new_key.hex(), key_hex)
        return False
    except Exception:
        return False

# Analytics Helper
def track_event(db: Session, event_name: str, user_id: int = None, payload: dict = None):
    payload_str = json.dumps(payload) if payload else "{}"
    if user_id is not None:
        user_exists = db.query(models.User.id).filter(models.User.id == user_id).first()
        if not user_exists:
            user_id = None

    event = models.AnalyticsEvent(
        event_name=event_name,
        user_id=user_id,
        payload=payload_str
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

def log_event_bg(event_name: str, user_id: int = None, payload: dict = None):
    db = SessionLocal()
    try:
        track_event(db, event_name, user_id=user_id, payload=payload)
    finally:
        db.close()

# User/Auth CRUDS
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user_in: schemas.UserRegister):
    hashed_pwd = hash_password(user_in.password)
    user = models.User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        role=user_in.role,
        is_active=True,
        is_onboarded=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize empty profile linked to user
    profile = models.Profile(user_id=user.id)
    db.add(profile)
    db.commit()

    # Track sign-up event
    track_event(db, "sign_up", user_id=user.id, payload={"role": user.role})

    return user

# Profile CRUDS
def get_profile_by_user_id(db: Session, user_id: int):
    return db.query(models.Profile).filter(models.Profile.user_id == user_id).first()

def update_profile(db: Session, user_id: int, profile_in: schemas.ProfileUpdate):
    profile = get_profile_by_user_id(db, user_id)
    if not profile:
        return None

    profile.name = profile_in.name
    profile.bio = profile_in.bio
    profile.skills = profile_in.skills
    profile.education = profile_in.education
    profile.visa_status = profile_in.visa_status
    profile.target_job_titles = profile_in.target_job_titles
    profile.company_name = profile_in.company_name
    profile.industry = profile_in.industry
    profile.is_public = profile_in.is_public
    profile.updated_at = datetime.utcnow()

    user = get_user_by_id(db, user_id)
    if user:
        user.is_onboarded = True
        db.add(user)

    db.add(profile)
    db.commit()
    db.refresh(profile)

    # Track profile completion
    track_event(db, "profile_complete", user_id=user_id, payload={"role": user.role if user else "unknown"})

    return profile

# Opportunity CRUDS
def create_opportunity(db: Session, employer_id: int, opp_in: schemas.OpportunityCreate):
    opp = models.Opportunity(
        employer_id=employer_id,
        title=opp_in.title,
        description=opp_in.description,
        skills_required=opp_in.skills_required,
        is_active=True
    )
    db.add(opp)
    db.commit()
    db.refresh(opp)
    return opp

def get_opportunities_by_employer(db: Session, employer_id: int):
    return db.query(models.Opportunity).filter(models.Opportunity.employer_id == employer_id).all()

def get_opportunity_by_id(db: Session, opportunity_id: int):
    return db.query(models.Opportunity).filter(models.Opportunity.id == opportunity_id).first()

# Discovery Feed CRUDS
def load_discovery_feed(db: Session, current_user: models.User):
    # Find active and onboarded users/opportunities
    # Exclude those who are suspended or inactive
    # Exclude what this user has already swiped on

    swiped_opportunity_ids = [
        s.target_opportunity_id for s in current_user.swipes_made
        if s.target_opportunity_id is not None
    ]
    swiped_user_ids = [
        s.target_user_id for s in current_user.swipes_made
        if s.target_user_id is not None
    ]

    if current_user.role == "student":
        # Fetch active opportunities from onboarded and active employers with eager loading
        query = db.query(models.Opportunity)\
            .options(joinedload(models.Opportunity.employer).joinedload(models.User.profile))\
            .join(models.User, models.Opportunity.employer_id == models.User.id)\
            .filter(
                models.Opportunity.is_active == True,
                models.User.is_active == True,
                models.User.is_suspended == False,
                models.User.is_onboarded == True
            )
        if swiped_opportunity_ids:
            query = query.filter(models.Opportunity.id.notin_(swiped_opportunity_ids))

        return query.all()

    elif current_user.role == "employer":
        # Fetch onboarded and active student profiles with eager loading
        query = db.query(models.Profile)\
            .options(joinedload(models.Profile.user))\
            .join(models.User, models.Profile.user_id == models.User.id)\
            .filter(
                models.User.role == "student",
                models.User.is_active == True,
                models.User.is_suspended == False,
                models.User.is_onboarded == True,
                models.Profile.is_public == True
            )
        if swiped_user_ids:
            query = query.filter(models.Profile.user_id.notin_(swiped_user_ids))

        return query.all()

    return []

# Swipe and Matching CRUDS
def create_swipe(db: Session, current_user_id: int, swipe_in: schemas.SwipeCreate):
    # Register the swipe event
    swipe = models.Swipe(
        swiper_id=current_user_id,
        target_user_id=swipe_in.target_user_id,
        target_opportunity_id=swipe_in.target_opportunity_id,
        direction=swipe_in.direction
    )
    db.add(swipe)
    db.commit()
    db.refresh(swipe)

    track_event(db, "swipe", user_id=current_user_id, payload={"direction": swipe_in.direction})

    match_created = None

    if swipe_in.direction == "like":
        # Check whether target already liked current user.
        # How?
        # Scenario A: current user is student swiping on opportunity O (belonging to employer E).
        # We need to see if employer E has swiped 'like' on this student.
        if current_user_id != swipe.swiper_id:
            pass # sanity check

        # Determine roles and look up potential match
        user = get_user_by_id(db, current_user_id)

        if user.role == "student" and swipe_in.target_opportunity_id:
            opp = get_opportunity_by_id(db, swipe_in.target_opportunity_id)
            if opp:
                employer_id = opp.employer_id
                # Check if employer has liked this student
                mutual_like = db.query(models.Swipe).filter(
                    models.Swipe.swiper_id == employer_id,
                    models.Swipe.target_user_id == current_user_id,
                    models.Swipe.direction == "like"
                ).first()
                if mutual_like:
                    match_created = create_match(db, student_id=current_user_id, employer_id=employer_id, opportunity_id=opp.id)

        elif user.role == "employer" and swipe_in.target_user_id:
            # Current user is employer E swiping on student S.
            # Check if student S has liked ANY opportunity belonging to this employer E.
            # We can find if there is a 'like' from S to an opportunity of employer E.
            # Or we look up all opportunities of employer E.
            employer_opp_ids = [opp.id for opp in get_opportunities_by_employer(db, current_user_id)]
            if employer_opp_ids:
                mutual_like = db.query(models.Swipe).filter(
                    models.Swipe.swiper_id == swipe_in.target_user_id,
                    models.Swipe.target_opportunity_id.in_(employer_opp_ids),
                    models.Swipe.direction == "like"
                ).first()
                if mutual_like:
                    match_created = create_match(
                        db,
                        student_id=swipe_in.target_user_id,
                        employer_id=current_user_id,
                        opportunity_id=mutual_like.target_opportunity_id
                    )

    return swipe, match_created

def create_match(db: Session, student_id: int, employer_id: int, opportunity_id: int):
    # Check if match already exists to avoid duplicates
    existing = db.query(models.Match).filter(
        models.Match.student_id == student_id,
        models.Match.employer_id == employer_id,
        models.Match.opportunity_id == opportunity_id
    ).first()
    if existing:
        return existing

    match = models.Match(
        student_id=student_id,
        employer_id=employer_id,
        opportunity_id=opportunity_id
    )
    db.add(match)
    db.commit()
    db.refresh(match)

    # Initialize compliance record
    compliance = models.ComplianceRecord(
        match_id=match.id,
        school_approval="pending",
        visa_status="pending",
        travel_docs="pending",
        interview_scheduled=False,
        readiness="not_ready"
    )
    db.add(compliance)

    # Send a system greeting message to initialize chat room
    system_msg = models.Message(
        match_id=match.id,
        sender_id=employer_id,  # Employer can automatically greeting
        text="Congratulations! You have matched. You can now chat and complete compliance requirements."
    )
    db.add(system_msg)

    db.commit()
    db.refresh(match)

    # Track match event
    track_event(db, "match_created", user_id=student_id, payload={"match_id": match.id, "opportunity_id": opportunity_id})
    track_event(db, "match_created", user_id=employer_id, payload={"match_id": match.id, "opportunity_id": opportunity_id})

    return match

def get_matches_for_user(db: Session, user_id: int):
    user = get_user_by_id(db, user_id)
    if not user:
        return []

    query = db.query(models.Match).options(
        joinedload(models.Match.student).joinedload(models.User.profile),
        joinedload(models.Match.employer).joinedload(models.User.profile),
        joinedload(models.Match.opportunity)
    )

    if user.role == "student":
        return query.filter(models.Match.student_id == user_id).order_by(models.Match.created_at.desc()).all()
    elif user.role == "employer":
        return query.filter(models.Match.employer_id == user_id).order_by(models.Match.created_at.desc()).all()
    else:  # Admin can see all matches
        return query.order_by(models.Match.created_at.desc()).all()

def get_match_by_id(db: Session, match_id: int):
    return db.query(models.Match).filter(models.Match.id == match_id).first()

# Chat CRUDS
def create_message(db: Session, match_id: int, sender_id: int, text: str):
    message = models.Message(
        match_id=match_id,
        sender_id=sender_id,
        text=text
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    # Track message sent event
    track_event(db, "message_sent", user_id=sender_id, payload={"match_id": match_id})

    return message

def get_messages_by_match(db: Session, match_id: int):
    return db.query(models.Message).filter(models.Message.match_id == match_id).order_by(models.Message.created_at.asc()).all()

# Compliance CRUDS
def update_compliance_record(db: Session, match_id: int, step: str, status: str):
    compliance = db.query(models.ComplianceRecord).filter(models.ComplianceRecord.match_id == match_id).first()
    if not compliance:
        return None

    if step == "schoolApproval":
        compliance.school_approval = status
    elif step == "visaStatus":
        compliance.visa_status = status
    elif step == "travelDocs":
        compliance.travel_docs = status
    elif step == "interviewScheduled":
        compliance.interview_scheduled = (status.lower() == "true")

    # Re-evaluate readiness
    # Required steps are complete if schoolApproval, visaStatus, travelDocs are NOT pending AND interviewScheduled is true.
    # Wait, let's see how README defines it: "IF all required steps complete: set readiness = ready, ELSE readiness = in_progress"
    # Required steps are complete if:
    # - school_approval is 'approved' or 'not_required' (or just not 'pending' and not 'rejected')
    # - visa_status is 'approved' or 'not_required'
    # - travel_docs is 'approved' or 'not_required'
    # - interview_scheduled is True
    # Let's write a clean logic:
    steps_ok = (
        compliance.school_approval in ["approved", "not_required"] and
        compliance.visa_status in ["approved", "not_required"] and
        compliance.travel_docs in ["approved", "not_required"] and
        compliance.interview_scheduled == True
    )

    if steps_ok:
        compliance.readiness = "ready"
    else:
        compliance.readiness = "in_progress"

    compliance.updated_at = datetime.utcnow()
    db.add(compliance)
    db.commit()
    db.refresh(compliance)

    # Track compliance updated
    track_event(db, "compliance_updated", payload={"match_id": match_id, "step": step, "readiness": compliance.readiness})

    return compliance

# Moderation CRUDS
def create_report(db: Session, reporter_id: int, reported_user_id: int, reason: str):
    report = models.Report(
        reporter_id=reporter_id,
        reported_user_id=reported_user_id,
        reason=reason,
        status="pending"
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

def get_all_reports(db: Session):
    return db.query(models.Report).order_by(models.Report.created_at.desc()).all()

def update_report_status(db: Session, report_id: int, status: str):
    # Status option: ignore, warn, suspend, remove
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        return None

    report.status = status
    db.add(report)

    # If action is suspend or remove, we deactivate the reported user
    if status in ["suspend", "remove"]:
        reported_user = get_user_by_id(db, report.reported_user_id)
        if reported_user:
            reported_user.is_suspended = True
            reported_user.is_active = (status != "remove")  # Deactivate fully if removed
            db.add(reported_user)

    db.commit()
    db.refresh(report)
    return report

# Fetch all events (Analytics)
def get_analytics_events(db: Session):
    return db.query(models.AnalyticsEvent).order_by(models.AnalyticsEvent.created_at.desc()).all()
