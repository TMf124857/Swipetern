import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.database import Base, get_db
from backend.main import app
from backend import models, crud

# Set up test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_swipetern.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function", autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def test_user_flow():
    # 1. Register a student
    reg_student = client.post("/api/auth/register", json={
        "email": "student@test.com",
        "password": "password123",
        "role": "student"
    })
    assert reg_student.status_code == 200
    student_data = reg_student.json()
    assert student_data["email"] == "student@test.com"
    assert student_data["role"] == "student"
    assert student_data["is_onboarded"] is False

    # 2. Login the student
    login_student = client.post("/api/auth/login", json={
        "email": "student@test.com",
        "password": "password123"
    })
    assert login_student.status_code == 200
    login_data = login_student.json()
    token = login_data["token"]
    assert token is not None

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Retrieve currently logged in user info
    me = client.get("/api/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["user"]["email"] == "student@test.com"

    # 4. Try discovery before onboarding
    disc = client.get("/api/discovery", headers=headers)
    assert disc.status_code == 400
    assert "onboarding" in disc.json()["detail"].lower()

    # 5. Onboard student
    profile_update = client.put("/api/profile", headers=headers, json={
        "name": "Jane Doe",
        "bio": "Enthusiastic Computer Science Student",
        "skills": "Python, SQL, React",
        "education": "BS in Computer Science, Year 3",
        "visa_status": "F-1 Visa",
        "target_job_titles": "Software Engineer Intern",
        "company_name": "",
        "industry": "",
        "is_public": True
    })
    assert profile_update.status_code == 200
    p_data = profile_update.json()
    assert p_data["name"] == "Jane Doe"
    assert p_data["education"] == "BS in Computer Science, Year 3"

    # Verify is_onboarded is now true
    me_updated = client.get("/api/auth/me", headers=headers)
    assert me_updated.json()["user"]["is_onboarded"] is True


def test_matching_and_chat_and_compliance():
    # 1. Register and Onboard Student
    reg_stud = client.post("/api/auth/register", json={
        "email": "stud@test.com",
        "password": "password",
        "role": "student"
    })
    stud_token = client.post("/api/auth/login", json={"email": "stud@test.com", "password": "password"}).json()["token"]
    stud_headers = {"Authorization": f"Bearer {stud_token}"}
    client.put("/api/profile", headers=stud_headers, json={
        "name": "Siddharth",
        "education": "University of Waterloo",
        "visa_status": "not_required"
    })

    # 2. Register and Onboard Employer
    reg_emp = client.post("/api/auth/register", json={
        "email": "emp@test.com",
        "password": "password",
        "role": "employer"
    })
    emp_token = client.post("/api/auth/login", json={"email": "emp@test.com", "password": "password"}).json()["token"]
    emp_headers = {"Authorization": f"Bearer {emp_token}"}
    client.put("/api/profile", headers=emp_headers, json={
        "name": "HR Alice",
        "company_name": "Tech Corp",
        "industry": "Software development"
    })

    # 3. Employer creates an opportunity
    opp_res = client.post("/api/profile/opportunity", headers=emp_headers, json={
        "title": "Backend Engineering Intern",
        "description": "Work with FastAPI, PostgreSQL, and AWS",
        "skills_required": "FastAPI, SQL"
    })
    assert opp_res.status_code == 200
    opp_id = opp_res.json()["id"]

    # 4. Check discovery feed for Student (should see Employer's opportunity)
    stud_disc = client.get("/api/discovery", headers=stud_headers)
    assert stud_disc.status_code == 200
    cards = stud_disc.json()
    assert len(cards) == 1
    assert cards[0]["id"] == opp_id
    assert cards[0]["title"] == "Backend Engineering Intern"

    # 5. Check discovery feed for Employer (should see Student)
    emp_disc = client.get("/api/discovery", headers=emp_headers)
    assert emp_disc.status_code == 200
    student_cards = emp_disc.json()
    assert len(student_cards) == 1
    student_user_id = student_cards[0]["id"]

    # 6. Student swipes LIKE on the opportunity
    swipe_stud = client.post("/api/swipe", headers=stud_headers, json={
        "direction": "like",
        "target_opportunity_id": opp_id
    })
    assert swipe_stud.status_code == 200
    assert swipe_stud.json()["matched"] is False

    # After swiping, discovery feed for student should be empty
    stud_disc_after = client.get("/api/discovery", headers=stud_headers)
    assert len(stud_disc_after.json()) == 0

    # 7. Employer swipes LIKE on the student (should trigger mutual match!)
    swipe_emp = client.post("/api/swipe", headers=emp_headers, json={
        "direction": "like",
        "target_user_id": student_user_id
    })
    assert swipe_emp.status_code == 200
    data_swipe_emp = swipe_emp.json()
    assert data_swipe_emp["matched"] is True
    match = data_swipe_emp["match"]
    match_id = match["id"]
    assert match["student_name"] == "Siddharth"
    assert match["employer_name"] == "Tech Corp"
    assert match["opportunity_title"] == "Backend Engineering Intern"

    # 8. Check match list for student and employer
    stud_matches = client.get("/api/matches", headers=stud_headers)
    assert len(stud_matches.json()) == 1
    assert stud_matches.json()[0]["id"] == match_id

    # 9. Verify automatic greeting message in chat
    msgs = client.get(f"/api/matches/{match_id}/messages", headers=stud_headers)
    assert len(msgs.json()) == 1
    assert "congratulations" in msgs.json()[0]["text"].lower()

    # 10. Send a message
    send_res = client.post(f"/api/matches/{match_id}/messages", headers=stud_headers, json={
        "text": "Hi Alice, super excited to match with Tech Corp!"
    })
    assert send_res.status_code == 200

    msgs_after = client.get(f"/api/matches/{match_id}/messages", headers=emp_headers)
    assert len(msgs_after.json()) == 2
    assert msgs_after.json()[1]["text"] == "Hi Alice, super excited to match with Tech Corp!"

    # 11. Verify Compliance records
    compliance = client.get(f"/api/matches/{match_id}/compliance", headers=stud_headers)
    assert compliance.status_code == 200
    comp_data = compliance.json()
    assert comp_data["school_approval"] == "pending"
    assert comp_data["readiness"] == "not_ready"

    # Update school approval to approved
    comp_update1 = client.put(f"/api/matches/{match_id}/compliance", headers=stud_headers, json={
        "step": "schoolApproval",
        "status": "approved"
    })
    assert comp_update1.json()["school_approval"] == "approved"
    assert comp_update1.json()["readiness"] == "in_progress"

    # Complete all remaining steps
    client.put(f"/api/matches/{match_id}/compliance", headers=stud_headers, json={
        "step": "visaStatus",
        "status": "approved"
    })
    client.put(f"/api/matches/{match_id}/compliance", headers=stud_headers, json={
        "step": "travelDocs",
        "status": "approved"
    })
    final_comp = client.put(f"/api/matches/{match_id}/compliance", headers=stud_headers, json={
        "step": "interviewScheduled",
        "status": "true"
    })

    assert final_comp.json()["readiness"] == "ready"


def test_moderation_and_reports():
    # 1. Register Student (reporter) and Student B (reported)
    r1 = client.post("/api/auth/register", json={"email": "rep@test.com", "password": "password", "role": "student"}).json()
    r2 = client.post("/api/auth/register", json={"email": "bad@test.com", "password": "password", "role": "student"}).json()

    # 2. Register Admin
    r_admin = client.post("/api/auth/register", json={"email": "admin@test.com", "password": "password", "role": "admin"}).json()

    # Log in reporter
    rep_token = client.post("/api/auth/login", json={"email": "rep@test.com", "password": "password"}).json()["token"]
    rep_headers = {"Authorization": f"Bearer {rep_token}"}

    # Log in admin
    admin_token = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "password"}).json()["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 3. File Report
    report = client.post("/api/reports", headers=rep_headers, json={
        "reported_user_id": r2["id"],
        "reason": "Harassment in profile details"
    })
    assert report.status_code == 200
    report_id = report.json()["id"]

    # 4. View Reports (Admin)
    reports = client.get("/api/reports", headers=admin_headers)
    assert len(reports.json()) == 1
    assert reports.json()[0]["reason"] == "Harassment in profile details"

    # Non-admin trying to view reports should fail
    reports_fail = client.get("/api/reports", headers=rep_headers)
    assert reports_fail.status_code == 403

    # 5. Handle Report - Action "suspend"
    action_res = client.post(f"/api/reports/{report_id}/action?action=suspend", headers=admin_headers)
    assert action_res.status_code == 200
    assert action_res.json()["status"] == "suspend"

    # Try logging in bad user now
    bad_login = client.post("/api/auth/login", json={"email": "bad@test.com", "password": "password"})
    assert bad_login.status_code == 403
    assert "suspended" in bad_login.json()["detail"].lower()


def test_analytics():
    # Trigger an event by registering a user
    client.post("/api/auth/register", json={"email": "analyst@test.com", "password": "password", "role": "student"})

    # Authenticate analyst
    token = client.post("/api/auth/login", json={"email": "analyst@test.com", "password": "password"}).json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    analytics_res = client.get("/api/analytics", headers=headers)
    assert analytics_res.status_code == 200
    data = analytics_res.json()
    assert data["metrics"]["users"] >= 1
    assert any(ev["event_name"] == "sign_up" for ev in data["recent_events"])
