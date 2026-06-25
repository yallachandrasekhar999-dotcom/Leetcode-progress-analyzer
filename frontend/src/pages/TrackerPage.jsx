import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import { TrendingUp, RefreshCw, Calendar } from "lucide-react";
import { useUser } from "../context/UserContext";
import { fetchProfile } from "../services/api";

const customTooltipStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  color: "var(--text-primary)",
};

function buildMonthlyData(dailyStats) {
  if (!dailyStats || dailyStats.length === 0) return [];
  const byMonth = {};
  dailyStats.forEach((d) => {
    const month = d.date?.slice(0, 7);
    if (!month) return;
    if (!byMonth[month]) byMonth[month] = { month, easy: 0, medium: 0, hard: 0, total: 0 };
    const prev = byMonth[month];
    byMonth[month] = {
      ...prev,
      easy:   Math.max(prev.easy,   d.easy_solved),
      medium: Math.max(prev.medium, d.medium_solved),
      hard:   Math.max(prev.hard,   d.hard_solved),
      total:  Math.max(prev.total,  d.total_solved),
    };
  });
  return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));
}

export default function TrackerPage() {
  const { username, profileData } = useUser();
  const navigate = useNavigate();
  const [dailyStats, setDailyStats] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("line");

  useEffect(() => {
    if (!username) { navigate("/"); return; }
    if (profileData) {
      setDailyStats(profileData.daily_stats || []);
      setProfile(profileData.profile);
    } else {
      loadData();
    }
  }, [username, profileData]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchProfile(username);
      setDailyStats(res.daily_stats || []);
      setProfile(res.profile);
    } finally {
      setLoading(false);
    }
  };

  const monthly = buildMonthlyData(dailyStats);

  // Growth calculation
  const firstEntry = dailyStats[0];
  const lastEntry  = dailyStats[dailyStats.length - 1];
  const growth = firstEntry && lastEntry
    ? lastEntry.total_solved - firstEntry.total_solved
    : 0;

  return (
    <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="section-title">Progress Tracker</h1>
          <p className="section-subtitle">Your growth over time</p>
        </div>
        <button onClick={loadData} className="btn-ghost">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary stats */}
      {profile && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="stat-card text-center">
            <p className="text-3xl font-extrabold text-brand-400">{profile.total_solved}</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Total Solved</p>
          </div>
          <div className="stat-card text-center">
            <p className="text-3xl font-extrabold text-easy">+{growth}</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Since Tracking</p>
          </div>
          <div className="stat-card text-center">
            <p className="text-3xl font-extrabold text-medium">{dailyStats.length}</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Days Tracked</p>
          </div>
          <div className="stat-card text-center">
            <p className="text-3xl font-extrabold text-hard">{profile.streak || 0}</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Day Streak</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h3 className="section-title text-lg">Solve History</h3>
          <div className="flex gap-2">
            {["line", "bar"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`tab-pill ${activeTab === t ? "active" : ""}`}
              >
                {t === "line" ? "Line Chart" : "Bar Chart"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-64 skeleton rounded-xl" />
        ) : monthly.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <Calendar className="w-12 h-12 opacity-30" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No history yet — check back after solving some problems!
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            {activeTab === "line" ? (
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="easy"   stroke="#00b8a3" strokeWidth={2} dot={{ r: 4 }} name="Easy" />
                <Line type="monotone" dataKey="medium" stroke="#ffc01e" strokeWidth={2} dot={{ r: 4 }} name="Medium" />
                <Line type="monotone" dataKey="hard"   stroke="#ff375f" strokeWidth={2} dot={{ r: 4 }} name="Hard" />
                <Line type="monotone" dataKey="total"  stroke="#6371f6" strokeWidth={2.5} dot={{ r: 5 }} name="Total" strokeDasharray="5 2" />
              </LineChart>
            ) : (
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend />
                <Bar dataKey="easy"   fill="#00b8a3" radius={[4,4,0,0]} name="Easy" />
                <Bar dataKey="medium" fill="#ffc01e" radius={[4,4,0,0]} name="Medium" />
                <Bar dataKey="hard"   fill="#ff375f" radius={[4,4,0,0]} name="Hard" />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Difficulty breakdown over all time */}
      {profile && (
        <div className="card animate-slide-up">
          <h3 className="section-title text-lg mb-4">All-Time Difficulty Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: "Easy",   value: profile.easy_solved,   total: 842,  color: "#00b8a3" },
              { label: "Medium", value: profile.medium_solved, total: 1765, color: "#ffc01e" },
              { label: "Hard",   value: profile.hard_solved,   total: 775,  color: "#ff375f" },
            ].map(({ label, value, total, color }) => {
              const pct = Math.round((value / total) * 100);
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{label}</span>
                    <span style={{ color: "var(--text-muted)" }}>
                      {value} / {total} &nbsp;·&nbsp;
                      <span className="font-bold" style={{ color }}>{pct}%</span>
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
