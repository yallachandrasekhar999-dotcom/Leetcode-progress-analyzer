/**
 * NotificationService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Schedules 5 daily browser notifications + keeps an in-app inbox.
 *
 * Daily schedule (user's local time):
 *   Morning  1 → 07:00
 *   Morning  2 → 11:00  (4 hrs after Morning 1)
 *   Afternoon  → 14:00
 *   Evening    → 18:00
 *   Night      → 21:30
 */

const MAX_INBOX = 30;

// Per-user storage keys — each profile gets its own isolated inbox
const storageKey = (username) => `lpa_notifications_${username}`;
const seenKey    = (username) => `lpa_notif_seen_${username}`;

// ─── Schedule slots [hour, minute] ──────────────────────────────────────────
export const SCHEDULE = [
  { id: "morning1",   hour: 7,  minute: 0,  label: "🌅 Morning"   },
  { id: "morning2",   hour: 11, minute: 0,  label: "☀️ Mid Morning" },
  { id: "afternoon",  hour: 14, minute: 0,  label: "🌤️ Afternoon"  },
  { id: "evening",    hour: 18, minute: 0,  label: "🌆 Evening"    },
  { id: "night",      hour: 21, minute: 30, label: "🌙 Night"      },
];

// ─── Profile-based tip generators ───────────────────────────────────────────
function getTips(profile) {
  const tips = [];

  const totalSolved  = profile?.total_solved   ?? 0;
  const easySolved   = profile?.easy_solved    ?? 0;
  const mediumSolved = profile?.medium_solved  ?? 0;
  const hardSolved   = profile?.hard_solved    ?? 0;
  const streak       = profile?.streak         ?? 0;
  const rating       = profile?.contest_rating ?? 0;
  const acceptance   = profile?.acceptance_rate ?? 0;
  const username     = profile?.username       ?? "coder";

  // Streak-based
  if (streak === 0) {
    tips.push("🔥 No active streak — solve at least 1 problem today to start one!");
    tips.push("💡 Consistency beats intensity. One problem a day keeps rust away.");
  } else if (streak < 7) {
    tips.push(`🔥 ${streak}-day streak! Keep going — 7 days unlocks a milestone mindset.`);
    tips.push("⚡ Small daily habits compound into massive skill gains. Don't break the chain!");
  } else if (streak < 30) {
    tips.push(`🏆 Amazing ${streak}-day streak, ${username}! You're in the top percentile of consistency.`);
    tips.push("💪 30-day streaks are rare. You're almost there — don't stop now!");
  } else {
    tips.push(`🌟 ${streak}-day streak! You're a LeetCode legend. Teach someone today.`);
  }

  // Difficulty balance
  if (mediumSolved < easySolved * 0.5) {
    tips.push("📈 You've mastered Easy problems — time to tackle more Mediums. They're where real interviews happen!");
    tips.push("🎯 Tip: Pick a Medium problem you've seen before and try solving it without hints today.");
  }
  if (hardSolved < 5) {
    tips.push("💥 Try one Hard problem this week — even reading the solution teaches you advanced patterns.");
    tips.push("🧠 Hard problems build intuition faster than 10 Easy problems combined.");
  }
  if (easySolved > 100 && mediumSolved < 30) {
    tips.push("⚠️ Your Easy:Medium ratio is lopsided. Interviewers rarely ask Easy problems. Level up!");
  }

  // Total solved milestones
  if (totalSolved < 50) {
    tips.push(`🚀 You've solved ${totalSolved} problems. First milestone: reach 50! You're ${50 - totalSolved} away.`);
  } else if (totalSolved < 100) {
    tips.push(`🎯 ${totalSolved} solved! The 100-problem mark changes how you think about algorithms.`);
  } else if (totalSolved < 200) {
    tips.push(`💯 ${totalSolved} problems solved! At 200 you'll start recognising patterns automatically.`);
  } else if (totalSolved < 500) {
    tips.push(`🔥 ${totalSolved} problems! You're in the top 20% of LeetCoders. Keep pushing.`);
  } else {
    tips.push(`🏅 ${totalSolved} problems solved — elite territory! Consider contributing to open source now.`);
  }

  // Acceptance rate
  if (acceptance < 40) {
    tips.push("🎯 Your acceptance rate is low — focus on planning before coding. Write pseudocode first.");
    tips.push("💡 Read the problem twice, trace through examples manually before writing a single line.");
  } else if (acceptance > 65) {
    tips.push(`✅ ${acceptance}% acceptance rate — excellent! You're writing high-quality solutions.`);
  }

  // Contest rating
  if (rating > 0 && rating < 1500) {
    tips.push("🏆 For contests: practice solving Easy+Medium within 20 mins each. Speed matters!");
  } else if (rating >= 1500 && rating < 2000) {
    tips.push(`🌟 Rating ${Math.round(rating)} — solid! Focus on contest Hard problems to break 2000.`);
  } else if (rating >= 2000) {
    tips.push(`🥇 Rating ${Math.round(rating)} — you're a Candidate Master level coder!`);
  }

  // General algorithmic tips (always fresh)
  const generalTips = [
    "🧩 Pattern of the day: Two Pointers. Master it → solve 30+ problems automatically.",
    "📚 Study one algorithm deeply per week rather than many shallowly.",
    "⏱️ Timed practice: set a 25-min timer per problem. No peeking at hints!",
    "🗺️ Visualize your recursion tree before coding recursive solutions.",
    "🔄 After solving, always ask: can I do it in O(1) space? Can I do it in O(n) time?",
    "📝 Write your complexity analysis as a comment — it forces clarity.",
    "🤝 Explain your solution aloud to yourself. If you can't, you don't understand it yet.",
    "🔍 Binary search is not just for sorted arrays — it's a search space strategy.",
    "🌊 Sliding window = two pointers on a subarray. Recognize this pattern!",
    "🏗️ DP = recursion + memoization. Always start with the recursive solution first.",
    "🔗 Linked list trick: draw the pointers before updating them. Prevent lost references.",
    "🌳 For trees: ask yourself — do I need DFS or BFS? Depth vs breadth tells you.",
    "📊 Heap (priority queue) is your go-to for Top-K, median, and streaming problems.",
    "🗺️ Graph tip: Always clarify if the graph is directed, weighted, and if cycles exist.",
    "🎯 Greedy tip: sort first, then scan. Most greedy solutions follow this pattern.",
  ];

  // Shuffle and add some general tips
  const shuffled = generalTips.sort(() => Math.random() - 0.5);
  tips.push(...shuffled.slice(0, 4));

  return tips;
}

// Broadcast so NotificationPanel refreshes immediately without polling
function dispatchInboxUpdate(username) {
  window.dispatchEvent(new CustomEvent("lpa-notif-updated", { detail: { username } }));
}

// ─── Inbox persistence (per-username) ──────────────────────────────────────
export function getInbox(username) {
  if (!username) return [];
  try {
    return JSON.parse(localStorage.getItem(storageKey(username)) || "[]");
  } catch {
    return [];
  }
}

function saveInbox(username, items) {
  if (!username) return;
  localStorage.setItem(storageKey(username), JSON.stringify(items.slice(0, MAX_INBOX)));
}

export function markAllRead(username) {
  if (!username) return;
  const inbox = getInbox(username).map((n) => ({ ...n, read: true }));
  saveInbox(username, inbox);
  dispatchInboxUpdate(username);
}

export function clearInbox(username) {
  if (!username) return;
  saveInbox(username, []);
  dispatchInboxUpdate(username);
}

function addToInbox(username, notification) {
  if (!username) return;
  const inbox = getInbox(username);
  inbox.unshift({ ...notification, read: false, id: Date.now() + Math.random() });
  saveInbox(username, inbox);
  dispatchInboxUpdate(username);
}

// ─── Browser notification ────────────────────────────────────────────────────
async function requestPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function sendBrowserNotification(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "lpa-tip",
      renotify: true,
    });
  }
}

// ─── Milliseconds until next occurrence of [hour:minute] today/tomorrow ──────
function msUntil(hour, minute) {
  const now  = new Date();
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1); // schedule for tomorrow
  return next - now;
}

// ─── Scheduler ───────────────────────────────────────────────────────────────
const _timers = [];

export function startNotificationScheduler(profileRef, usernameRef) {
  // Clear any previous timers
  _timers.forEach(clearTimeout);
  _timers.length = 0;

  requestPermission();

  function scheduleSlot(slot) {
    const delay = msUntil(slot.hour, slot.minute);

    const timer = setTimeout(async () => {
      const profile  = profileRef.current;
      const username = usernameRef.current;
      const tips     = getTips(profile);
      const tip      = tips[Math.floor(Math.random() * tips.length)];
      const title    = `${slot.label} — LeetCode Tip`;

      // Add to this user's in-app inbox
      addToInbox(username, { title, body: tip, time: new Date().toISOString(), slot: slot.id });

      // Fire browser notification
      sendBrowserNotification(title, tip);

      // Re-schedule for same time tomorrow
      scheduleSlot(slot);
    }, delay);

    _timers.push(timer);
  }

  SCHEDULE.forEach(scheduleSlot);
}

export function stopNotificationScheduler() {
  _timers.forEach(clearTimeout);
  _timers.length = 0;
}

// ─── Seed today's notifications if first run of the day for this user ────────
export function seedTodayIfNeeded(username, profile) {
  if (!username) return;
  const today      = new Date().toDateString();
  const lastSeeded = localStorage.getItem(seenKey(username));
  if (lastSeeded === today) return;

  localStorage.setItem(seenKey(username), today);
  const tips     = getTips(profile);
  const shuffled = [...tips].sort(() => Math.random() - 0.5);

  SCHEDULE.forEach((slot, i) => {
    const slotTime = new Date();
    slotTime.setHours(slot.hour, slot.minute, 0, 0);
    const now = new Date();

    // Only seed past slots so inbox shows history for times already passed today
    if (slotTime < now) {
      addToInbox(username, {
        title: `${slot.label} — LeetCode Tip`,
        body:  shuffled[i % shuffled.length],
        time:  slotTime.toISOString(),
        slot:  slot.id,
      });
    }
  });
}

// ─── Instant seed with generic tips (no profile needed) ──────────────────────
// Called immediately on username switch so inbox is populated BEFORE the API responds.
const genericSeenKey = (username) => `lpa_notif_generic_${username}`;

export function seedGenericImmediate(username) {
  if (!username) return;
  // Only seed generic once per day per user
  const today      = new Date().toDateString();
  const lastSeeded = localStorage.getItem(genericSeenKey(username));
  if (lastSeeded === today) return;

  // If personalised seed already ran today, skip (it's richer)
  const alreadyPersonalised = localStorage.getItem(seenKey(username)) === today;
  if (alreadyPersonalised) return;

  localStorage.setItem(genericSeenKey(username), today);

  const genericTips = [
    "🧩 Pattern of the day: Two Pointers. Master it → solve 30+ problems automatically.",
    "📚 Study one algorithm deeply per week rather than many shallowly.",
    "⏱️ Timed practice: set a 25-min timer per problem. No peeking at hints!",
    "🗺️ Visualize your recursion tree before coding recursive solutions.",
    "🔄 After solving, ask: can I do it in O(1) space? Can I do it in O(n) time?",
    "📝 Write your complexity analysis as a comment — it forces clarity.",
    "🤝 Explain your solution aloud. If you can't, you don't understand it yet.",
    "🔍 Binary search isn't just for arrays — it's a search-space strategy.",
    "🌊 Sliding window = two pointers on a subarray. Recognize this pattern!",
    "🏗️ DP = recursion + memoization. Always start with the recursive solution.",
    "🔥 Solve at least 1 problem today to keep your streak alive!",
    "💡 Consistency beats intensity. One problem a day keeps rust away.",
    "🎯 Pick a Medium problem you've seen and solve it without hints today.",
    "💥 Try one Hard problem this week — the solution teaches advanced patterns.",
    "📈 Easy problems mastered? Time to tackle more Mediums!",
  ];
  const shuffled = [...genericTips].sort(() => Math.random() - 0.5);

  SCHEDULE.forEach((slot, i) => {
    const slotTime = new Date();
    slotTime.setHours(slot.hour, slot.minute, 0, 0);
    if (slotTime < new Date()) {
      addToInbox(username, {
        title: `${slot.label} — LeetCode Tip`,
        body:  shuffled[i % shuffled.length],
        time:  slotTime.toISOString(),
        slot:  slot.id,
      });
    }
  });
}

