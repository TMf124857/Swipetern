# Swipetern

Swipetern connects students and employers through mutual-consent matching, then supports chat and lightweight compliance tracking.

## Goal

Create an app that helps users:

1. discover
2. match
3. chat
4. verify
5. progress

## Main modules

- authentication
- profile management
- discovery feed
- swipe and match engine
- chat
- compliance tracker
- analytics
- moderation

## Application startup

```text
ON app start:
  check if user is logged in

  IF not logged in:
    show welcome screen
  ELSE:
    load user profile

    IF profile is incomplete:
      send user to onboarding
    ELSE:
      send user to role-specific home screen
```

## User onboarding

```text
FUNCTION onboarding():
  ask user to select role:
    student
    employer

  collect minimum profile fields based on role

  save profile to database

  route user to home screen
```

## Authentication

```text
FUNCTION register(email, password):
  create auth account
  create user record
  return success or error

FUNCTION login(email, password):
  validate credentials
  load profile
  return success or error

FUNCTION logout():
  clear session
  return to welcome screen
```

## Profile management

```text
FUNCTION saveProfile(userId, profileData):
  validate required fields
  store profile data

FUNCTION editProfile(userId, changes):
  validate changes
  update profile data

FUNCTION fetchProfile(userId):
  return profile data
```

## Discovery feed

```text
FUNCTION loadDiscoveryFeed(currentUser):
  IF currentUser.role == student:
    fetch active opportunities
    exclude already swiped opportunities
    display opportunity cards

  IF currentUser.role == employer:
    fetch student profiles
    exclude already swiped students
    display candidate cards
```

## Swipe logic

```text
FUNCTION swipe(currentUser, targetId, direction):
  save swipe event

  IF direction == pass:
    move to next card
    return

  IF direction == like:
    check whether the target already liked currentUser

    IF target liked currentUser:
      create match
      notify both users
      open match success view

    ELSE:
      continue feed
```

## Match engine

```text
FUNCTION createMatch(userA, userB, context):
  generate matchId
  store match record
  initialize chat room
  initialize compliance record
  log analytics event

FUNCTION getMatches(userId):
  fetch all active matches for user
  sort by latest activity
  return match list
```

## Chat system

```text
FUNCTION openChat(matchId):
  fetch chat history
  show chat screen

FUNCTION sendMessage(matchId, senderId, text):
  validate text
  save message
  notify receiver

FUNCTION listenForMessages(matchId):
  update UI in real time when new messages arrive
```

## Compliance workflow

```text
FUNCTION initializeCompliance(matchId):
  create compliance record with statuses:
    schoolApproval = pending
    visaStatus = pending
    travelDocs = pending
    interviewScheduled = false
    readiness = not_ready

FUNCTION updateCompliance(matchId, step, status):
  update record

  IF all required steps complete:
    set readiness = ready
  ELSE:
    set readiness = in_progress
```

## Analytics

```text
FUNCTION trackEvent(eventName, payload):
  send event to analytics service

ON sign up:
  trackEvent("sign_up", role)

ON profile completion:
  trackEvent("profile_complete", role)

ON swipe:
  trackEvent("swipe", direction)

ON match:
  trackEvent("match_created", matchId)

ON message sent:
  trackEvent("message_sent", matchId)

ON compliance updated:
  trackEvent("compliance_updated", step)
```

## Notifications

```text
FUNCTION sendMatchNotification(userId, matchId):
  send push notification

FUNCTION sendMessageNotification(userId, matchId):
  send push notification

FUNCTION sendComplianceReminder(userId, matchId):
  send push notification if steps are incomplete
```

## Moderation

```text
FUNCTION reportUser(reporterId, targetUserId, reason):
  create report record

FUNCTION reviewReport(adminId, reportId):
  read report
  decide action:
    ignore
    warn
    suspend
    remove
```

## Security and access control

```text
FUNCTION canAccessProfile(requestingUserId, profileUserId):
  allow if user owns profile OR profile is public

FUNCTION canAccessMatch(requestingUserId, match):
  allow if user is part of match

FUNCTION canAccessChat(requestingUserId, match):
  allow if user is part of match

FUNCTION canEditCompliance(requestingUserId, match):
  allow if user is part of match OR admin
```

## Data lifecycle

```text
WHEN a user swipes:
  store swipe

WHEN a mutual like occurs:
  create match
  create chat room
  create compliance record

WHEN chat starts:
  store messages

WHEN compliance is completed:
  mark match as ready

WHEN user deletes account:
  deactivate profile
  archive or delete private data
```

## Architecture summary

```text
USER OPENS APP
  -> auth check
  -> onboarding if needed
  -> discovery feed

USER SWIPES
  -> swipe saved
  -> mutual like checked
  -> match created if both like

MATCH EXISTS
  -> chat enabled
  -> compliance enabled

USER COMPLETES WORKFLOW
  -> compliance status updated
  -> analytics tracked
  -> notifications sent
```

## Recommended first version

Focus the MVP on:

- authentication
- role-based onboarding
- discovery feed
- swipe and match
- chat
- simple compliance tracker

Delay until later:

- AI matching
- automated visa processing
- school portal integrations
- payment or subscription logic
- advanced moderation dashboards
