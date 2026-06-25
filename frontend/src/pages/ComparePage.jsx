import { useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { GitCompare, Search, RefreshCw, Trophy, Flame, Star, CheckCircle } from "lucide-react";
import { compareProfiles } from "../services/api";

const customTooltipStyle = {
  backgroundColor: "#1a1b2e",
  border: "1px solid #2f3244",
  borderRadius: "12px",
  color: "#e8e9f3",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  padding: "10px 14px",
};

function UserBadge({ profile, color }) {
  return (
    <div className="card flex flex-col items-center text-center animate-slide-up">
      <div className="relative">
        <img
          src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}&backgroundColor=${color.slice(1)}`}
          alt={profile.username}
          className="w-16 h-16 rounded-2xl ring-4 shadow-lg"
          style={{ ringColor: color }}
        />
      </div>
      <h3 className="text-lg font-extrabold mt-3" style={{ color: "var(--text-primary)" }}>
        {profile.real_name || profile.username}
      </h3>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>@{profile.username}</p>
      <div className="grid grid-cols-3 gap-2 mt-4 w-full">
        {[
          { label: "Total", value: profile.total_solved, icon: CheckCircle, col: "text-brand-400" },
          { label: "Streak", value: profile.streak || 0, icon: Flame, col: "text-accent-500" },
          { label: "Rating", value: profile.contest_rating ? Math.round(profile.contest_rating) : "N/A", icon: Star, col: "text-yellow-400" },
        ].map(({ label, value, icon: Icon, col }) => (
          <div key={label} className="p-2 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)" }}>
            <Icon className={`w-4 h-4 ${col} mx-auto`} />
            <p className="text-sm font-bold mt-1" style={{ color: "var(--text-primary)" }}>{value}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildCompareBar(u1, u2) {
  return [
    { name: "Easy",   [u1.username]: u1.easy_solved,   [u2.username]: u2.easy_solved },
    { name: "Medium", [u1.username]: u1.medium_solved,  [u2.username]: u2.medium_solved },
    { name: "Hard",   [u1.username]: u1.hard_solved,    [u2.username]: u2.hard_solved },
    { name: "Total",  [u1.username]: u1.total_solved,   [u2.username]: u2.total_solved },
  ];
}

function buildRadarData(topics1, topics2, u1name, u2name) {
  const CORE = ["array","string","linked-list","tree","graph","dynamic-programming","greedy","backtracking","stack","hash-table"];
  return CORE.map((slug) => {
    const t1 = topics1.find((t) => t.topic_slug === slug);
    const t2 = topics2.find((t) => t.topic_slug === slug);
    return {
      subject: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 10),
      [u1name]: t1?.solved_count || 0,
      [u2name]: t2?.solved_count || 0,
    };
  });
}

export default function ComparePage() {
  const [u1, setU1] = useState("");
  const [u2, setU2] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const handleCompare = async () => {
    if (!u1.trim() || !u2.trim()) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await compareProfiles(u1.trim(), u2.trim());
      setResult(res);
    } catch (e) {
      setErr("Failed to compare profiles. Check usernames and try again.");
    } finally {
      setLoading(false);
    }
  };

  const barData   = result ? buildCompareBar(result.user1, result.user2) : [];
  const radarData = result ? buildRadarData(result.user1_topics, result.user2_topics, result.user1.username, result.user2.username) : [];

  const winner = result
    ? (result.user1.total_solved >= result.user2.total_solved ? result.user1 : result.user2)
    : null;

  return (
    <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="section-title text-2xl md:text-3xl">Compare Profiles</h1>
          <p className="section-subtitle text-xs md:text-sm">Challenge a friend — who's the better coder?</p>
        </div>
      </div>

      {/* Input card */}
      <div className="card">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                   style={{ color: "var(--text-muted)" }}>Player 1</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "var(--text-muted)" }} />
              <input
                value={u1}
                onChange={(e) => setU1(e.target.value)}
                placeholder="LeetCode username…"
                className="input-field pl-9"
                id="compare-user1"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                   style={{ color: "var(--text-muted)" }}>Player 2</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "var(--text-muted)" }} />
              <input
                value={u2}
                onChange={(e) => setU2(e.target.value)}
                placeholder="LeetCode username…"
                className="input-field pl-9"
                id="compare-user2"
              />
            </div>
          </div>
        </div>

        {err && (
          <p className="text-sm text-hard mt-3 text-center">{err}</p>
        )}

        <button
          onClick={handleCompare}
          disabled={loading || !u1.trim() || !u2.trim()}
          className="btn-primary w-full justify-center mt-4 py-3.5"
          id="compare-btn"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Fetching profiles…
            </span>
          ) : (
            <>
              <GitCompare className="w-5 h-5" />
              Compare Now
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Winner banner */}
          {winner && (
            <div className="card bg-gradient-brand text-white text-center animate-slide-up">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
              <p className="text-lg font-bold">🏆 Leading by total solved</p>
              <p className="text-3xl font-extrabold mt-1">@{winner.username}</p>
              <p className="text-white/70 text-sm mt-1">{winner.total_solved} problems solved</p>
            </div>
          )}

          {/* Profile cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <UserBadge profile={result.user1} color="#6371f6" />
            <UserBadge profile={result.user2} color="#f97316" />
          </div>

          {/* Bar comparison */}
          <div className="card animate-slide-up">
            <h3 className="section-title text-lg mb-6">Head-to-Head Comparison</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend />
                <Bar dataKey={result.user1.username} fill="#6371f6" radius={[6,6,0,0]} />
                <Bar dataKey={result.user2.username} fill="#f97316" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar comparison */}
          <div className="card animate-slide-up">
            <h3 className="section-title text-lg mb-6">Topic Strength Comparison</h3>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                <PolarRadiusAxis tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
                <Radar name={result.user1.username} dataKey={result.user1.username}
                       stroke="#6371f6" fill="#6371f6" fillOpacity={0.3} />
                <Radar name={result.user2.username} dataKey={result.user2.username}
                       stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
