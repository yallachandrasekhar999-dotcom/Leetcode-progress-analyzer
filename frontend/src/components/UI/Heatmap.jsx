import { useMemo, useState } from "react";
import { format, parseISO, eachDayOfInterval, subDays } from "date-fns";

const LEVELS = [
  "bg-[var(--border)]",   // Level 0 — empty, theme slate border
  "bg-brand-900/80",      // Level 1 — faintest coral-orange tint
  "bg-brand-700/70",      // Level 2 — mid coral-orange
  "bg-brand-500",         // Level 3 — primary brand orange #ff6b35
  "bg-accent-500",        // Level 4 — brightest, accent gold #ff9f1c
];

function getLevel(count) {
  if (!count) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

export default function Heatmap({
  data = [],
  activeYears = [],
  selectedYear = "Current",
  onYearChange,
  loading = false,
  error = null,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const heatMap = useMemo(() => {
    const map = {};
    data.forEach((d) => {
      map[d.date] = d.count;
    });
    return map;
  }, [data]);

  const { start, end } = useMemo(() => {
    if (selectedYear && selectedYear !== "Current") {
      const yr = parseInt(selectedYear);
      return {
        start: new Date(yr, 0, 1),
        end: new Date(yr, 11, 31),
      };
    }
    const today = new Date();
    return {
      start: subDays(today, 364),
      end: today,
    };
  }, [selectedYear]);

  const days = useMemo(() => {
    return eachDayOfInterval({ start, end });
  }, [start, end]);

  // Group by weeks
  const weeks = useMemo(() => {
    const w = [];
    let week = [];
    const startDow = start.getDay();
    for (let i = 0; i < startDow; i++) {
      week.push(null);
    }

    days.forEach((d) => {
      const key = format(d, "yyyy-MM-dd");
      week.push({ date: key, count: heatMap[key] || 0 });
      if (week.length === 7) {
        w.push(week);
        week = [];
      }
    });

    if (week.length) {
      while (week.length < 7) {
        week.push(null);
      }
      w.push(week);
    }
    return w;
  }, [days, heatMap, start]);

  const monthLabels = useMemo(() => {
    let lastMonth = null;
    return weeks.map((week) => {
      const firstDay = week.find((cell) => cell !== null);
      if (!firstDay) return "";
      const dateObj = parseISO(firstDay.date);
      const m = format(dateObj, "MMM");
      if (m !== lastMonth) {
        lastMonth = m;
        return m;
      }
      return "";
    });
  }, [weeks]);

  const totalSubmissions = useMemo(() => {
    return data.reduce((acc, d) => acc + d.count, 0);
  }, [data]);

  const totalActiveDays = useMemo(() => {
    return data.filter((d) => d.count > 0).length;
  }, [data]);

  const maxStreak = useMemo(() => {
    const activeDates = data
      .filter((d) => d.count > 0)
      .map((d) => d.date)
      .sort();
    
    if (activeDates.length === 0) return 0;
    
    let maxLen = 0;
    let currentLen = 0;
    let prevTime = null;
    
    for (const dateStr of activeDates) {
      const currTime = new Date(dateStr).getTime();
      if (prevTime === null) {
        currentLen = 1;
      } else {
        const diffDays = Math.round((currTime - prevTime) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentLen += 1;
        } else if (diffDays > 1) {
          if (currentLen > maxLen) maxLen = currentLen;
          currentLen = 1;
        }
      }
      prevTime = currTime;
    }
    if (currentLen > maxLen) maxLen = currentLen;
    return maxLen;
  }, [data]);

  return (
    <div className="card animate-slide-up relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        {/* Left Title */}
        <div className="flex items-center gap-1.5 select-none">
          <span className="text-[18px] font-semibold text-[var(--text-primary)]">{totalSubmissions}</span>
          <span className="text-[14px] text-[var(--text-secondary)]">
            submissions in {selectedYear === "Current" ? "the past one year" : selectedYear}
          </span>
          <span
            className="text-[var(--text-muted)] text-[13px] cursor-help hover:text-[var(--text-primary)] transition-colors"
            title="Submission activity history"
          >
            ⓘ
          </span>
        </div>

        {/* Right Stats + Dropdown */}
        <div className="flex items-center gap-5 ml-auto sm:ml-0">
          <div className="flex items-center gap-4 text-[13px] text-[var(--text-secondary)] select-none">
            <span>
              Total active days: <span className="font-semibold text-[var(--text-primary)]">{totalActiveDays}</span>
            </span>
            <span>
              Max streak: <span className="font-semibold text-[var(--text-primary)]">{maxStreak}</span>
            </span>
          </div>

          {/* Year Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--border)] border border-[var(--border)] rounded-xl transition-all duration-200 select-none active:scale-95 shadow-glow-sm"
            >
              <span>{selectedYear}</span>
              <svg className="w-2.5 h-2.5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-1.5 w-28 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-lg z-20 py-1 overflow-hidden animate-slide-up">
                  <button
                    onClick={() => {
                      onYearChange("Current");
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                      selectedYear === "Current"
                        ? "bg-[var(--bg-secondary)] text-[var(--brand)] font-semibold"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Current
                  </button>
                  {activeYears.map((yr) => (
                    <button
                      key={yr}
                      onClick={() => {
                        onYearChange(yr);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                        selectedYear === yr
                          ? "bg-[var(--bg-secondary)] text-[var(--brand)] font-semibold"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid container with loading / error states */}
      <div className="relative">
        {error && !loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[var(--bg-card)]/80 backdrop-blur-[1px]">
            <p className="text-sm font-medium px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
              ⚠️ {error}
            </p>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[var(--bg-card)]/60 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-2">
              <div className="w-7 h-7 rounded-full border-[3px] border-brand-500/30 border-t-brand-500 animate-spin" />
              <span className="text-[11px] text-[var(--text-muted)] font-medium">Loading…</span>
            </div>
          </div>
        )}
        <div className={`transition-opacity duration-300 ${loading ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[1056px] w-full">
            {/* Grid of weeks */}
            <div className="flex justify-between w-full">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[4px] flex-shrink-0">
                  {week.map((cell, di) =>
                    !cell ? (
                      <div key={di} className="w-[16px] h-[16px] flex-shrink-0" />
                    ) : (
                      <div
                        key={di}
                        title={`${cell.date}: ${cell.count} submissions`}
                        className={`w-[16px] h-[16px] rounded-[3px] cursor-pointer transition-transform hover:scale-125 flex-shrink-0 ${
                          LEVELS[getLevel(cell.count)]
                        }`}
                      />
                    )
                  )}
                </div>
              ))}
            </div>

            {/* Month labels row */}
            <div className="flex justify-between w-full mt-3.5 h-4 select-none pointer-events-none relative">
              {weeks.map((week, wi) => (
                <div key={wi} className="w-[16px] text-[10px] text-[var(--text-muted)] relative flex-shrink-0">
                  {monthLabels[wi] && (
                    <span className="absolute left-0 top-0 whitespace-nowrap">{monthLabels[wi]}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>   {/* end transition-opacity */}
      </div>   {/* end relative */}
    </div>
  );
}
