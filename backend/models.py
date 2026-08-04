import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # student, employer, admin
    is_active = Column(Boolean, default=True)
    is_onboarded = Column(Boolean, default=False)
    is_suspended = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    opportunities = relationship("Opportunity", back_populates="employer", cascade="all, delete-orphan")
    swipes_made = relationship("Swipe", foreign_keys="Swipe.swiper_id", back_populates="swiper", cascade="all, delete-orphan")
    reports_submitted = relationship("Report", foreign_keys="Report.reporter_id", back_populates="reporter", cascade="all, delete-orphan")
    reports_received = relationship("Report", foreign_keys="Report.reported_user_id", back_populates="reported_user", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    name = Column(String, nullable=False, default="")
    bio = Column(Text, nullable=True, default="")
    skills = Column(String, nullable=True, default="")  # comma-separated
    education = Column(String, nullable=True, default="")  # student only
    visa_status = Column(String, nullable=True, default="")  # student only (e.g. pending, approved, not_required)
    target_job_titles = Column(String, nullable=True, default="")  # student only
    company_name = Column(String, nullable=True, default="")  # employer only
    industry = Column(String, nullable=True, default="")  # employer only
    is_public = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="profile")

class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    employer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    skills_required = Column(String, nullable=True, default="")  # comma-separated
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    employer = relationship("User", back_populates="opportunities")
    swipes = relationship("Swipe", back_populates="target_opportunity", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="opportunity", cascade="all, delete-orphan")

class Swipe(Base):
    __tablename__ = "swipes"

    id = Column(Integer, primary_key=True, index=True)
    swiper_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)  # swiping on a student
    target_opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=True)  # swiping on an opportunity
    direction = Column(String, nullable=False)  # like, pass
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    swiper = relationship("User", foreign_keys=[swiper_id], back_populates="swipes_made")
    target_user = relationship("User", foreign_keys=[target_user_id])
    target_opportunity = relationship("Opportunity", back_populates="swipes")

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    employer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    student = relationship("User", foreign_keys=[student_id])
    employer = relationship("User", foreign_keys=[employer_id])
    opportunity = relationship("Opportunity", back_populates="matches")
    messages = relationship("Message", back_populates="match", cascade="all, delete-orphan")
    compliance_record = relationship("ComplianceRecord", back_populates="match", uselist=False, cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    match = relationship("Match", back_populates="messages")
    sender = relationship("User")

class ComplianceRecord(Base):
    __tablename__ = "compliance_records"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id", ondelete="CASCADE"), unique=True, nullable=False)
    school_approval = Column(String, default="pending")  # pending, approved, rejected
    visa_status = Column(String, default="pending")  # pending, approved, rejected, not_required
    travel_docs = Column(String, default="pending")  # pending, approved, rejected
    interview_scheduled = Column(Boolean, default=False)
    readiness = Column(String, default="not_ready")  # not_ready, in_progress, ready
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    match = relationship("Match", back_populates="compliance_record")

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    payload = Column(Text, nullable=True)  # JSON-serialized string or generic payload
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reported_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String, default="pending")  # pending, ignored, warned, suspended, removed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="reports_submitted")
    reported_user = relationship("User", foreign_keys=[reported_user_id], back_populates="reports_received")
