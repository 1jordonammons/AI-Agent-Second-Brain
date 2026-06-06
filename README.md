# AI Agent Second Brain

Second Brain is a Gmail-first AI work memory agent that helps you avoid missing important emails, follow-ups, deadlines, and commitments.

The goal is to create a personal work brain that reads your recent email flow, understands what matters, remembers what you may forget, and reminds you before important work slips.

## MVP Focus

The first version will be a web dashboard that:

- Reviews recent Gmail inbox, sent mail, and active threads
- Finds emails that need replies or follow-ups
- Detects deadlines, commitments, questions, and important updates
- Ranks threads by personal importance
- Shows clear summaries and suggested next steps
- Lets the user train the AI with feedback buttons
- Sends reminders for urgent or forgotten work

## Core Views

- Today: urgent items, needed replies, follow-ups, due soon, and maybe-forgotten threads
- Email Review: AI-ranked Gmail threads with summaries and reasons
- Memory: important people, projects, learned rules, and ignored categories
- Settings: Gmail connection, notification rules, scan window, and privacy controls

## Learning Loop

Second Brain should learn from actions like:

- Important
- Not Important
- Done
- Remind Later
- Always Prioritize Sender
- Ignore Sender
- This Is A Project
- Not Work Related

Over time, those decisions should shape a personal preference profile for senders, projects, keywords, reminder timing, and low-priority categories.

## Privacy Guardrails

For version one:

- The app reads Gmail only after explicit authorization.
- It does not send emails automatically.
- It does not delete, archive, or modify Gmail messages.
- It stores summaries, action items, reminders, and learned preferences.
- It should avoid storing full email bodies long-term.
- The user can inspect and delete learned memory.

## Build Plan

1. Static dashboard prototype with mock Gmail data
2. Gmail OAuth and recent thread fetching
3. AI summarization, classification, and importance scoring
4. Feedback buttons and learned preferences
5. Reminders, snooze, daily overview, and immediate alerts
6. Safari-friendly surface such as a Safari extension, Mac menu-bar app, or persistent desktop notification surface

## Current Prototype

The first static dashboard prototype lives in `app/`.

It includes:

- Today, Email Review, Memory, and Settings views
- Mock Gmail thread data
- Priority scoring and category labels
- Search and category filters
- Feedback actions for Important, Done, Remind Later, and Not Important
- Learned memory and feedback log state using browser local storage
- Browser notification permission and test alert controls

To run it locally:

```sh
python3 -m http.server 4173 --directory app
```

Then open:

```text
http://localhost:4173
```

## Blueprint

The full MVP blueprint is here:

[outputs/second-brain-mvp-blueprint.md](outputs/second-brain-mvp-blueprint.md)
