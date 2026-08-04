from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class UserRegister(BaseModel):
    email: str
    password: str = Field(..., min_length=4)
    role: str = Field("student", pattern="^(student|employer|admin)$")

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    is_onboarded: bool
    is_suspended: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    name: str = ""
    bio: Optional[str] = ""
    skills: Optional[str] = ""
    education: Optional[str] = ""
    visa_status: Optional[str] = ""
    target_job_titles: Optional[str] = ""
    company_name: Optional[str] = ""
    industry: Optional[str] = ""
    is_public: Optional[bool] = True

class ProfileResponse(BaseModel):
    id: int
    user_id: int
    name: str
    bio: Optional[str]
    skills: Optional[str]
    education: Optional[str]
    visa_status: Optional[str]
    target_job_titles: Optional[str]
    company_name: Optional[str]
    industry: Optional[str]
    is_public: bool

    class Config:
        from_attributes = True

class OpportunityCreate(BaseModel):
    title: str
    description: str
    skills_required: Optional[str] = ""

class OpportunityResponse(BaseModel):
    id: int
    employer_id: int
    title: str
    description: str
    skills_required: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class SwipeCreate(BaseModel):
    direction: str = Field(..., pattern="^(like|pass)$")
    target_user_id: Optional[int] = None
    target_opportunity_id: Optional[int] = None

class SwipeResponse(BaseModel):
    id: int
    swiper_id: int
    target_user_id: Optional[int]
    target_opportunity_id: Optional[int]
    direction: str
    created_at: datetime

    class Config:
        from_attributes = True

class MatchResponse(BaseModel):
    id: int
    student_id: int
    employer_id: int
    opportunity_id: int
    created_at: datetime
    student_name: Optional[str] = ""
    employer_name: Optional[str] = ""
    opportunity_title: Optional[str] = ""

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    text: str = Field(..., min_length=1)

class MessageResponse(BaseModel):
    id: int
    match_id: int
    sender_id: int
    text: str
    created_at: datetime

    class Config:
        from_attributes = True

class ComplianceUpdate(BaseModel):
    step: str = Field(..., pattern="^(schoolApproval|visaStatus|travelDocs|interviewScheduled)$")
    status: str  # For strings, or "true"/"false" for interviewScheduled

class ComplianceResponse(BaseModel):
    id: int
    match_id: int
    school_approval: str
    visa_status: str
    travel_docs: str
    interview_scheduled: bool
    readiness: str
    updated_at: datetime

    class Config:
        from_attributes = True

class AnalyticsEventCreate(BaseModel):
    event_name: str
    payload: Optional[str] = ""

class AnalyticsEventResponse(BaseModel):
    id: int
    event_name: str
    user_id: Optional[int]
    payload: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ReportCreate(BaseModel):
    reported_user_id: int
    reason: str

class ReportResponse(BaseModel):
    id: int
    reporter_id: int
    reported_user_id: int
    reason: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
