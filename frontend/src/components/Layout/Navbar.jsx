import { Search, X, Menu } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";
import NotificationPanel from "../UI/NotificationPanel";
import { useSidebar } from "./AppLayout";

export default function Navbar() {
  const { isDark } = useTheme();
  const { username, setUser } = useUser();
  const { setMobileOpen } = useSidebar();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      setUser(searchVal.trim());
      navigate("/dashboard");
      setSearchVal("");
      setShowSearch(false);
    }
  };

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between border-b backdrop-blur-md"
      style={{
        backgroundColor: isDark ? "rgba(24, 25, 37, 0.85)" : "rgba(255, 248, 240, 0.85)",
        borderColor: "var(--border)",
        /* Responsive horizontal padding */
        padding: "0.75rem clamp(0.75rem, 3vw, 1.5rem)",
        gap: "clamp(0.5rem, 2vw, 1rem)",
      }}
    >
      {/* Left: hamburger (mobile only) + user avatar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Hamburger — only on mobile/tablet */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center
                     transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
          style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Username chip — hide on very small screens when search is open */}
        {username && !showSearch && (
          <div className="flex items-center gap-2 animate-fade-in">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${username}&backgroundColor=ff6b35`}
              alt={username}
              className="w-8 h-8 rounded-full ring-2 ring-brand-500 flex-shrink-0"
            />
            {/* Hide text on very small screens */}
            <span
              className="hidden sm:block text-sm font-semibold truncate max-w-[120px]"
              style={{ color: "var(--text-primary)" }}
            >
              @{username}
            </span>
          </div>
        )}
      </div>

      {/* Center: Quick search — grows to fill space */}
      <div className="flex-1 min-w-0 max-w-md mx-auto">
        {showSearch ? (
          <form onSubmit={handleSearch} className="flex gap-2 animate-slide-up">
            <input
              autoFocus
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Enter LeetCode username..."
              className="input-field flex-1 text-sm min-w-0"
            />
            <button type="submit" className="btn-primary py-2 px-3 text-sm flex-shrink-0">
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowSearch(false)}
              className="btn-ghost py-2 px-3 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="w-full flex items-center gap-3 rounded-xl border text-sm transition-all hover:border-brand-500"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border)",
              color: "var(--text-muted)",
              padding: "0.6rem clamp(0.75rem, 2vw, 1rem)",
              minHeight: "44px",
            }}
            aria-label="Search username"
          >
            <Search className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {/* Shorter placeholder on small screens */}
            <span className="truncate">
              <span className="hidden sm:inline">Search username…</span>
              <span className="sm:hidden">Search…</span>
            </span>
          </button>
        )}
      </div>

      {/* Right: Notification bell */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <NotificationPanel />
      </div>
    </header>
  );
}
