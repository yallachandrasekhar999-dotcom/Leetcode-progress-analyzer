import React from "react";

export default function HeroIllustration({ isDark }) {
  // We customize colors slightly based on the theme
  const leafColor = isDark ? "rgba(74, 222, 128, 0.08)" : "rgba(20, 184, 166, 0.08)";
  const dashBg = isDark ? "#1e293b" : "#2dd4bf";
  const textColor = isDark ? "#f3f4f6" : "#0f172a";

  return (
    <svg
      viewBox="0 0 800 750"
      width="100%"
      height="100%"
      style={{
        width: "100%",
        height: "100%",
        maxHeight: "480px",
        overflow: "visible",
      }}
    >
      <defs>
        {/* Shadow for floating cards */}
        <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#0f172a" floodOpacity="0.06" />
        </filter>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="gradient-wave" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
      </defs>

      {/* ── BACKGROUND LEAVES (Teal/Green decorative) ── */}
      <g opacity={isDark ? 0.35 : 0.6}>
        <path d="M400,200 C320,100 240,150 200,280 C260,250 340,240 400,200 Z" fill={leafColor} />
        <path d="M480,180 C550,80 640,110 680,240 C620,220 540,210 480,180 Z" fill={leafColor} />
        <path d="M250,320 C180,250 150,350 120,440 C170,410 220,380 250,320 Z" fill={leafColor} />
        <path d="M580,300 C660,230 700,320 730,410 C670,380 620,360 580,300 Z" fill={leafColor} />
      </g>

      {/* ── MAIN DASHBOARD CONTAINER (Centered) ── */}
      <rect
        x="240"
        y="160"
        width="340"
        height="440"
        rx="28"
        fill={isDark ? "#1e293b" : "#e0f2fe"}
        stroke={isDark ? "#334155" : "#bae6fd"}
        strokeWidth="4"
        filter="url(#card-shadow)"
      />
      {/* Dark inner dashboard screen */}
      <rect
        x="256"
        y="210"
        width="308"
        height="366"
        rx="16"
        fill={isDark ? "#0f172a" : "#115e59"}
      />
      {/* Dashboard window dots */}
      <circle cx="276" cy="185" r="7" fill="#ef4444" />
      <circle cx="296" cy="185" r="7" fill="#eab308" />
      <circle cx="316" cy="185" r="7" fill="#22c55e" />

      {/* ── SMOOTH GREEN WAVE (Inside Dashboard) ── */}
      <path
        d="M256,400 Q310,320 370,360 T480,300 T564,320"
        fill="none"
        stroke="url(#gradient-wave)"
        strokeWidth="6"
        strokeLinecap="round"
        filter="url(#glow)"
      />
      <circle cx="370" cy="360" r="5" fill="#ffffff" />
      <circle cx="480" cy="300" r="5" fill="#ffffff" />

      {/* ── FLOATING CARD 1: TOP LEFT (Donut details) ── */}
      <g filter="url(#card-shadow)">
        <rect x="130" y="220" width="180" height="110" rx="18" fill={isDark ? "#1e293b" : "#ffffff"} />
        <circle cx="165" cy="275" r="22" fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle cx="165" cy="275" r="22" fill="none" stroke="#22c55e" strokeWidth="10" strokeDasharray="90 140" strokeDashoffset="25" />
        <rect x="205" y="245" width="80" height="8" rx="4" fill="#22c55e" />
        <rect x="205" y="265" width="60" height="8" rx="4" fill="#38bdf8" />
        <rect x="205" y="285" width="40" height="8" rx="4" fill="#e2e8f0" />
      </g>

      {/* ── FLOATING CARD 2: BOTTOM LEFT (Large Circular Donut Card) ── */}
      <g filter="url(#card-shadow)">
        <rect x="110" y="380" width="220" height="150" rx="22" fill={isDark ? "#1e293b" : "#ffffff"} />
        {/* Custom complex donut chart */}
        <circle cx="190" cy="455" r="32" fill="none" stroke="#e2e8f0" strokeWidth="14" />
        <circle cx="190" cy="455" r="32" fill="none" stroke="#10b981" strokeWidth="14" strokeDasharray="140 200" strokeDashoffset="40" />
        <circle cx="190" cy="455" r="32" fill="none" stroke="#f59e0b" strokeWidth="14" strokeDasharray="40 200" strokeDashoffset="-100" />
        {/* Simple details rows */}
        <rect x="245" y="415" width="60" height="8" rx="4" fill="#10b981" />
        <rect x="245" y="435" width="50" height="8" rx="4" fill="#f59e0b" />
        <rect x="245" y="455" width="40" height="8" rx="4" fill="#e2e8f0" />
        {/* Small check lines on side */}
        <line x1="245" y1="485" x2="285" y2="485" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
        <line x1="245" y1="500" x2="275" y2="500" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* ── FLOATING CARD 3: MID RIGHT (Pie chart small) ── */}
      <g filter="url(#card-shadow)">
        <rect x="390" y="340" width="200" height="90" rx="16" fill={isDark ? "#1e293b" : "#ffffff"} />
        <circle cx="440" cy="385" r="22" fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle cx="440" cy="385" r="22" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="100 150" strokeDashoffset="10" />
        <rect x="480" y="370" width="80" height="8" rx="4" fill="#0f172a" fillOpacity={isDark ? 0.9 : 0.2} />
        <rect x="480" y="388" width="60" height="8" rx="4" fill="#10b981" />
      </g>

      {/* ── FLOATING CARD 4: BOTTOM RIGHT (Bar Chart Card) ── */}
      <g filter="url(#card-shadow)">
        <rect x="470" y="450" width="180" height="230" rx="24" fill={isDark ? "#1e293b" : "#ffffff"} />
        {/* Bar chart elements */}
        <rect x="505" y="580" width="12" height="60" rx="6" fill="#14b8a6" />
        <rect x="525" y="540" width="12" height="100" rx="6" fill="#0d9488" />
        <rect x="545" y="520" width="12" height="120" rx="6" fill="#10b981" />
        <rect x="565" y="550" width="12" height="90" rx="6" fill="#22c55e" />
        <rect x="585" y="500" width="12" height="140" rx="6" fill="#4ade80" />
        <rect x="605" y="570" width="12" height="70" rx="6" fill="#86efac" />
        {/* Details circle & text indicator */}
        <circle cx="510" cy="485" r="12" fill="#10b981" fillOpacity="0.15" />
        <circle cx="510" cy="485" r="5" fill="#10b981" />
        <rect x="535" y="481" width="80" height="8" rx="4" fill="#e2e8f0" />
      </g>

      {/* ── CARD 5: GREEN SMALL BOX (Center-bottom of dashboard) ── */}
      <g filter="url(#card-shadow)">
        <rect x="250" y="520" width="160" height="100" rx="16" fill="#22c55e" />
        <rect x="270" y="545" width="80" height="6" rx="3" fill="#ffffff" opacity="0.6" />
        <rect x="270" y="560" width="60" height="6" rx="3" fill="#ffffff" opacity="0.6" />
        <rect x="270" y="575" width="45" height="6" rx="3" fill="#ffffff" opacity="0.6" />
        {/* Simple white illustration in green card */}
        <circle cx="365" cy="570" r="15" fill="#ffffff" opacity="0.2" />
        <path d="M358,570 L363,575 L373,565" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* ── CHECKMARK BADGE (Middle of illustration) ── */}
      <g filter="url(#card-shadow)">
        <circle cx="370" cy="450" r="20" fill={isDark ? "#1e293b" : "#ffffff"} />
        <circle cx="370" cy="450" r="16" fill="#10b981" />
        <path d="M363,450 L368,455 L377,445" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g filter="url(#card-shadow)">
        <circle cx="570" cy="270" r="20" fill={isDark ? "#1e293b" : "#ffffff"} />
        <circle cx="570" cy="270" r="16" fill="#10b981" />
        <path d="M563,270 L568,275 L577,265" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* ── MAN SITTING IN CHAIR (Left side) ── */}
      <g>
        {/* Soft chair/pod */}
        <path
          d="M80,500 C80,420 180,410 180,480 C180,550 200,600 170,620 C140,640 80,580 80,500 Z"
          fill="#e0f2fe"
          opacity="0.9"
        />
        {/* Chair stand */}
        <path d="M140,610 L140,650 M120,650 L160,650" stroke="#bae6fd" strokeWidth="6" strokeLinecap="round" />

        {/* Man figure */}
        {/* Legs (Green pants) */}
        <path d="M145,550 L160,630 L195,650" stroke="#16a34a" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M165,550 L210,610 L250,560" stroke="#15803d" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
        {/* Shoes */}
        <path d="M195,650 L210,655" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
        <path d="M250,560 L260,545" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
        
        {/* Body (White shirt) */}
        <path d="M125,510 C125,480 155,480 165,510 L165,560 L130,560 Z" fill="#f8fafc" />
        <path d="M125,510 C125,480 155,480 165,510 L165,560 L130,560 Z" fill="none" stroke="#bae6fd" strokeWidth="1" />

        {/* Arm resting */}
        <path d="M150,520 Q185,530 200,555" fill="none" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
        <path d="M150,520 Q185,530 200,555" fill="none" stroke="#15803d" strokeWidth="4" strokeLinecap="round" />

        {/* Head and Hair */}
        <circle cx="145" cy="460" r="14" fill="#fed7aa" />
        <path d="M135,462 C135,442 160,442 158,462 Z" fill="#1e293b" /> {/* Hair */}
        <path d="M135,462 C135,455 140,450 148,450" fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" /> {/* Hair details */}
      </g>

      {/* ── WOMAN STANDING POINTING (Right side) ── */}
      <g>
        {/* Body & Skirt (Light blue/grey) */}
        <path d="M635,530 L660,700 L610,700 Z" fill="#bae6fd" />
        {/* Torso/Shirt (Teal/dark green) */}
        <path d="M625,380 C610,380 605,420 620,530 L650,530 C660,420 655,380 640,380 Z" fill="#0f766e" />

        {/* Legs */}
        <line x1="625" y1="700" x2="625" y2="760" stroke="#fed7aa" strokeWidth="8" strokeLinecap="round" />
        <line x1="645" y1="700" x2="655" y2="755" stroke="#fed7aa" strokeWidth="8" strokeLinecap="round" />
        {/* Shoes */}
        <path d="M615,760 L630,763" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
        <path d="M645,755 L660,760" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />

        {/* Head, Glasses & Hair */}
        <circle cx="635" cy="345" r="14" fill="#fed7aa" />
        {/* Glasses */}
        <circle cx="628" cy="345" r="4" fill="none" stroke="#1e293b" strokeWidth="2" />
        <line x1="620" y1="343" x2="624" y2="343" stroke="#1e293b" strokeWidth="2" />
        {/* Vibrant Green hair */}
        <path d="M630,331 C652,331 660,355 658,390 C655,425 648,435 648,435 C648,435 632,410 630,390 Z" fill="#22c55e" />
        <circle cx="638" cy="334" r="9" fill="#22c55e" />

        {/* Left hand pointing */}
        <path d="M630,400 Q575,325 540,315" fill="none" stroke="#fed7aa" strokeWidth="8" strokeLinecap="round" />
        {/* Right hand in pocket */}
        <path d="M648,430 Q660,460 655,490" fill="none" stroke="#fed7aa" strokeWidth="8" strokeLinecap="round" />
      </g>
    </svg>
  );
}
