export default function StatCard({ label, value, sub, icon: Icon, color = "brand", trend }) {
  const colorMap = {
    brand:  { bg: "bg-brand-500/10",  text: "text-brand-400",  border: "border-brand-500/20" },
    easy:   { bg: "bg-easy/10",       text: "text-easy",        border: "border-easy/20" },
    medium: { bg: "bg-medium/10",     text: "text-medium",      border: "border-medium/20" },
    hard:   { bg: "bg-hard/10",       text: "text-hard",        border: "border-hard/20" },
    accent: { bg: "bg-accent-500/10", text: "text-accent-500",  border: "border-accent-500/20" },
  };
  const c = colorMap[color] || colorMap.brand;

  return (
    <div className="stat-card group animate-slide-up">
      <div className="flex items-start justify-between">
        {Icon && (
          <div className={`w-12 h-12 rounded-2xl ${c.bg} ${c.border} border flex items-center justify-center
                           group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${c.text}`} />
          </div>
        )}
        {trend !== undefined && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            trend >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
          }`}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {value ?? "—"}
        </p>
        <p className="text-sm font-medium mt-1" style={{ color: "var(--text-muted)" }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>}
      </div>
    </div>
  );
}
