import { ExternalLink, Building2 } from "lucide-react";

const DIFFICULTY_STYLE = {
  Easy:   "badge-easy",
  Medium: "badge-medium",
  Hard:   "badge-hard",
};

const COMPANY_COLORS = {
  Google:    "bg-blue-500/10 text-blue-400 border-blue-500/30",
  Amazon:    "bg-orange-500/10 text-orange-400 border-orange-500/30",
  Microsoft: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  Meta:      "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
};

export default function ProblemCard({ problem, index }) {
  return (
    <div
      className="card group animate-slide-up hover:border-brand-500/40 transition-all duration-300"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Index */}
          <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-brand flex items-center
                           justify-center text-white text-xs font-bold mt-0.5">
            {index + 1}
          </span>

          <div className="flex-1 min-w-0">
            <a
              href={problem.leetcode_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold hover:text-brand-400 transition-colors line-clamp-1 flex items-center gap-1"
              style={{ color: "var(--text-primary)" }}
            >
              {problem.title}
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </a>

            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className={DIFFICULTY_STYLE[problem.difficulty] || "badge-medium"}>
                {problem.difficulty}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full border"
                    style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
                {problem.topic?.replace(/-/g, " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Company tags */}
        {problem.companies?.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-end flex-shrink-0">
            {problem.companies.slice(0, 3).map((c) => (
              <span key={c} className={`company-tag text-xs ${COMPANY_COLORS[c] || "bg-gray-500/10 text-gray-400 border-gray-500/30"}`}>
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {problem.description && (
        <p className="text-xs mt-3 line-clamp-2" style={{ color: "var(--text-muted)" }}>
          {problem.description}
        </p>
      )}

      {problem.acceptance_rate && (
        <div className="mt-3 flex items-center gap-2">
          <div className="progress-bar flex-1">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(problem.acceptance_rate, 100)}%` }}
            />
          </div>
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            {problem.acceptance_rate}%
          </span>
        </div>
      )}
    </div>
  );
}
