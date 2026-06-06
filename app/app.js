const defaultThreads = [
  {
    id: "thread-1",
    sender: "Maya Chen",
    company: "Northstar Client",
    subject: "Contract edits before Friday",
    time: "Today, 9:18 AM",
    categories: ["Needs Reply", "Due Soon"],
    project: "Northstar rollout",
    score: 96,
    summary: "Maya sent final contract notes and asked you to confirm the revised delivery terms before Friday afternoon.",
    reason: "Client sender, direct question, deadline inside 48 hours, and contract language.",
    nextStep: "Reply with approval or flag the delivery-term change.",
    due: "Friday 3:00 PM",
    status: "open"
  },
  {
    id: "thread-2",
    sender: "Jordan Lee",
    company: "Internal",
    subject: "Can you send the revised project timeline?",
    time: "Yesterday, 4:42 PM",
    categories: ["Needs Reply", "Maybe Forgotten"],
    project: "Operations planning",
    score: 89,
    summary: "Jordan asked for the revised project timeline. You opened the message yesterday but have not replied.",
    reason: "Direct request, read-but-not-answered signal, and project planning keyword.",
    nextStep: "Send the timeline or snooze until you can attach it.",
    due: "Today",
    status: "open"
  },
  {
    id: "thread-3",
    sender: "Avery Patel",
    company: "Finance",
    subject: "Invoice approval needed",
    time: "Today, 7:03 AM",
    categories: ["Due Soon", "Important Update"],
    project: "Vendor payments",
    score: 84,
    summary: "Finance needs approval on a vendor invoice so payment can be released this week.",
    reason: "Invoice keyword, payment impact, and internal finance sender.",
    nextStep: "Review the invoice and approve or ask for clarification.",
    due: "Tomorrow",
    status: "open"
  },
  {
    id: "thread-4",
    sender: "Sam Rivera",
    company: "Product",
    subject: "Waiting on API access confirmation",
    time: "Monday, 2:13 PM",
    categories: ["Waiting On Them", "Follow Up"],
    project: "Gmail integration",
    score: 78,
    summary: "You asked Sam for API access confirmation on Monday. There has not been a response.",
    reason: "You are waiting on someone else and the thread has been quiet for several days.",
    nextStep: "Send a short follow-up asking for access status.",
    due: "Today",
    status: "open"
  },
  {
    id: "thread-5",
    sender: "Google Workspace",
    company: "Google",
    subject: "Security alert settings changed",
    time: "Today, 12:08 PM",
    categories: ["Important Update"],
    project: "Account security",
    score: 71,
    summary: "A workspace security setting changed. No reply is needed, but the account update is worth reviewing.",
    reason: "Security-related system update with account impact.",
    nextStep: "Verify the change was expected.",
    due: "No deadline",
    status: "open"
  },
  {
    id: "thread-6",
    sender: "Newsletter Desk",
    company: "Marketing list",
    subject: "The week in productivity tools",
    time: "Yesterday, 8:00 AM",
    categories: ["Low Priority"],
    project: "Reading",
    score: 28,
    summary: "A general newsletter about productivity tools. No direct action required.",
    reason: "Newsletter format and no personal request.",
    nextStep: "Ignore unless you want to read it later.",
    due: "No deadline",
    status: "open"
  }
];

const defaultMemory = {
  people: ["Maya Chen", "Jordan Lee", "Avery Patel"],
  ignored: ["Newsletter Desk"],
  projects: ["Northstar rollout", "Gmail integration", "Vendor payments"],
  keywords: ["contract", "invoice", "deadline", "API access", "timeline"],
  lowPriority: ["newsletters", "generic product updates"],
  reminders: ["Immediate for direct questions", "Daily overview at 8:30 AM"]
};

const state = {
  threads: load("secondBrainThreads", defaultThreads),
  memory: load("secondBrainMemory", defaultMemory),
  feedback: load("secondBrainFeedback", []),
  view: "today",
  filter: "All",
  search: "",
  hideDone: true
};

const els = {
  date: document.querySelector("#currentDate"),
  viewTitle: document.querySelector("#viewTitle"),
  metrics: document.querySelector("#metricsGrid"),
  urgentList: document.querySelector("#urgentList"),
  followUpList: document.querySelector("#followUpList"),
  reviewList: document.querySelector("#reviewList"),
  memoryGrid: document.querySelector("#memoryGrid"),
  feedbackLog: document.querySelector("#feedbackLog"),
  search: document.querySelector("#searchInput"),
  searchBox: document.querySelector("#searchBox"),
  hideDone: document.querySelector("#hideDoneToggle"),
  toast: document.querySelector("#toast")
};

function load(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function save() {
  localStorage.setItem("secondBrainThreads", JSON.stringify(state.threads));
  localStorage.setItem("secondBrainMemory", JSON.stringify(state.memory));
  localStorage.setItem("secondBrainFeedback", JSON.stringify(state.feedback));
}

function todayLabel() {
  const formatter = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
  els.date.textContent = formatter.format(new Date());
}

function visibleThreads() {
  return state.threads
    .filter((thread) => !state.hideDone || thread.status !== "done")
    .filter((thread) => state.filter === "All" || thread.categories.includes(state.filter))
    .filter(matchesSearch)
    .sort((a, b) => b.score - a.score);
}

function matchesSearch(thread) {
  const query = state.search.trim().toLowerCase();
  if (!query) return true;
  return [
    thread.sender,
    thread.company,
    thread.subject,
    thread.summary,
    thread.project,
    thread.categories.join(" ")
  ].join(" ").toLowerCase().includes(query);
}

function metricData() {
  const open = state.threads.filter((thread) => thread.status !== "done");
  return [
    ["Urgent", open.filter((thread) => thread.score >= 85).length],
    ["Needs Reply", open.filter((thread) => thread.categories.includes("Needs Reply")).length],
    ["Follow Ups", open.filter((thread) => thread.categories.includes("Follow Up")).length],
    ["Due Soon", open.filter((thread) => thread.categories.includes("Due Soon")).length]
  ];
}

function renderMetrics() {
  els.metrics.innerHTML = metricData()
    .map(([label, value]) => `
      <article class="metric">
        <strong>${value}</strong>
        <span>${label}</span>
      </article>
    `)
    .join("");
}

function categoryClass(category) {
  if (category === "Needs Reply") return "urgent";
  if (category === "Due Soon") return "due";
  if (category === "Waiting On Them") return "waiting";
  return "";
}

function threadCard(thread, compact = false) {
  const pills = thread.categories
    .map((category) => `<span class="pill ${categoryClass(category)}">${category}</span>`)
    .join("");

  return `
    <article class="thread-card ${thread.status === "done" ? "done" : ""}">
      <div class="thread-head">
        <div>
          <div class="sender-line">
            <span class="sender">${thread.sender}</span>
            <span class="pill">${thread.company}</span>
          </div>
          <div class="subject">${thread.subject}</div>
        </div>
        <div class="score">${thread.score}</div>
      </div>
      <p class="summary">${thread.summary}</p>
      ${compact ? "" : `<p class="reason">${thread.reason}</p>`}
      <div class="pill-row">
        ${pills}
        <span class="pill">${thread.due}</span>
      </div>
      <div class="action-row">
        <button class="action-button" data-action="important" data-id="${thread.id}" type="button">Important</button>
        <button class="action-button" data-action="done" data-id="${thread.id}" type="button">Done</button>
        <button class="action-button" data-action="snooze" data-id="${thread.id}" type="button">Remind Later</button>
        <button class="action-button" data-action="not-important" data-id="${thread.id}" type="button">Not Important</button>
      </div>
    </article>
  `;
}

function emptyState(label) {
  return `<article class="thread-card"><p class="muted">${label}</p></article>`;
}

function renderToday() {
  const urgent = state.threads
    .filter((thread) => thread.status !== "done" && thread.score >= 70)
    .filter(matchesSearch)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
  const followUps = state.threads
    .filter((thread) => thread.status !== "done" && (thread.categories.includes("Follow Up") || thread.categories.includes("Waiting On Them") || thread.categories.includes("Maybe Forgotten")))
    .filter(matchesSearch)
    .sort((a, b) => b.score - a.score);

  els.urgentList.innerHTML = urgent.length ? urgent.map((thread) => threadCard(thread)).join("") : emptyState("No urgent work in the current scan.");
  els.followUpList.innerHTML = followUps.length ? followUps.map((thread) => threadCard(thread, true)).join("") : emptyState("No follow-ups are due right now.");
}

function renderReview() {
  const threads = visibleThreads();
  els.reviewList.innerHTML = threads.length ? threads.map((thread) => threadCard(thread)).join("") : emptyState("No threads match the current filters.");
}

function renderMemory() {
  const groups = [
    ["Important People", state.memory.people],
    ["Ignored Senders", state.memory.ignored],
    ["Active Projects", state.memory.projects],
    ["Priority Keywords", state.memory.keywords],
    ["Low Priority", state.memory.lowPriority],
    ["Reminder Rules", state.memory.reminders]
  ];

  els.memoryGrid.innerHTML = groups.map(([title, items]) => `
    <article class="memory-card">
      <h3>${title}</h3>
      <ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>
    </article>
  `).join("");

  els.feedbackLog.innerHTML = state.feedback.length
    ? state.feedback.slice(0, 8).map((item) => `
      <div class="feedback-item">
        <strong>${item.action}</strong> on ${item.subject}<br />
        <span>${item.time}</span>
      </div>
    `).join("")
    : `<div class="feedback-item">No corrections yet. Use the feedback buttons to train Second Brain.</div>`;
}

function render() {
  renderMetrics();
  renderToday();
  renderReview();
  renderMemory();
}

function setView(view) {
  state.view = view;
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  document.querySelectorAll(".view").forEach((panel) => panel.classList.remove("active"));
  document.querySelector(`#${view}View`).classList.add("active");
  const titles = { today: "Today", review: "Email Review", memory: "Memory", settings: "Settings" };
  els.viewTitle.textContent = titles[view];
  els.searchBox.classList.toggle("hidden", !["today", "review"].includes(view));
}

function addFeedback(action, thread) {
  state.feedback.unshift({
    action,
    subject: thread.subject,
    time: new Date().toLocaleString()
  });
}

function updateMemory(action, thread) {
  if (action === "important" && !state.memory.people.includes(thread.sender)) {
    state.memory.people.unshift(thread.sender);
  }
  if (action === "not-important" && !state.memory.lowPriority.includes(thread.company)) {
    state.memory.lowPriority.unshift(thread.company);
  }
}

function handleAction(action, id) {
  const thread = state.threads.find((item) => item.id === id);
  if (!thread) return;

  if (action === "important") {
    thread.score = Math.min(100, thread.score + 8);
    addFeedback("Marked important", thread);
    updateMemory(action, thread);
    toast("Second Brain will prioritize similar work.");
  }

  if (action === "done") {
    thread.status = "done";
    addFeedback("Marked done", thread);
    toast("Marked done.");
  }

  if (action === "snooze") {
    thread.status = "snoozed";
    addFeedback("Remind later", thread);
    toast("Reminder moved to later today.");
  }

  if (action === "not-important") {
    thread.score = Math.max(5, thread.score - 18);
    addFeedback("Marked not important", thread);
    updateMemory(action, thread);
    toast("Second Brain will lower similar items.");
  }

  save();
  render();
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(toast.timeout);
  toast.timeout = window.setTimeout(() => els.toast.classList.remove("show"), 2600);
}

async function enableNotifications() {
  if (!("Notification" in window)) {
    toast("This browser does not expose notification permissions.");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    toast("Alerts enabled.");
  } else {
    toast("Alerts were not enabled.");
  }
}

function sendTestAlert() {
  const thread = state.threads.sort((a, b) => b.score - a.score)[0];
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Second Brain", {
      body: `${thread.sender}: ${thread.nextStep}`
    });
  }
  toast(`${thread.sender}: ${thread.nextStep}`);
}

document.addEventListener("click", (event) => {
  const nav = event.target.closest(".nav-item");
  if (nav) setView(nav.dataset.view);

  const segment = event.target.closest(".segment");
  if (segment) {
    document.querySelectorAll(".segment").forEach((item) => item.classList.remove("active"));
    segment.classList.add("active");
    toast(`Scan window set to ${segment.dataset.window} days.`);
  }

  const tab = event.target.closest(".tab");
  if (tab) {
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    state.filter = tab.dataset.filter;
    renderReview();
  }

  const action = event.target.closest("[data-action]");
  if (action) handleAction(action.dataset.action, action.dataset.id);
});

document.querySelector("#notifyButton").addEventListener("click", enableNotifications);
document.querySelector("#simulateAlert").addEventListener("click", sendTestAlert);
document.querySelector("#resetMemory").addEventListener("click", () => {
  state.memory = structuredClone(defaultMemory);
  state.feedback = [];
  save();
  renderMemory();
  toast("Memory reset to the prototype defaults.");
});

els.search.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderToday();
  renderReview();
});

els.hideDone.addEventListener("change", (event) => {
  state.hideDone = event.target.checked;
  renderReview();
});

todayLabel();
render();
