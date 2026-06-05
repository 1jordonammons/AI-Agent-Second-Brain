# Second Brain: Work Memory Agent

## Product Promise

Second Brain is a Gmail-first AI work memory agent that reads your recent email flow, understands what matters, remembers what you might forget, and reminds you before important work slips.

It is not just an inbox summarizer. It is a personal work memory layer for replies, follow-ups, deadlines, commitments, and important people.

## Version 1 Goal

Build a web dashboard that connects to Gmail, reviews recent inbox and sent threads, extracts important action items and follow-ups, ranks them by personal importance, and lets the user train the AI with feedback buttons.

## Primary User

A busy professional who forgets emails, misses follow-ups, or loses track of work commitments across inbox and sent mail.

## Core Jobs

1. Notice important emails even after they have already been read.
2. Track what needs a reply.
3. Track what the user is waiting on from someone else.
4. Detect deadlines, meetings, promises, and commitments.
5. Surface immediate alerts for urgent items.
6. Provide a daily overview of the most important work.
7. Learn from user feedback over time.

## Gmail Scope

Version 1 reads:

- Inbox
- Sent mail
- Read emails
- Unread emails
- Active threads
- Recent threads from the last 7 days by default

Optional settings:

- Review last 14 days
- Review last 30 days
- Include archived threads
- Exclude newsletters or promotions

## What The AI Extracts

For each thread, the AI should extract:

- Summary
- Main people involved
- Company or project, if obvious
- Action required
- Suggested next step
- Deadline or date, if present
- Whether the user needs to reply
- Whether someone else needs to reply
- Whether the thread may have been forgotten
- Importance score
- Reason for the score
- Reminder recommendation

## Thread Categories

Each thread can belong to one or more categories:

- Needs Reply
- Follow Up
- Waiting On Them
- Due Soon
- Important Update
- Maybe Forgotten
- Low Priority
- Ignore

## Importance Signals

The AI should consider:

- Sender importance
- Direct questions
- Deadlines
- Meetings
- Money, invoices, contracts, clients, or legal language
- Promises made by the user
- Promises made to the user
- Repeated project names
- Long gaps without a response
- Emails the user read but did not act on
- User feedback from previous decisions

## Learning System

The user teaches Second Brain through simple buttons:

- Important
- Not Important
- Done
- Remind Later
- Always Prioritize Sender
- Ignore Sender
- This Is A Project
- Not Work Related

Learning should update a user preference profile that stores:

- Important people
- Ignored people
- Important companies
- Active projects
- Low-priority categories
- Keywords that often matter
- Keywords that usually do not matter
- Reminder timing preferences

## Dashboard Screens

### Today

The main work screen.

Sections:

- Urgent Now
- Needs Reply
- Follow Ups
- Waiting On Them
- Due Soon
- Maybe Forgotten

Each item shows:

- Sender
- Subject
- Short summary
- Why it matters
- Suggested next step
- Due date or follow-up date
- Feedback buttons

### Email Review

A ranked list of recent Gmail threads.

Useful for scanning what the AI found and correcting decisions.

### Memory

The user's editable AI memory.

Shows:

- Important people
- Ignored senders
- Active projects
- Learned rules
- Common topics
- Reminder preferences

The user can edit or delete any memory.

### Settings

Controls:

- Gmail connection
- Scan window
- Notification preferences
- Daily digest time
- Work hours
- Privacy/storage settings
- AI model settings

## Notifications

Version 1 supports:

- Immediate browser or desktop notification for urgent items
- Daily overview
- Snoozed reminders
- Follow-up reminders

Immediate alerts should trigger when:

- A high-priority sender asks a question
- A deadline is close
- A thread needs reply and has gone quiet
- The user promised something and no action is detected
- A client, contract, invoice, meeting, or urgent blocker appears

## Privacy Guardrails

Version 1 should:

- Ask for Gmail permission explicitly.
- Read email only after user authorization.
- Never send emails automatically.
- Never delete, archive, or modify Gmail messages.
- Store summaries, action items, reminders, and preferences.
- Avoid storing full email bodies long-term.
- Let the user inspect and delete learned memory.
- Let the user disconnect Gmail.

## Suggested Technical Architecture

### Frontend

- Next.js or React web dashboard
- Browser notification support
- Responsive layout for desktop-first use

### Backend

- Next.js API routes or Node API
- Gmail OAuth
- Gmail API thread fetcher
- AI classification pipeline
- Reminder scheduler

### Database

Start with SQLite for MVP.

Tables:

- users
- gmail_accounts
- email_threads
- email_messages
- ai_thread_reviews
- action_items
- reminders
- user_preferences
- feedback_events

### AI Pipeline

1. Fetch recent Gmail threads.
2. Normalize thread data.
3. Summarize each thread.
4. Classify action state.
5. Score importance using user preferences.
6. Store structured review.
7. Display review in dashboard.
8. Update preferences from feedback.

## MVP Milestones

### Milestone 1: Static Prototype

Build the dashboard UI with mocked email data.

Goal:

Show what Second Brain feels like before connecting Gmail.

### Milestone 2: Gmail Connection

Add Gmail OAuth and fetch recent inbox/sent threads.

Goal:

Display real Gmail threads in the Email Review screen.

### Milestone 3: AI Review

Add AI summarization, classification, and importance scoring.

Goal:

Show Needs Reply, Follow Up, Waiting On Them, and Due Soon.

### Milestone 4: Feedback Learning

Add feedback buttons and user preference updates.

Goal:

The system starts adapting to user choices.

### Milestone 5: Reminders

Add reminders, snooze, daily overview, and immediate alerts.

Goal:

Second Brain begins acting like a work memory assistant.

### Milestone 6: Safari-Friendly Surface

Explore a Safari extension, Mac menu-bar app, or persistent desktop notification surface.

Goal:

Make Second Brain visible where the user naturally works.

## First Build Recommendation

Start with Milestone 1: a polished static dashboard using mock Gmail data.

This avoids OAuth complexity at the beginning and lets us design the actual experience first. Once the dashboard feels right, connect Gmail and replace mock data with real threads.
