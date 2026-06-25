import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Zap, Target, Building2, Calendar,
  CheckCircle2, Circle, ExternalLink, ChevronDown, ChevronUp
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { generatePlan } from "../services/api";

const COMPANIES = ["None", "Google", "Amazon", "Microsoft", "Meta"];
const DURATIONS = [7, 14, 30];
const PHASES = {
  Foundation:   "bg-easy/10 text-easy border-easy/30",
  Intermediate: "bg-medium/10 text-medium border-medium/30",
  Advanced:     "bg-hard/10 text-hard border-hard/30",
};

function DayCard({ day, data, onToggle, completed }) {
  const [expanded, setExpanded] = useState(false);
  const phaseClass = PHASES[data.phase] || PHASES.Foundation;

  return (
    <div className={`card transition-all duration-300 animate-slide-up ${completed ? "opacity-60" : ""}`}
         style={{ animationDelay: `${(day % 10) * 50}ms` }}>
      <div className="flex items-start gap-4">
        {/* Day number */}
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-brand flex flex-col
                        items-center justify-center text-white shadow-glow-sm">
          <span className="text-xs font-bold opacity-80">Day</span>
          <span className="text-lg font-extrabold leading-none">{day}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold" style={{ color: "var(--text-primary)" }}>
              {data.topic_display}
            </h4>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${phaseClass}`}>
              {data.phase}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{data.goal}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onToggle(day)}
            className={`w-11 h-11 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-200
              ${completed
                ? "bg-success/20 text-success hover:bg-success/30"
                : "border-2 border-[var(--border)] text-[var(--text-muted)] hover:border-success hover:text-success"
              }`}
          >
            {completed
              ? <CheckCircle2 className="w-5 h-5 sm:w-4 sm:h-4" />
              : <Circle className="w-5 h-5 sm:w-4 sm:h-4" />
            }
          </button>
          <button
            onClick={() => setExpanded((p) => !p)}
            className="w-11 h-11 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-200
                       hover:bg-[var(--bg-secondary)]"
            style={{ color: "var(--text-muted)" }}
          >
            {expanded ? <ChevronUp className="w-5 h-5 sm:w-4 sm:h-4" /> : <ChevronDown className="w-5 h-5 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-2 animate-slide-up">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
            Today's Problems ({data.problems?.length})
          </p>
          {data.problems?.map((p, i) => (
            <a
              key={i}
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                         hover:border-brand-500/40 group"
              style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
            >
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                ${p.difficulty === "Easy" ? "badge-easy" : p.difficulty === "Medium" ? "badge-medium" : "badge-hard"}`}>
                {p.difficulty}
              </span>
              <span className="flex-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {p.title}
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity"
                            style={{ color: "var(--text-muted)" }} />
            </a>
          ))}
          <div className="mt-3 p-3 rounded-xl border-l-4 border-brand-500"
               style={{ backgroundColor: "var(--bg-secondary)" }}>
            <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              💡 Tip: {data.tip}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlannerPage() {
  const { username } = useUser();
  const navigate = useNavigate();
  const [duration, setDuration] = useState(30);
  const [daily, setDaily] = useState(3);
  const [company, setCompany] = useState("None");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completedDays, setCompletedDays] = useState(new Set());
  const [visibleDays, setVisibleDays] = useState(7);

  if (!username) { navigate("/"); return null; }

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generatePlan({
        username,
        duration_days: duration,
        daily_target: daily,
        target_company: company === "None" ? null : company,
      });
      setPlan(res);
      setCompletedDays(new Set());
      setVisibleDays(7);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day) => {
    setCompletedDays((prev) => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  };

  const roadmap = plan?.roadmap_json?.roadmap || {};
  const allDays = Object.keys(roadmap)
    .map((k) => parseInt(k.replace("day_", ""), 10))
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);
  const shownDays = allDays.slice(0, visibleDays);
  const progress = allDays.length > 0 ? Math.round((completedDays.size / allDays.length) * 100) : 0;

  const tips = plan?.roadmap_json?.interview_tips || [];

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="section-title text-2xl md:text-3xl">AI Study Planner</h1>
          <p className="section-subtitle text-xs md:text-sm">Generate your personalized interview prep roadmap</p>
        </div>
      </div>

      {/* Config card */}
      <div className="card">
        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Zap className="w-5 h-5 text-brand-400" /> Plan Configuration
        </h3>
        <div className="grid md:grid-cols-3 gap-5">
          {/* Duration */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                   style={{ color: "var(--text-muted)" }}>
              <Calendar className="w-3.5 h-3.5 inline mr-1" />Duration
            </label>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-2.5 sm:py-2 rounded-xl text-sm font-bold border transition-all duration-200
                    ${duration === d
                      ? "bg-brand-600 text-white border-brand-600 shadow-glow-sm"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-brand-500"
                    }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Daily target */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                   style={{ color: "var(--text-muted)" }}>
              <Target className="w-3.5 h-3.5 inline mr-1" />Daily Target
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDaily((p) => Math.max(1, p - 1))}
                className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center font-bold
                           transition-all hover:border-brand-500"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              >−</button>
              <span className="flex-1 text-center text-2xl font-extrabold"
                    style={{ color: "var(--text-primary)" }}>{daily}</span>
              <button
                onClick={() => setDaily((p) => Math.min(10, p + 1))}
                className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center font-bold
                           transition-all hover:border-brand-500"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              >+</button>
            </div>
            <p className="text-xs text-center mt-1" style={{ color: "var(--text-muted)" }}>
              problems/day
            </p>
          </div>

          {/* Target company */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                   style={{ color: "var(--text-muted)" }}>
              <Building2 className="w-3.5 h-3.5 inline mr-1" />Target Company
            </label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="input-field py-2.5 text-sm"
            >
              {COMPANIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary mt-6 w-full justify-center py-4 text-base"
          id="generate-plan-btn"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating your plan…
            </span>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Generate {duration}-Day Study Plan
            </>
          )}
        </button>
      </div>

      {/* Plan output */}
      {plan && (
        <>
          {/* Progress */}
          <div className="card animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>
                📋 {plan.plan_name}
              </h3>
              <span className="text-sm font-bold text-brand-400">{progress}% complete</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              {completedDays.size} of {allDays.length} days completed
            </p>
          </div>

          {/* Interview tips */}
          {tips.length > 0 && (
            <div className="card bg-brand-500/5 border-brand-500/20 animate-slide-up">
              <h4 className="font-bold mb-3 text-brand-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Interview Tips
                {company !== "None" && <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20">{company}</span>}
              </h4>
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm"
                      style={{ color: "var(--text-secondary)" }}>
                    <span className="text-brand-400 font-bold flex-shrink-0">{i + 1}.</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Roadmap */}
          <div>
            <h3 className="section-title text-xl mb-4">📅 Daily Roadmap</h3>
            <div className="space-y-3">
              {shownDays.map((day) => (
                <DayCard
                  key={day}
                  day={day}
                  data={roadmap[`day_${day}`]}
                  onToggle={toggleDay}
                  completed={completedDays.has(day)}
                />
              ))}
            </div>
            {visibleDays < allDays.length && (
              <button
                onClick={() => setVisibleDays((p) => Math.min(p + 7, allDays.length))}
                className="btn-secondary w-full mt-4 justify-center"
              >
                Show More Days ({allDays.length - visibleDays} remaining)
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
