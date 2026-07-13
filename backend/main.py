import os
import secrets
from fastapi import FastAPI, Depends, HTTPException, status, Header, Cookie, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import Optional, List, Dict

from backend import models, schemas, crud
from backend.database import engine, Base, get_db

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Swipetern API", description="API for Swipetern mutual-consent matching system")

import hmac
import hashlib

# CORS middleware to allow secure local development and production Vercel environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_origin_regex="https://.*\\.vercel\\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY", "swipetern-super-secret-key-123")

def sign_token(user_id: int) -> str:
    msg = str(user_id).encode("utf-8")
    sig = hmac.new(SECRET_KEY.encode("utf-8"), msg, hashlib.sha256).hexdigest()
    return f"{user_id}.{sig}"

def verify_token(token: str) -> Optional[int]:
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        user_id_str, sig = parts
        user_id = int(user_id_str)
        expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), str(user_id).encode("utf-8"), hashlib.sha256).hexdigest()
        if hmac.compare_digest(sig, expected_sig):
            return user_id
    except Exception:
        pass
    return None

# Dependency to get current user from token (Header or Cookie)
def get_current_user(
    authorization: Optional[str] = Header(None),
    session_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db)
) -> models.User:
    user_id = None

    # 1. Check Authorization header
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        user_id = verify_token(token)

    # 2. Check Cookie
    if not user_id and session_token:
        user_id = verify_token(session_token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Please log in."
        )

    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found."
        )

    if user.is_suspended:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended or deactivated."
        )

    return user

# Helper to generate and store token
def create_user_session(user_id: int) -> str:
    return sign_token(user_id)

# --- AUTH ROUTES ---

@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register(user_in: schemas.UserRegister, response: Response, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user_in.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email is already registered.")

    user = crud.create_user(db, user_in)
    token = create_user_session(user.id)
    response.set_cookie(key="session_token", value=token, httponly=True)
    return user

@app.post("/api/auth/login")
def login(user_in: schemas.UserLogin, response: Response, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, user_in.email)
    if not user or not crud.verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password.")

    if user.is_suspended:
        raise HTTPException(status_code=403, detail="Account is suspended.")

    token = create_user_session(user.id)
    response.set_cookie(key="session_token", value=token, httponly=True)

    profile = crud.get_profile_by_user_id(db, user.id)

    # Track login event
    crud.track_event(db, "login", user_id=user.id, payload={"role": user.role})

    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "is_onboarded": user.is_onboarded,
            "is_suspended": user.is_suspended,
            "created_at": user.created_at
        },
        "profile": profile
    }

@app.post("/api/auth/logout")
def logout(response: Response):
    response.delete_cookie("session_token")
    return {"detail": "Successfully logged out"}

@app.get("/api/auth/me")
def get_me(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = crud.get_profile_by_user_id(db, current_user.id)
    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "role": current_user.role,
            "is_onboarded": current_user.is_onboarded,
            "is_suspended": current_user.is_suspended,
            "created_at": current_user.created_at
        },
        "profile": profile
    }

# --- PROFILE ROUTES ---

@app.put("/api/profile", response_model=schemas.ProfileResponse)
def update_profile(
    profile_in: schemas.ProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = crud.update_profile(db, current_user.id, profile_in)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return profile

@app.post("/api/profile/opportunity", response_model=schemas.OpportunityResponse)
def create_job_opportunity(
    opp_in: schemas.OpportunityCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "employer":
        raise HTTPException(status_code=403, detail="Only employers can create opportunities.")

    opp = crud.create_opportunity(db, current_user.id, opp_in)

    # Track opportunity creation
    crud.track_event(db, "opportunity_created", user_id=current_user.id, payload={"opportunity_id": opp.id, "title": opp.title})

    return opp

@app.get("/api/profile/opportunities", response_model=List[schemas.OpportunityResponse])
def get_employer_opportunities(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "employer":
        raise HTTPException(status_code=403, detail="Only employers can query their opportunities.")
    return crud.get_opportunities_by_employer(db, current_user.id)

# --- DISCOVERY ROUTE ---

@app.get("/api/discovery")
def get_discovery_cards(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_onboarded:
        raise HTTPException(status_code=400, detail="Please complete onboarding before viewing discovery feed.")

    cards = crud.load_discovery_feed(db, current_user)

    # Format response cleanly based on role
    # If Student: return Opportunities with employer details
    # If Employer: return Students
    result = []
    if current_user.role == "student":
        for opp in cards:
            emp_profile = crud.get_profile_by_user_id(db, opp.employer_id)
            result.append({
                "id": opp.id,
                "title": opp.title,
                "description": opp.description,
                "skills_required": opp.skills_required,
                "company_name": emp_profile.company_name if emp_profile else "Employer",
                "industry": emp_profile.industry if emp_profile else "",
                "employer_bio": emp_profile.bio if emp_profile else "",
                "employer_id": opp.employer_id
            })
    elif current_user.role == "employer":
        for prof in cards:
            result.append({
                "id": prof.user_id,
                "name": prof.name,
                "bio": prof.bio,
                "skills": prof.skills,
                "education": prof.education,
                "visa_status": prof.visa_status,
                "target_job_titles": prof.target_job_titles
            })

    return result

# --- SWIPE ROUTE ---

@app.post("/api/swipe")
def swipe(
    swipe_in: schemas.SwipeCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_onboarded:
        raise HTTPException(status_code=400, detail="Onboarding is required to perform actions.")

    # Validation
    if current_user.role == "student" and not swipe_in.target_opportunity_id:
        raise HTTPException(status_code=400, detail="Students must swipe on an opportunity id.")
    if current_user.role == "employer" and not swipe_in.target_user_id:
        raise HTTPException(status_code=400, detail="Employers must swipe on a student user id.")

    swipe_obj, match = crud.create_swipe(db, current_user.id, swipe_in)

    match_response = None
    if match:
        stud_prof = crud.get_profile_by_user_id(db, match.student_id)
        emp_prof = crud.get_profile_by_user_id(db, match.employer_id)
        opp = crud.get_opportunity_by_id(db, match.opportunity_id)
        match_response = {
            "id": match.id,
            "student_id": match.student_id,
            "employer_id": match.employer_id,
            "opportunity_id": match.opportunity_id,
            "created_at": match.created_at,
            "student_name": stud_prof.name if stud_prof else "Student",
            "employer_name": emp_prof.company_name if emp_prof else "Employer",
            "opportunity_title": opp.title if opp else "Opportunity"
        }

    return {
        "swipe": {
            "id": swipe_obj.id,
            "swiper_id": swipe_obj.swiper_id,
            "direction": swipe_obj.direction,
            "target_user_id": swipe_obj.target_user_id,
            "target_opportunity_id": swipe_obj.target_opportunity_id
        },
        "matched": match is not None,
        "match": match_response
    }

# --- MATCH ROUTES ---

@app.get("/api/matches", response_model=List[schemas.MatchResponse])
def get_user_matches(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    matches = crud.get_matches_for_user(db, current_user.id)
    result = []
    for m in matches:
        stud_prof = crud.get_profile_by_user_id(db, m.student_id)
        emp_prof = crud.get_profile_by_user_id(db, m.employer_id)
        opp = crud.get_opportunity_by_id(db, m.opportunity_id)
        result.append(schemas.MatchResponse(
            id=m.id,
            student_id=m.student_id,
            employer_id=m.employer_id,
            opportunity_id=m.opportunity_id,
            created_at=m.created_at,
            student_name=stud_prof.name if stud_prof else "Student",
            employer_name=emp_prof.company_name if emp_prof else "Employer",
            opportunity_title=opp.title if opp else "Opportunity"
        ))
    return result

# --- CHAT ROUTES ---

@app.get("/api/matches/{match_id}/messages", response_model=List[schemas.MessageResponse])
def get_match_messages(
    match_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    match = crud.get_match_by_id(db, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found.")

    # Access Control: Allow if user owns match or is admin
    if current_user.role != "admin" and current_user.id not in [match.student_id, match.employer_id]:
        raise HTTPException(status_code=403, detail="Access denied. You are not part of this match.")

    return crud.get_messages_by_match(db, match_id)

@app.post("/api/matches/{match_id}/messages", response_model=schemas.MessageResponse)
def send_match_message(
    match_id: int,
    msg_in: schemas.MessageCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    match = crud.get_match_by_id(db, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found.")

    if current_user.role != "admin" and current_user.id not in [match.student_id, match.employer_id]:
        raise HTTPException(status_code=403, detail="Access denied. You cannot send messages in this match.")

    return crud.create_message(db, match_id, current_user.id, msg_in.text)

# --- COMPLIANCE ROUTES ---

@app.get("/api/matches/{match_id}/compliance", response_model=schemas.ComplianceResponse)
def get_match_compliance(
    match_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    match = crud.get_match_by_id(db, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found.")

    if current_user.role != "admin" and current_user.id not in [match.student_id, match.employer_id]:
        raise HTTPException(status_code=403, detail="Access denied.")

    compliance = db.query(models.ComplianceRecord).filter(models.ComplianceRecord.match_id == match_id).first()
    if not compliance:
        raise HTTPException(status_code=404, detail="Compliance record not found.")
    return compliance

@app.put("/api/matches/{match_id}/compliance", response_model=schemas.ComplianceResponse)
def update_match_compliance(
    match_id: int,
    comp_in: schemas.ComplianceUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    match = crud.get_match_by_id(db, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found.")

    if current_user.role != "admin" and current_user.id not in [match.student_id, match.employer_id]:
        raise HTTPException(status_code=403, detail="Access denied. You cannot edit this compliance record.")

    comp = crud.update_compliance_record(db, match_id, comp_in.step, comp_in.status)
    if not comp:
        raise HTTPException(status_code=404, detail="Compliance record could not be updated.")
    return comp

# --- MODERATION ROUTES ---

@app.post("/api/reports", response_model=schemas.ReportResponse)
def file_moderation_report(
    report_in: schemas.ReportCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if report_in.reported_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot report yourself.")

    reported_user = crud.get_user_by_id(db, report_in.reported_user_id)
    if not reported_user:
        raise HTTPException(status_code=404, detail="Reported user not found.")

    report = crud.create_report(db, current_user.id, report_in.reported_user_id, report_in.reason)

    # Track report event
    crud.track_event(db, "report_submitted", user_id=current_user.id, payload={"reported_user_id": report_in.reported_user_id, "report_id": report.id})

    return report

@app.get("/api/reports", response_model=List[schemas.ReportResponse])
def list_reports(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    return crud.get_all_reports(db)

@app.post("/api/reports/{report_id}/action", response_model=schemas.ReportResponse)
def handle_report_action(
    report_id: int,
    action: str,  # ignore, warn, suspend, remove
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")

    if action not in ["ignore", "warn", "suspend", "remove"]:
        raise HTTPException(status_code=400, detail="Invalid action.")

    report = crud.update_report_status(db, report_id, action)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    # Track action
    crud.track_event(db, "report_action_taken", user_id=current_user.id, payload={"report_id": report_id, "action": action})

    return report

# --- ANALYTICS ROUTE ---

@app.get("/api/analytics")
def get_analytics_dashboard_metrics(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only Admin, Employers, and Students can view, but let's make it contextual
    # Gather database wide counts
    users_count = db.query(models.User).count()
    students_count = db.query(models.User).filter(models.User.role == "student").count()
    employers_count = db.query(models.User).filter(models.User.role == "employer").count()
    opportunities_count = db.query(models.Opportunity).count()
    matches_count = db.query(models.Match).count()
    swipes_count = db.query(models.Swipe).count()
    reports_count = db.query(models.Report).count()

    # Calculate some helper aggregates
    likes_count = db.query(models.Swipe).filter(models.Swipe.direction == "like").count()
    passes_count = db.query(models.Swipe).filter(models.Swipe.direction == "pass").count()

    # Match readiness
    ready_matches = db.query(models.ComplianceRecord).filter(models.ComplianceRecord.readiness == "ready").count()
    in_progress_matches = db.query(models.ComplianceRecord).filter(models.ComplianceRecord.readiness == "in_progress").count()
    not_ready_matches = db.query(models.ComplianceRecord).filter(models.ComplianceRecord.readiness == "not_ready").count()

    # Get recent raw logs
    events = crud.get_analytics_events(db)
    recent_events = []
    for ev in events[:20]:
        recent_events.append({
            "id": ev.id,
            "event_name": ev.event_name,
            "user_id": ev.user_id,
            "payload": ev.payload,
            "created_at": ev.created_at
        })

    return {
        "metrics": {
            "users": users_count,
            "students": students_count,
            "employers": employers_count,
            "opportunities": opportunities_count,
            "matches": matches_count,
            "swipes": swipes_count,
            "likes": likes_count,
            "passes": passes_count,
            "reports": reports_count,
            "compliance": {
                "ready": ready_matches,
                "in_progress": in_progress_matches,
                "not_ready": not_ready_matches
            }
        },
        "recent_events": recent_events
    }

# --- SEED ROOT / STATIC SERVING ---

# Serve the static frontend
# Note: Mount this after all api routes!
if os.path.exists("frontend"):
    app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
