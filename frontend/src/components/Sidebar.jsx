import { useUser } from "../context/UserContext";

// Main navigation items — always visible
const MAIN_NAV = [
  { key: "dashboard", icon: "⌂",  label: "Dashboard" },
  { key: "analysis",  icon: "⬡",  label: "Run Analysis" },
  { key: "history",   icon: "◷",  label: "History" },
];

// Technique pages — only visible after an analysis has been run
// key must match what AnalysisPage uses for activeResultPage
const TECHNIQUE_NAV = [
  { key: "data_overview", icon: "📁", label: "Data Overview",  riskKey: null },
  { key: "benford",       icon: "📊", label: "Benford's Law",  riskKey: "benford" },
  { key: "ml",            icon: "🤖", label: "XGBoost ML",     riskKey: "ml_anomalies" },
];

// Maps a risk level to a badge colour class
function RiskDot({ level }) {
  if (!level) return null;
  const colors = { HIGH: "#ef4444", MEDIUM: "#f59e0b", LOW: "#10b981" };
  return (
    <span style={{
      width: 7, height: 7,
      borderRadius: "50%",
      background: colors[level] || "#94a3b8",
      display: "inline-block",
      marginLeft: "auto",
      flexShrink: 0
    }} title={`${level} risk`} />
  );
}

export default function Sidebar({
  page,
  onNavigate,
  analysisCount,
  // NEW props:
  results,            // the full results object after analysis, or null
  activeResultPage,   // which technique page is currently shown
  onResultPageChange, // callback(key) to change technique page
}) {
  const { user, logout } = useUser();
  const initial = user?.username ? user.username[0].toUpperCase() : "?";

  // Are we currently viewing a result technique page?
  const isOnResultPage = page === "analysis" && activeResultPage !== null;

  return (
    <aside className="sidebar">

      {/* ── LOGO — always navigates to dashboard ── */}
      <div
        className="sidebar-logo"
        onClick={() => onNavigate("dashboard")}
        title="Go to Dashboard"
      >
        <div className="sidebar-logo-icon">🔍</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">ForensicAI</span>
          <span className="sidebar-logo-sub">HIT Research 2026</span>
        </div>
      </div>

      {/* ── MAIN NAV ── */}
      <div className="sidebar-section">
        <div className="sidebar-section-label">Main</div>
        {MAIN_NAV.map(item => (
          <button
            key={item.key}
            className={`sidebar-nav-item ${
              page === item.key && !isOnResultPage ? "active" : ""
            }`}
            onClick={() => {
              onNavigate(item.key);
              // If navigating away from analysis, clear result page selection
              if (item.key !== "analysis") onResultPageChange(null);
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {item.key === "history" && analysisCount > 0 && (
              <span className="nav-badge">{analysisCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── CURRENT RESULTS — only shown when results exist ── */}
      {results && (
        <div className="sidebar-section">
          <div className="sidebar-section-label" style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            paddingRight: 8
          }}>
            <span>Current Results</span>
            <span style={{
              fontFamily: "var(--mono)", fontSize: 9,
              color: "var(--text-muted)", fontWeight: 400,
              textTransform: "none", letterSpacing: 0
            }}>
              {results.total_rows?.toLocaleString()} txns
            </span>
          </div>

          {TECHNIQUE_NAV.map(item => {
            const techniqueData = item.riskKey ? results[item.riskKey] : null;
            const riskLevel     = techniqueData?.risk || null;
            const isActive      = page === "analysis" && activeResultPage === item.key;

            return (
              <button
                key={item.key}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  onNavigate("analysis");
                  onResultPageChange(item.key);
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span style={{flex: 1, textAlign: "left"}}>{item.label}</span>
                <RiskDot level={riskLevel} />
              </button>
            );
          })}
        </div>
      )}

      {/* ── ACCOUNT ── */}
      <div className="sidebar-section">
        <div className="sidebar-section-label">Account</div>
        <button
          className={`sidebar-nav-item ${page === "profile" ? "active" : ""}`}
          onClick={() => { onNavigate("profile"); onResultPageChange(null); }}
        >
          <span className="nav-icon">◉</span>
          Profile &amp; Preferences
        </button>
      </div>

      {/* ── USER CARD AT BOTTOM ── */}
      <div className="sidebar-user">
        <div
          className="sidebar-user-card"
          onClick={() => { onNavigate("profile"); onResultPageChange(null); }}
          title="View profile"
        >
          <div className="sidebar-avatar">{initial}</div>
          <div>
            <div className="sidebar-user-name">{user?.username}</div>
            <div className="sidebar-user-role">Forensic Analyst</div>
          </div>
        </div>
        <button
          className="sidebar-nav-item"
          style={{ color: "#ef4444", marginTop: 4 }}
          onClick={logout}
        >
          <span className="nav-icon">⏻</span>
          Sign Out
        </button>
      </div>

    </aside>
  );
}
