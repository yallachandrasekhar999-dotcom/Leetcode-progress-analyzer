import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy, Flame, CheckCircle, Target, Star, Clock,
  RefreshCw, User
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from "recharts";
import { useUser } from "../context/UserContext";
import { fetchProfile, fetchProfileCalendar, prefetchCalendarYears } from "../services/api";
import StatCard from "../components/UI/StatCard";
import Heatmap from "../components/UI/Heatmap";

const DIFF_COLORS = { Easy: "#00b8a3", Medium: "#ffc01e", Hard: "#ff375f" };

function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

function ProfileHeader({ profile }) {
  return (
    <div className="card flex items-center gap-6 animate-slide-up">
      <div className="relative">
        <img
          src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}&backgroundColor=6371f6`}
          alt={profile.username}
          className="w-20 h-20 rounded-2xl ring-4 ring-brand-500/30 shadow-glow-sm"
        />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full ring-2"
             style={{ ringColor: "var(--bg-card)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
            {profile.real_name || profile.username}
          </h2>
          {profile.contest_rating && (
            <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-brand-500/20 text-brand-300">
              <Star className="w-3 h-3" />
              {Math.round(profile.contest_rating)}
            </span>
          )}
        </div>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>@{profile.username}</p>
        <div className="flex flex-wrap gap-4 mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
          {profile.ranking && (
            <span className="flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              Rank #{profile.ranking.toLocaleString()}
            </span>
          )}
          {profile.reputation !== undefined && (
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-brand-400" />
              {profile.reputation} reputation
            </span>
          )}
          {profile.last_updated && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Updated just now
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function DonutChart({ profile }) {
  const data = [
    { name: "Easy",   value: profile.easy_solved,   color: DIFF_COLORS.Easy },
    { name: "Medium", value: profile.medium_solved,  color: DIFF_COLORS.Medium },
    { name: "Hard",   value: profile.hard_solved,    color: DIFF_COLORS.Hard },
  ].filter((d) => d.value > 0);

  return (
    <div className="card flex flex-col items-center animate-slide-up">
      <h3 className="section-title text-lg self-start">Solved Distribution</h3>
      <p className="section-subtitle self-start">Total: {profile.total_solved} problems</p>
      <div className="relative w-48 h-48 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                color: "var(--text-primary)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
            {profile.total_solved}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>solved</span>
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span style={{ color: "var(--text-secondary)" }}>{d.name}</span>
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { username, profileData, setProfileData, setLoading } = useUser();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [err, setErr] = useState(null);
  const [selectedYear, setSelectedYear] = useState("Current");
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [heatmapError, setHeatmapError] = useState(null);

  // Re-run every time username changes — always fetch fresh data
  useEffect(() => {
    if (!username) { navigate("/"); return; }
    // Reset all stale state before loading the new profile
    setData(null);
    setErr(null);
    setSelectedYear("Current");
    setHeatmapError(null);
    loadData();
  }, [username]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    setFetching(true);
    setErr(null);
    setSelectedYear("Current");
    try {
      const res = await fetchProfile(username, "Current");
      setData(res);
      setProfileData(res);
      // Prefetch all active years silently in the background
      // so clicking any year in the dropdown is instant
      prefetchCalendarYears(username, res?.active_years ?? []);
    } catch (e) {
      setErr("Failed to fetch profile. Is the backend running?");
    } finally {
      setFetching(false);
    }
  };

  const handleYearChange = async (year) => {
    setSelectedYear(year);
    setHeatmapLoading(true);
    setHeatmapError(null);
    try {
      // Use the fast calendar-only endpoint for year switching
      const cal = await fetchProfileCalendar(username, year);
      if (!cal || !cal.heatmap) throw new Error("Empty response");
      setData((prev) => ({
        ...prev,
        heatmap: cal.heatmap,
        active_years: cal.active_years ?? prev?.active_years ?? [],
      }));
    } catch (e) {
      console.error("Failed to load year data", e);
      setHeatmapError("Could not load data for this year.");
    } finally {
      setHeatmapLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="card text-center py-16 max-w-md mx-auto">
        <p className="text-4xl mb-4">⚠️</p>
        <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{err}</p>
        <button onClick={loadData} className="btn-primary mx-auto mt-4">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { profile, topic_stats, weak_topics, heatmap } = data;

  return (
    <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">Your LeetCode performance at a glance</p>
        </div>
        <button onClick={loadData} className="btn-ghost" id="refresh-btn">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Profile header */}
      <ProfileHeader profile={profile} />

      {/* Stat cards — 1 col mobile → 2 col sm → 4 col md */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Total Solved" value={profile.total_solved} icon={CheckCircle} color="brand" />
        <StatCard label="Easy Solved"  value={profile.easy_solved}  icon={Target}      color="easy" />
        <StatCard label="Medium Solved" value={profile.medium_solved} icon={Flame}    color="medium" />
        <StatCard label="Hard Solved"  value={profile.hard_solved}   icon={Trophy}    color="hard" />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Streak (days)"     value={profile.streak}                     icon={Flame}  color="accent" />
        <StatCard label="Contest Rating"    value={profile.contest_rating ? Math.round(profile.contest_rating) : 0} icon={Star}   color="brand" />
        <StatCard label="Global Rank"       value={profile.contest_global_ranking ? `#${profile.contest_global_ranking.toLocaleString()}` : (profile.ranking ? `#${profile.ranking.toLocaleString()}` : "N/A")} icon={Trophy} color="brand" />
        <StatCard label="Acceptance Rate"   value={profile.acceptance_rate ? `${profile.acceptance_rate}%` : "N/A"}    icon={Target} color="easy" />
      </div>

      {/* Charts row — stack on mobile, side-by-side on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        <div className="md:col-span-1">
          <DonutChart profile={profile} />
        </div>
        <div className="md:col-span-2 card animate-slide-up">
          <h3 className="section-title text-lg">Weak Topics</h3>
          <p className="section-subtitle">Topics needing the most attention</p>
          {weak_topics?.length > 0 ? (
            <div className="mt-4 space-y-3">
              {weak_topics.slice(0, 6).map((slug, i) => {
                const ts = topic_stats.find((t) => t.topic_slug === slug);
                const total = 100;
                const pct = ts ? Math.round((ts.solved_count / total) * 100) : 0;
                return (
                  <div key={slug}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium capitalize" style={{ color: "var(--text-primary)" }}>
                        {slug.replace(/-/g, " ")}
                      </span>
                      <span style={{ color: "var(--text-muted)" }}>{ts?.solved_count ?? 0} solved</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.max(pct, 3)}%`, backgroundColor: i < 3 ? "#ff375f" : "#ffc01e" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm mt-4 text-center py-8" style={{ color: "var(--text-muted)" }}>
              🎉 No significant weak topics found!
            </p>
          )}
        </div>
      </div>

      {/* Heatmap */}
      <Heatmap
        data={data.heatmap ?? []}
        activeYears={data.active_years ?? []}
        selectedYear={selectedYear}
        onYearChange={handleYearChange}
        loading={heatmapLoading}
        error={heatmapError}
      />
    </div>
  );
}
