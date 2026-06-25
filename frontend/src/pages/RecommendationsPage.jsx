import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb, Building2, Filter, RefreshCw, Search } from "lucide-react";
import { useUser } from "../context/UserContext";
import { fetchRecommendations } from "../services/api";
import ProblemCard from "../components/UI/ProblemCard";

const COMPANIES = ["All", "Google", "Amazon", "Microsoft", "Meta"];
const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

const COMPANY_COLORS = {
  Google:    "border-blue-500/50 text-blue-400 bg-blue-500/10",
  Amazon:    "border-orange-500/50 text-orange-400 bg-orange-500/10",
  Microsoft: "border-sky-500/50 text-sky-400 bg-sky-500/10",
  Meta:      "border-indigo-500/50 text-indigo-400 bg-indigo-500/10",
  All:       "border-brand-500/50 text-brand-400 bg-brand-500/10",
};

export default function RecommendationsPage() {
  const { username } = useUser();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!username) { navigate("/"); return; }
    loadRecs();
  }, [username, company, difficulty]);

  const loadRecs = async () => {
    setLoading(true);
    try {
      const res = await fetchRecommendations(username, {
        company: company === "All" ? undefined : company,
        difficulty: difficulty === "All" ? undefined : difficulty,
        limit: 40,
      });
      setProblems(res);
    } finally {
      setLoading(false);
    }
  };

  const filtered = problems.filter((p) =>
    search ? p.title.toLowerCase().includes(search.toLowerCase()) : true
  );

  const easyCount   = filtered.filter((p) => p.difficulty === "Easy").length;
  const mediumCount = filtered.filter((p) => p.difficulty === "Medium").length;
  const hardCount   = filtered.filter((p) => p.difficulty === "Hard").length;

  return (
    <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="section-title">Recommendations</h1>
          <p className="section-subtitle">Problems tailored to your weak areas</p>
        </div>
        <button onClick={loadRecs} className="btn-ghost">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats row — 3 col on sm+, 1 col on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="stat-card text-center">
          <p className="text-2xl font-extrabold text-easy">{easyCount}</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Easy Problems</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-extrabold text-medium">{mediumCount}</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Medium Problems</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-extrabold text-hard">{hardCount}</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Hard Problems</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
          <span className="text-sm font-medium mr-2" style={{ color: "var(--text-secondary)" }}>Company:</span>
          {COMPANIES.map((c) => (
            <button
              key={c}
              onClick={() => setCompany(c)}
              className={`company-tag ${COMPANY_COLORS[c] || COMPANY_COLORS.All} ${company === c ? "ring-2 ring-offset-1" : ""}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 flex-shrink-0 opacity-0" />
          <span className="text-sm font-medium mr-2" style={{ color: "var(--text-secondary)" }}>Difficulty:</span>
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`tab-pill text-xs ${difficulty === d ? "active" : ""}`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by problem title…"
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
      </div>

      {/* Problem List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 text-brand-400 opacity-50" />
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>No problems found</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Try different filters or refresh the recommendations.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => (
            <ProblemCard key={p.id} problem={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
