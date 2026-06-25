import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie
} from "recharts";
import { AlertTriangle, TrendingUp, RefreshCw } from "lucide-react";
import { useUser } from "../context/UserContext";
import { fetchProfile } from "../services/api";

const TOPIC_TOTAL_ESTIMATES = {
  "array": 500, "string": 300, "linked-list": 100, "tree": 180,
  "graph": 150, "dynamic-programming": 350, "greedy": 200,
  "backtracking": 80, "heap-priority-queue": 90, "stack": 100,
  "queue": 60, "binary-search": 150, "two-pointers": 120,
  "sliding-window": 80, "depth-first-search": 160,
  "breadth-first-search": 100, "hash-table": 220, "sorting": 140,
};

function getColor(pct) {
  if (pct < 15) return "#ff375f";
  if (pct < 30) return "#ffc01e";
  return "#00b8a3";
}

const customTooltipStyle = {
  backgroundColor: "#1a1b2e",
  border: "1px solid #2f3244",
  borderRadius: "12px",
  color: "#e8e9f3",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  padding: "10px 14px",
};

const customLabelStyle = { color: "#a0a3b1", fontSize: 11 };
const customItemStyle  = { color: "#e8e9f3", fontWeight: 700 };

export default function AnalysisPage() {
  const { username, profileData } = useUser();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("bar");

  useEffect(() => {
    if (!username) { navigate("/"); return; }
    if (profileData?.topic_stats) {
      setTopics(profileData.topic_stats);
    } else {
      loadData();
    }
  }, [username, profileData]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchProfile(username);
      setTopics(res.topic_stats || []);
    } finally {
      setLoading(false);
    }
  };

  const enriched = topics.map((t) => {
    const total = TOPIC_TOTAL_ESTIMATES[t.topic_slug] || 100;
    const pct = Math.round((t.solved_count / total) * 100);
    return {
      ...t,
      total,
      pct: Math.min(pct, 100),
      display: t.topic_name,
      color: getColor(pct),
    };
  }).sort((a, b) => a.pct - b.pct);

  const radarData = enriched.slice(0, 10).map((t) => ({
    subject: t.display.length > 12 ? t.display.slice(0, 10) + "…" : t.display,
    value: t.pct,
    fullMark: 100,
  }));

  const weakTopics = enriched.filter((t) => t.pct < 30);
  const strongTopics = enriched.filter((t) => t.pct >= 50);

  return (
    <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="section-title">Topic Analysis</h1>
          <p className="section-subtitle">Deep dive into your topic-wise performance</p>
        </div>
        <button onClick={loadData} className="btn-ghost">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary row — 3 col on sm+, 1 col on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="stat-card text-center">
          <p className="text-3xl font-extrabold text-hard">{weakTopics.length}</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Weak Topics</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-3xl font-extrabold text-brand-400">{enriched.length}</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Topics Tracked</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-3xl font-extrabold text-easy">{strongTopics.length}</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Strong Topics</p>
        </div>
      </div>

      {/* Chart tabs */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="section-title text-lg">Topic Performance Chart</h3>
          <div className="flex gap-2">
            {["bar", "radar"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`tab-pill ${activeTab === t ? "active" : ""}`}
              >
                {t === "bar" ? "Bar Chart" : "Radar Chart"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-64 skeleton rounded-xl" />
        ) : enriched.length === 0 ? (
          <p className="text-center py-16 text-sm" style={{ color: "var(--text-muted)" }}>
            No topic data available. Analyze a profile first.
          </p>
        ) : activeTab === "bar" ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={enriched} margin={{ top: 5, right: 20, bottom: 60, left: 0 }}>
              <XAxis
                dataKey="display"
                tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} unit="%" />
              <Tooltip
                contentStyle={customTooltipStyle}
                labelStyle={customLabelStyle}
                itemStyle={customItemStyle}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                formatter={(v, n, p) => [`${v}% (${p.payload.solved_count} solved)`, "Progress"]}
              />
              <Bar dataKey="pct" radius={[6, 6, 0, 0]} isAnimationActive={true}>
                {enriched.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
              <Radar name="Progress" dataKey="value" stroke="#6371f6" fill="#6371f6" fillOpacity={0.25} />
              <Tooltip contentStyle={customTooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Weak Topics Alert */}
      {weakTopics.length > 0 && (
        <div className="card border-hard/30 bg-hard/5 animate-slide-up">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-hard mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-hard">Areas Needing Attention</h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                These topics are below 30% solve rate — prioritize them in your study plan.
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {weakTopics.map((t) => (
              <div key={t.topic_slug} className="flex items-center gap-3 p-3 rounded-xl"
                   style={{ backgroundColor: "var(--bg-secondary)" }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {t.display}
                    </span>
                    <span className="text-xs font-bold ml-2" style={{ color: t.color }}>
                      {t.pct}%
                    </span>
                  </div>
                  <div className="progress-bar mt-1.5">
                    <div className="progress-fill" style={{ width: `${Math.max(t.pct, 2)}%`, backgroundColor: t.color }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    {t.solved_count} / {t.total} problems solved
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strong topics */}
      {strongTopics.length > 0 && (
        <div className="card border-easy/30 bg-easy/5 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-easy" />
            <h3 className="font-bold text-easy">Your Strengths</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {strongTopics.map((t) => (
              <span key={t.topic_slug}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-easy/10 text-easy border border-easy/30">
                {t.display} · {t.pct}%
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
