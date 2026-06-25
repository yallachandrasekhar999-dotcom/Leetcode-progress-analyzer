import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Shield, BarChart2, Lock, ArrowRight } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";

/* ─── Inline company logo SVGs ───────────────────────────────────────── */
const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const AmazonLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF9900">
    <path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.699-3.182v.685zm3.186 7.705c-.209.189-.512.201-.745.074-1.047-.871-1.235-1.276-1.814-2.106-1.734 1.768-2.962 2.297-5.209 2.297-2.66 0-4.731-1.641-4.731-4.925 0-2.565 1.391-4.309 3.37-5.164 1.715-.754 4.11-.891 5.942-1.097v-.41c0-.753.06-1.642-.384-2.294-.385-.579-1.124-.82-1.775-.82-1.205 0-2.277.618-2.54 1.897-.054.285-.261.567-.549.582l-3.061-.333c-.259-.056-.548-.266-.472-.66C5.948 2.062 8.89 1 11.529 1c1.348 0 3.109.358 4.172 1.378 1.348 1.262 1.219 2.944 1.219 4.777v4.327c0 1.301.539 1.872 1.046 2.572.178.249.216.548-.008.734l-2.814 2.007z"/>
    <path d="M20.533 17.546c-1.775 1.306-4.348 2-6.561 2-3.106 0-5.898-1.149-8.013-3.057-.166-.15-.018-.354.182-.238 2.282 1.328 5.104 2.126 8.018 2.126 1.967 0 4.131-.407 6.122-1.25.3-.127.551.197.252.419z"/>
    <path d="M21.252 16.69c-.228-.293-1.504-.138-2.078-.07-.174.021-.201-.131-.044-.241 1.018-.716 2.688-.509 2.884-.27.196.243-.052 1.913-1.006 2.713-.146.122-.286.057-.221-.104.215-.536.696-1.736.465-2.028z"/>
  </svg>
);

const MicrosoftLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
    <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
    <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
    <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
  </svg>
);

const MetaLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M2.5 12C2.5 6.753 6.753 2.5 12 2.5C17.247 2.5 21.5 6.753 21.5 12C21.5 17.247 17.247 21.5 12 21.5C6.753 21.5 2.5 17.247 2.5 12Z" fill="#0082FB"/>
    <path d="M8 9.5C8 9.5 8.5 7 10 7C11 7 11.5 8 12 9L14 12.5C14.5 13.5 15 14 15.5 14C16 14 16.5 13.5 16.5 12.5V9.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M7.5 12.5C7.5 11 8 9.5 9.5 9.5C11 9.5 11.5 11 12 12.5C12.5 14 13 15.5 14.5 15.5C16 15.5 16.5 14 16.5 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

const COMPANIES = [
  { name: "Google",    logo: GoogleLogo    },
  { name: "Amazon",    logo: AmazonLogo    },
  { name: "Microsoft", logo: MicrosoftLogo },
  { name: "Meta",      logo: MetaLogo      },
];

const TRUST = [
  { icon: Shield,    label: "No login required"    },
  { icon: BarChart2, label: "Always up to date"    },
  { icon: Lock,      label: "100% privacy friendly" },
];

const NAV_LINKS = [
  { label: "Features", id: "features" },
  { label: "How it Works", id: "how-it-works" }
];

export default function Home() {
  const [input, setInput]     = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { setUser }           = useUser();
  const { isDark, toggle }    = useTheme();
  const navigate              = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;
    setLoading(true);
    setUser(val);
    setTimeout(() => navigate("/dashboard"), 300);
  };


  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "transparent",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      position: "relative",
      overflowX: "hidden",
    }}>

      {/* Fixed Background Video */}
      <video
        src="/clip.mp4"
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload nofullscreen noremoteplayback"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          objectFit: "cover",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {/* Dynamic theme overlay (60-75% opacity) */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        backgroundColor: isDark ? "rgba(43, 45, 66, 0.70)" : "rgba(255, 248, 240, 0.75)",
        zIndex: 1,
        pointerEvents: "none",
        transition: "background-color 0.3s ease",
      }} />

      {/* ════════════  NAVBAR  ════════════ */}
      <nav className="px-6 md:px-12" style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        height: 72,
        background: scrolled
          ? (isDark ? "rgba(24, 25, 37, 0.9)" : "rgba(255, 248, 240, 0.9)")
          : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled
          ? (isDark ? "1px solid #2F3244" : "1px solid #E8E2D9")
          : "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: scrolled ? "0 4px 20px rgba(0, 0, 0, 0.03)" : "none",
        transition: "all 0.3s ease",
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginRight:"auto", cursor:"pointer" }} onClick={() => window.scrollTo({top:0, behavior:"smooth"})}>
          <div style={{
            width:38, height:38, borderRadius:10,
            background:"linear-gradient(135deg, #FF6B35, #FF9F1C)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <span style={{ color:"#fff", fontWeight:900, fontSize:18, fontStyle:"italic" }}>L</span>
          </div>
          <span style={{
            fontSize:20,
            fontWeight:800,
            color: isDark ? "#ffffff" : "#2B2D42",
            transition: "color 0.3s"
          }}>
            Leet<span style={{ color:"#FF6B35" }}>Analyze</span>
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex" style={{ alignItems:"center", gap:36, marginRight:36 }}>
          {NAV_LINKS.map(link => (
            <span key={link.id} style={{
              fontSize:15,
              fontWeight:600,
              color: scrolled
                ? (isDark ? "#C8CAD3" : "#4D5061")
                : (isDark ? "rgba(255, 255, 255, 0.85)" : "#4D5061"),
              cursor:"pointer",
              transition:"color 0.2s"
            }}
              onClick={() => scrollToSection(link.id)}
              onMouseEnter={(e) => e.target.style.color="#FF6B35"}
              onMouseLeave={(e) => e.target.style.color= scrolled
                ? (isDark ? "#C8CAD3" : "#4D5061")
                : (isDark ? "rgba(255, 255, 255, 0.85)" : "#4D5061")}
            >{link.label}</span>
          ))}
        </div>



      </nav>

      {/* ════════════  HERO  ════════════ */}
      <section style={{
        position: "relative",
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}>
        {/* Centered Hero Content */}
        <div className="animate-fade-in" style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 800,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}>
          {/* Live Badge */}
          <div className="animate-slide-up-1" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 18px",
            borderRadius: 999,
            marginBottom: 24,
            background: "rgba(255, 107, 53, 0.15)",
            border: "1px solid rgba(255, 107, 53, 0.3)",
            backdropFilter: "blur(4px)",
            opacity: 0,
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#FF6B35",
              display: "inline-block",
              animation: "pulse 2.5s infinite"
            }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#FFE8E0" }}>
              Powered by LeetCode's Public API &nbsp;•&nbsp; 100% Free
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-slide-up-2" style={{
            margin: "0 0 20px 0",
            fontSize: "clamp(38px, 6.5vw, 66px)",
            fontWeight: 800,
            color: isDark ? "#ffffff" : "var(--text-primary)",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            maxWidth: 800,
            opacity: 0,
            transition: "color 0.3s ease",
          }}>
            Know Exactly What <br className="hidden md:block" /> To Solve Next.
          </h1>

          {/* Subheading */}
          <p className="animate-slide-up-3" style={{
            margin: "0 0 36px 0",
            fontSize: "clamp(16px, 1.8vw, 19px)",
            lineHeight: 1.6,
            color: isDark ? "rgba(255, 255, 255, 0.85)" : "var(--text-secondary)",
            maxWidth: 640,
            fontWeight: 400,
            opacity: 0,
            transition: "color 0.3s ease",
          }}>
            Analyze your LeetCode profile, identify weak topics, track progress, and get personalized problem recommendations.
          </p>

          {/* Search bar form */}
          <form onSubmit={handleSearch} className="animate-slide-up-4 w-full max-w-[600px] px-4" style={{
            opacity: 0,
          }}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center p-2 sm:p-1.5 gap-2 sm:gap-0" style={{
              background: isDark ? "rgba(30, 32, 43, 0.95)" : "#ffffff",
              borderRadius: 20,
              border: `2px solid ${focused ? "#FF6B35" : (isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(43, 45, 66, 0.15)")}`,
              boxShadow: focused
                ? "0 0 0 4px rgba(255, 107, 53, 0.25), 0 10px 30px rgba(0,0,0,0.15)"
                : (isDark ? "0 8px 24px rgba(0,0,0,0.2)" : "0 8px 24px rgba(43, 45, 66, 0.05)"),
              transition: "all 0.25s ease",
              width: "100%",
            }}>
              <div className="flex items-center flex-1 px-2 sm:pl-4">
                <Search style={{ width: 22, height: 22, color: isDark ? "#9AA0A6" : "#6C757D", flexShrink: 0 }} />
                <input
                  id="username-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Enter your LeetCode username..."
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontSize: 17,
                    padding: "12px 12px",
                    color: "var(--text-primary)",
                    background: "transparent",
                    fontFamily: "inherit",
                    fontWeight: 500,
                  }}
                />
              </div>
              <button
                type="submit"
                id="analyze-btn"
                disabled={loading}
                className="w-full sm:w-auto justify-center"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 28px",
                  borderRadius: 14,
                  background: loading ? "#FFB599" : "#FF6B35",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 16,
                  fontWeight: 700,
                  flexShrink: 0,
                  fontFamily: "inherit",
                  boxShadow: "0 4px 14px rgba(255, 107, 53, 0.3)",
                  transition: "transform 0.15s, background-color 0.15s",
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#e65520"; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#FF6B35"; }}
              >
                {loading ? (
                  <span style={{ width: 20, height: 20, border: "2.5px solid #fff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                ) : (
                  <>
                    <span>Analyze Profile</span>
                    <ArrowRight style={{ width: 18, height: 18 }} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Trust Row */}
          <div className="animate-slide-up-4" style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 28,
            marginTop: 24,
            flexWrap: "wrap",
            opacity: 0,
            animationDelay: "0.2s"
          }}>
            {TRUST.map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon style={{ width: 16, height: 16, color: "#FF9F1C" }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: isDark ? "rgba(255, 255, 255, 0.8)" : "var(--text-secondary)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════  SOCIAL PROOF STRIP  ════════════ */}
      <section style={{
        position: "relative",
        zIndex: 2,
        backgroundColor: "transparent",
        borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid var(--border)",
        padding: "36px 24px",
        transition: "border-color 0.3s ease",
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}>
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: isDark ? "rgba(255, 255, 255, 0.7)" : "var(--text-muted)",
            textAlign: "center",
          }}>
            Trusted by developers preparing for interviews at
          </span>
          <div className="flex justify-center items-center gap-6 md:gap-12 flex-wrap">
            {COMPANIES.map(({ name, logo: Logo }) => (
              <div key={name} style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                opacity: 0.75,
                transition: "opacity 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
              onMouseLeave={(e) => e.currentTarget.style.opacity = 0.75}
              >
                <Logo />
                <span style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: isDark ? "#ffffff" : "var(--text-primary)",
                  transition: "color 0.3s ease",
                }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════  FEATURES SECTION  ════════════ */}
      <section id="features" className="py-12 md:py-24 px-6" style={{
        position: "relative",
        zIndex: 2,
        backgroundColor: "transparent",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span style={{
              display: "inline-block",
              padding: "6px 16px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              background: "rgba(255, 107, 53, 0.15)",
              color: "#FF6B35",
              border: "1px solid rgba(255, 107, 53, 0.3)",
              marginBottom: 16,
            }}>
              Features
            </span>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 800,
              color: isDark ? "#ffffff" : "var(--text-primary)",
              letterSpacing: "-0.02em",
              margin: "0 0 16px 0",
              transition: "color 0.3s ease",
            }}>
              Everything you need to <span style={{ color: "#FF6B35" }}>crack FAANG</span>
            </h2>
            <p style={{
              fontSize: 17,
              color: isDark ? "rgba(255, 255, 255, 0.7)" : "var(--text-secondary)",
              maxWidth: 600,
              margin: "0 auto",
              transition: "color 0.3s ease",
            }}>
              One dashboard. Six powerful tools. Zero cost.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { emoji: "📊", title: "Topic Analysis", color: "#FF6B35", bg: "rgba(255, 107, 53, 0.1)", desc: "Radar & bar charts showing where you're strong and weak across 20+ topics." },
              { emoji: "💡", title: "Smart Recommendations", color: "#FF9F1C", bg: "rgba(255, 159, 28, 0.1)", desc: "Problems curated by your weak topics, difficulty, and target company." },
              { emoji: "📈", title: "Progress Tracking", color: "#22c55e", bg: "rgba(34, 197, 94, 0.1)", desc: "Historical charts showing your monthly growth and difficulty breakdown." },
              { emoji: "🤖", title: "AI Study Planner", color: "#FF6B35", bg: "rgba(255, 107, 53, 0.1)", desc: "Day-by-day roadmap with daily targets, topic focus, and interview tips." },
              { emoji: "⚔️", title: "Profile Comparison", color: "#FF9F1C", bg: "rgba(255, 159, 28, 0.1)", desc: "Side-by-side duel with overlapping radar chart and bar chart battle." },
              { emoji: "⚡", title: "Live LeetCode Data", color: "#22c55e", bg: "rgba(34, 197, 94, 0.1)", desc: "Real-time data from LeetCode's public GraphQL API with smart fallbacks." },
            ].map(({ emoji, title, color, bg, desc }) => (
              <div key={title} style={{
                padding: "36px 32px",
                borderRadius: 24,
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                textAlign: "left",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
                transition: "all 0.3s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.25)";
                e.currentTarget.style.borderColor = `${color}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.15)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
              >
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  marginBottom: 24,
                }}>
                  {emoji}
                </div>
                <h3 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  margin: "0 0 12px 0",
                }}>{title}</h3>
                <p style={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: "var(--text-secondary)",
                  margin: 0,
                }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════  HOW IT WORKS  ════════════ */}
      <section id="how-it-works" className="py-12 md:py-24 px-6" style={{
        position: "relative",
        zIndex: 2,
        backgroundColor: "transparent",
        borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid var(--border)",
        borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid var(--border)",
        transition: "border-color 0.3s ease",
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <span style={{
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            background: "rgba(255, 159, 28, 0.15)",
            color: "#FF9F1C",
            border: "1px solid rgba(255, 159, 28, 0.3)",
            marginBottom: 16,
          }}>
            How It Works
          </span>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 800,
            color: isDark ? "#ffffff" : "var(--text-primary)",
            letterSpacing: "-0.02em",
            margin: "0 0 64px 0",
            transition: "color 0.3s ease",
          }}>
            Results in 3 simple steps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            {[
              { num: "01", emoji: "🔍", title: "Enter Username", color: "#FF6B35", desc: "Just type your public LeetCode username. No account or login needed." },
              { num: "02", emoji: "⚡", title: "Instant Analysis", color: "#FF9F1C", desc: "We fetch your stats, topic data, and submission history from LeetCode's API." },
              { num: "03", emoji: "🚀", title: "Level Up", color: "#22c55e", desc: "Follow AI-curated recommendations and a personalized study plan." },
            ].map(({ num, emoji, title, color, desc }) => (
              <div key={num} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
              }}>
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: 96,
                    height: 96,
                    borderRadius: 24,
                    background: `linear-gradient(135deg, ${color}22, ${color}44)`,
                    border: `1px solid ${color}50`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 40,
                    boxShadow: `0 10px 30px rgba(0, 0, 0, 0.2)`,
                  }}>
                    {emoji}
                  </div>
                  <div style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    backgroundColor: color,
                    color: "#ffffff",
                    fontSize: 14,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 10px ${color}40`,
                  }}>
                    {num}
                  </div>
                </div>
                <h3 style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: isDark ? "#ffffff" : "var(--text-primary)",
                  margin: 0,
                  transition: "color 0.3s ease",
                }}>{title}</h3>
                <p style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: isDark ? "rgba(255, 255, 255, 0.8)" : "var(--text-secondary)",
                  margin: 0,
                  maxWidth: 280,
                  transition: "color 0.3s ease",
                }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════  CTA BANNER  ════════════ */}
      <section className="py-12 md:py-24 px-6" style={{
        position: "relative",
        zIndex: 2,
        backgroundColor: "transparent",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="px-6 py-12 md:px-12 md:py-20" style={{
            borderRadius: 32,
            textAlign: "center",
            background: "linear-gradient(135deg, #FF6B35 0%, #FF9F1C 100%)",
            boxShadow: "0 20px 50px rgba(255, 107, 53, 0.3)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, background: "rgba(255, 255, 255, 0.1)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, background: "rgba(0, 0, 0, 0.06)", borderRadius: "50%" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 56, marginBottom: 24 }}>🎯</div>
              <h2 style={{
                fontSize: "clamp(26px, 4vw, 44px)",
                fontWeight: 800,
                color: "#ffffff",
                margin: "0 0 16px 0",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}>
                Ready to crack your dream job?
              </h2>
              <p style={{
                fontSize: 18,
                color: "rgba(255, 255, 255, 0.9)",
                margin: "0 0 40px 0",
                maxWidth: 480,
                marginLeft: "auto",
                marginRight: "auto",
                lineHeight: 1.6,
              }}>
                Enter your username and get your full profile breakdown in seconds.
              </p>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setTimeout(() => document.getElementById("username-input")?.focus(), 500);
                }}
                className="px-6 py-4 md:px-10 md:py-5 text-base md:text-lg"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  borderRadius: 14,
                  backgroundColor: "#2B2D42",
                  color: "#ffffff",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 10px 25px rgba(43, 45, 66, 0.2)",
                  transition: "transform 0.2s, background-color 0.2s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.backgroundColor = "#1E202B";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.backgroundColor = "#2B2D42";
                }}
              >
                <span>Start for Free</span>
                <ArrowRight style={{ width: 20, height: 20 }} />
              </button>
              <p style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: 14,
                marginTop: 20,
                fontWeight: 500,
              }}>
                No credit card • No signup • Instant results
              </p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes spin { to { transform:rotate(360deg) } }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .animate-slide-up-1 {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.1s;
        }
        
        .animate-slide-up-2 {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.2s;
        }
        
        .animate-slide-up-3 {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.3s;
        }
        
        .animate-slide-up-4 {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.4s;
        }
        
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
