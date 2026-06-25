import { useEffect, useRef, useState } from "react";
import { Bell, X, CheckCheck, Trash2, Clock } from "lucide-react";
import { useUser } from "../../context/UserContext";
import {
  getInbox, markAllRead, clearInbox, SCHEDULE,
} from "../../services/notifications";

function timeLabel(isoString) {
  const d = new Date(isoString);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function nextScheduleLabel() {
  const now = new Date();
  const upcoming = SCHEDULE.map((s) => {
    const t = new Date();
    t.setHours(s.hour, s.minute, 0, 0);
    if (t <= now) t.setDate(t.getDate() + 1);
    return { label: s.label, t };
  }).sort((a, b) => a.t - b.t)[0];

  if (!upcoming) return null;
  const h = upcoming.t.getHours().toString().padStart(2, "0");
  const m = upcoming.t.getMinutes().toString().padStart(2, "0");
  return `${upcoming.label} at ${h}:${m}`;
}

export default function NotificationPanel() {
  // Always read username from context — panel is per-user aware
  const { username } = useUser();

  const [open, setOpen] = useState(false);
  const [inbox, setInbox] = useState([]);
  const panelRef = useRef(null);

  // Re-read inbox whenever username changes or panel opens
  const refresh = () => setInbox(getInbox(username));

  useEffect(() => {
    refresh();
    // Close panel and reset when user switches so stale badge clears
    setOpen(false);
  }, [username]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refresh();
    // Listen for instant inbox updates (fires on every addToInbox / markAllRead / clearInbox)
    function onUpdate(e) {
      if (e.detail?.username === username) refresh();
    }
    window.addEventListener("lpa-notif-updated", onUpdate);
    // Fallback poll every 60s (catches cross-tab changes)
    const interval = setInterval(refresh, 60000);
    return () => {
      window.removeEventListener("lpa-notif-updated", onUpdate);
      clearInterval(interval);
    };
  }, [username]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close when clicking outside
  useEffect(() => {
    function onOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  const unread = inbox.filter((n) => !n.read).length;

  const handleOpen = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    // Mark as read for THIS user only when opening
    if (nextOpen && unread > 0) {
      markAllRead(username);
      setTimeout(refresh, 50);
    }
  };

  const handleClear = () => {
    clearInbox(username);
    refresh();
  };

  const next = nextScheduleLabel();

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        id="notification-bell"
        onClick={handleOpen}
        className="w-10 h-10 rounded-xl flex items-center justify-center relative transition-all duration-200 hover:scale-110 active:scale-95"
        style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span
            className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-0.5 bg-brand-500 rounded-full
                       flex items-center justify-center text-[9px] font-bold text-white animate-pulse-slow"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div
            className="absolute right-0 mt-2 w-80 z-50 rounded-2xl border shadow-2xl animate-slide-up overflow-hidden"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-400" />
                <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                  Notifications
                </span>
                {username && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-medium">
                    @{username}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {inbox.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    title="Clear all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Next notification info */}
            {next && (
              <div
                className="flex items-center gap-2 px-4 py-2 text-[11px]"
                style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}
              >
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>Next tip: <span className="font-semibold text-brand-400">{next}</span></span>
              </div>
            )}

            {/* Notification list */}
            <div className="overflow-y-auto max-h-[340px]">
              {inbox.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <span className="text-3xl">🔔</span>
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                    No notifications yet
                  </p>
                  <p className="text-xs text-center px-6" style={{ color: "var(--text-muted)" }}>
                    Daily tips will appear here based on your LeetCode profile
                  </p>
                </div>
              ) : (
                <ul>
                  {inbox.map((n) => (
                    <li
                      key={n.id}
                      className="flex gap-3 px-4 py-3 border-b transition-colors hover:bg-[var(--bg-secondary)]/50"
                      style={{ borderColor: "var(--border)" }}
                    >
                      {/* Unread dot */}
                      <div className="flex-shrink-0 mt-1">
                        {n.read ? (
                          <div className="w-2 h-2 rounded-full bg-transparent border border-[var(--border)]" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-brand-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold mb-0.5" style={{ color: "var(--text-muted)" }}>
                          {n.title}
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                          {n.body}
                        </p>
                        <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                          {timeLabel(n.time)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div
              className="px-4 py-2.5 border-t flex items-center justify-between"
              style={{ borderColor: "var(--border)" }}
            >
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                5 tips daily · personalised for you
              </span>
              <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                <CheckCheck className="w-3 h-3" /> Auto-scheduled
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
