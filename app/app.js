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
  trainingSummary: document.querySelector("#trainingSummary"),
  memoryGrid: document.querySelector("#memoryGrid"),
  feedbackLog: document.querySelector("#feedbackLog"),
  search: document.querySelector("#searchInput"),
  searchBox: document.querySelector("#searchBox"),
  hideDone: document.querySelector("#hideDoneToggle"),
  importFile: document.querySelector("#importFile"),
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function uniquePush(list, value) {
  const cleaned = String(value || "").trim();
  if (!cleaned) return false;
  const exists = list.some((item) => item.toLowerCase() === cleaned.toLowerCase());
  if (exists) return false;
  list.unshift(cleaned);
  return true;
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

function actionButton(action, id, label, extraClass = "") {
  return `<button class="action-button ${extraClass}" data-action="${action}" data-id="${escapeHtml(id)}" type="button">${label}</button>`;
}

function threadCard(thread, compact = false) {
  const pills = thread.categories
    .map((category) => `<span class="pill ${categoryClass(category)}">${escapeHtml(category)}</span>`)
    .join("");

  return `
    <article class="thread-card ${thread.status === "done" ? "done" : ""}">
      <div class="thread-head">
        <div>
          <div class="sender-line">
            <span class="sender">${escapeHtml(thread.sender)}</span>
            <span class="pill">${escapeHtml(thread.company)}</span>
          </div>
          <div class="subject">${escapeHtml(thread.subject)}</div>
        </div>
        <div class="score">${escapeHtml(thread.score)}</div>
      </div>
      <p class="summary">${escapeHtml(thread.summary)}</p>
      ${compact ? "" : `<p class="reason">${escapeHtml(thread.reason)}</p>`}
      <div class="pill-row">
        ${pills}
        <span class="pill">${escapeHtml(thread.due)}</span>
      </div>
      <div class="action-row">
        ${actionButton("important", thread.id, "Important")}
        ${actionButton("done", thread.id, "Done")}
        ${actionButton("snooze", thread.id, "Remind Later")}
        ${actionButton("not-important", thread.id, "Not Important")}
        ${actionButton("prioritize-sender", thread.id, "Prioritize Sender", "signal")}
        ${actionButton("ignore-sender", thread.id, "Ignore Sender", "signal")}
        ${actionButton("mark-project", thread.id, "This Is A Project", "signal")}
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
    ["Important People", "people", state.memory.people],
    ["Ignored Senders", "ignored", state.memory.ignored],
    ["Active Projects", "projects", state.memory.projects],
    ["Priority Keywords", "keywords", state.memory.keywords],
    ["Low Priority", "lowPriority", state.memory.lowPriority],
    ["Reminder Rules", "reminders", state.memory.reminders]
  ];

  const open = state.threads.filter((thread) => thread.status !== "done").length;
  els.trainingSummary.innerHTML = `
    <article class="training-stat">
      <strong>${state.feedback.length}</strong>
      <span class="muted">Feedback events</span>
    </article>
    <article class="training-stat">
      <strong>${memoryCount()}</strong>
      <span class="muted">Learned signals</span>
    </article>
    <article class="training-stat">
      <strong>${open}</strong>
      <span class="muted">Open thread states</span>
    </article>
  `;

  els.memoryGrid.innerHTML = groups.map(([title, key, items]) => `
    <article class="memory-card">
      <h3>${escapeHtml(title)}</h3>
      <div class="memory-list">
        ${items.length ? items.map((item) => `
          <span class="memory-chip">
            ${escapeHtml(item)}
            <button class="chip-remove" data-memory-remove="${key}" data-value="${escapeHtml(item)}" type="button" aria-label="Remove ${escapeHtml(item)}">x</button>
          </span>
        `).join("") : `<span class="muted">No rules yet.</span>`}
      </div>
      <form class="memory-form" data-memory-add="${key}">
        <input type="text" placeholder="Add signal" aria-label="Add ${escapeHtml(title)} signal" />
        <button class="ghost-button" type="submit">Add</button>
      </form>
    </article>
  `).join("");

  els.feedbackLog.innerHTML = state.feedback.length
    ? state.feedback.slice(0, 8).map((item) => `
      <div class="feedback-item">
        <strong>${escapeHtml(item.label || item.action || "Feedback")}</strong> on ${escapeHtml(item.subject)}<br />
        <span>${escapeHtml(item.signal || "Saved preference signal")} · ${escapeHtml(item.time)}</span>
      </div>
    `).join("")
    : `<div class="feedback-item">No corrections yet. Use the feedback buttons to train Second Brain.</div>`;
}

function memoryCount() {
  return Object.values(state.memory).reduce((total, item) => total + item.length, 0);
}

function render() {
  renderMetrics();
  renderToday();
  renderReview();
  renderMemory();
  bindActionButtons();
}

function bindActionButtons() {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.dataset.bound = "true";
    button.addEventListener("pointerdown", () => runButtonAction(button));
    button.addEventListener("click", () => runButtonAction(button));
  });
}

function runButtonAction(button) {
  const key = `${button.dataset.action}:${button.dataset.id}`;
  const now = Date.now();
  if (button.dataset.lastActionKey === key && now - Number(button.dataset.lastActionAt || 0) < 400) {
    return;
  }
  button.dataset.lastActionKey = key;
  button.dataset.lastActionAt = String(now);
  handleAction(button.dataset.action, button.dataset.id);
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

function addFeedback(action, label, thread, signal, beforeScore, afterScore) {
  state.feedback.unshift({
    id: `feedback-${Date.now()}`,
    action,
    label,
    threadId: thread.id,
    sender: thread.sender,
    company: thread.company,
    subject: thread.subject,
    categories: thread.categories,
    project: thread.project,
    signal,
    beforeScore,
    afterScore,
    time: new Date().toLocaleString(),
    timestamp: new Date().toISOString()
  });
}

function updateMemory(action, thread) {
  if (action === "important") uniquePush(state.memory.people, thread.sender);
  if (action === "not-important") uniquePush(state.memory.lowPriority, thread.company);
  if (action === "prioritize-sender") uniquePush(state.memory.people, thread.sender);
  if (action === "ignore-sender") uniquePush(state.memory.ignored, thread.sender);
  if (action === "mark-project") uniquePush(state.memory.projects, thread.project);
}

function handleAction(action, id) {
  const thread = state.threads.find((item) => item.id === id);
  if (!thread) return;
  const beforeScore = thread.score;
  let label = "";
  let signal = "";

  if (action === "important") {
    thread.score = Math.min(100, thread.score + 8);
    label = "Marked important";
    signal = "Boost similar senders, projects, and keywords.";
    updateMemory(action, thread);
    toast("Second Brain will prioritize similar work.");
  }

  if (action === "done") {
    thread.status = "done";
    label = "Marked done";
    signal = "Close this action item and preserve the decision history.";
    toast("Marked done.");
  }

  if (action === "snooze") {
    thread.status = "snoozed";
    label = "Remind later";
    signal = "Keep this item active but delay the reminder.";
    toast("Reminder moved to later today.");
  }

  if (action === "not-important") {
    thread.score = Math.max(5, thread.score - 18);
    label = "Marked not important";
    signal = "Lower similar senders, companies, or categories.";
    updateMemory(action, thread);
    toast("Second Brain will lower similar items.");
  }

  if (action === "prioritize-sender") {
    thread.score = Math.min(100, thread.score + 12);
    label = "Always prioritize sender";
    signal = `${thread.sender} added to important people.`;
    updateMemory(action, thread);
    toast(`${thread.sender} will be prioritized.`);
  }

  if (action === "ignore-sender") {
    thread.score = Math.max(5, thread.score - 35);
    label = "Ignore sender";
    signal = `${thread.sender} added to ignored senders.`;
    updateMemory(action, thread);
    toast(`${thread.sender} will be ignored.`);
  }

  if (action === "mark-project") {
    thread.score = Math.min(100, thread.score + 6);
    label = "Marked as project";
    signal = `${thread.project} added to active projects.`;
    updateMemory(action, thread);
    toast(`${thread.project} is now an active project.`);
  }

  addFeedback(action, label, thread, signal, beforeScore, thread.score);

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

function exportTrainingData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    memory: state.memory,
    feedbackEvents: state.feedback,
    threadState: state.threads
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "second-brain-training-data.json";
  link.click();
  URL.revokeObjectURL(url);
  toast("Training data exported.");
}

function importTrainingData(file) {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const payload = JSON.parse(reader.result);
      if (!payload.memory || !payload.feedbackEvents || !payload.threadState) {
        throw new Error("Missing expected training data keys.");
      }
      state.memory = payload.memory;
      state.feedback = payload.feedbackEvents;
      state.threads = payload.threadState;
      save();
      render();
      toast("Training data imported.");
    } catch {
      toast("That JSON file does not match the training data format.");
    }
  });
  reader.readAsText(file);
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

  const remove = event.target.closest("[data-memory-remove]");
  if (remove) {
    const key = remove.dataset.memoryRemove;
    const value = remove.dataset.value;
    state.memory[key] = state.memory[key].filter((item) => item !== value);
    save();
    renderMemory();
    toast("Memory signal removed.");
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-memory-add]");
  if (!form) return;
  event.preventDefault();
  const input = form.querySelector("input");
  const key = form.dataset.memoryAdd;
  if (uniquePush(state.memory[key], input.value)) {
    input.value = "";
    save();
    renderMemory();
    toast("Memory signal added.");
  } else {
    toast("That signal is already saved.");
  }
});

document.querySelector("#notifyButton").addEventListener("click", enableNotifications);
document.querySelector("#simulateAlert").addEventListener("click", sendTestAlert);
document.querySelector("#exportData").addEventListener("click", exportTrainingData);
document.querySelector("#importData").addEventListener("click", () => els.importFile.click());
els.importFile.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) importTrainingData(file);
  event.target.value = "";
});
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
