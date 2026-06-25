import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BarChart3, Lightbulb, BookOpen,
  TrendingUp, GitCompare, Code2, ChevronLeft, ChevronRight, X
} from "lucide-react";
import { useState } from "react";
import { useUser } from "../../context/UserContext";
import { useSidebar } from "./AppLayout";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/analysis",  icon: BarChart3,       label: "Topic Analysis" },
  { to: "/recommend", icon: Lightbulb,       label: "Recommendations" },
  { to: "/planner",   icon: BookOpen,        label: "AI Planner" },
  { to: "/tracker",   icon: TrendingUp,      label: "Progress" },
  { to: "/compare",   icon: GitCompare,      label: "Compare" },
];

export default function Sidebar() {
  /* Desktop collapse state */
  const [collapsed, setCollapsed] = useState(false);
  /* Mobile open state from layout context */
  const { mobileOpen, setMobileOpen } = useSidebar();
  const { username } = useUser();
  const navigate = useNavigate();

  const handleNavClick = () => {
    /* Close mobile sidebar after navigation */
    setMobileOpen(false);
  };

  return (
    <aside
      className={`
        relative flex flex-col border-r h-screen sticky top-0
        transition-all duration-300 ease-in-out flex-shrink-0
        /* Desktop: always visible, collapsible */
        ${collapsed ? "lg:w-[72px]" : "lg:w-64"}
        /* Mobile: fixed overlay, slides in from left */
        fixed lg:static z-40 lg:z-auto
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        /* Width on mobile is always full sidebar */
        w-64
      `}
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
      aria-label="Sidebar navigation"
    >
      {/* Logo + mobile close button */}
      <div
        className="flex items-center gap-3 px-5 py-5 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        {/* Logo — clickable to go home */}
        <div
          className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
          onClick={() => { navigate("/"); setMobileOpen(false); }}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center flex-shrink-0 shadow-glow-sm">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in overflow-hidden min-w-0">
              <p className="text-sm font-bold leading-tight truncate" style={{ color: "var(--text-primary)" }}>
                LeetCode
              </p>
              <p className="text-xs font-medium truncate" style={{ color: "var(--text-muted)" }}>
                Progress Analyzer
              </p>
            </div>
          )}
        </div>

        {/* Mobile close button (only visible on mobile) */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center
                     hover:bg-[var(--bg-secondary)] transition-colors flex-shrink-0"
          style={{ color: "var(--text-muted)" }}
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""} ${collapsed ? "lg:justify-center lg:px-2" : ""}`
            }
            title={collapsed ? label : ""}
          >
            <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            {/* Label hidden on desktop when collapsed, always shown on mobile */}
            <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Active user indicator */}
      {username && !collapsed && (
        <div
          className="mx-3 mb-3 p-3 rounded-xl border animate-fade-in"
          style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Active User</p>
          <p className="text-sm font-bold mt-0.5 truncate" style={{ color: "var(--text-primary)" }}>
            @{username}
          </p>
          <div className="w-full h-1 rounded-full mt-2 bg-gradient-brand opacity-60" />
        </div>
      )}

      {/* Desktop collapse toggle — hidden on mobile */}
      <button
        onClick={() => setCollapsed((p) => !p)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full border items-center justify-center
                   transition-all duration-200 hover:scale-110 z-10"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border)",
          color: "var(--text-secondary)",
        }}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
