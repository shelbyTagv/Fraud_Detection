import { useState, useEffect } from "react";
import { useUser }             from "../context/UserContext";
import { apiGetHistory }       from "../api";

export default function ProfilePage() {
  const { user, prefs, updatePrefs } = useUser();
  const [history, setHistory]        = useState([]);
  const [saved, setSaved]            = useState(false);
  const [localPrefs, setLocalPrefs]  = useState({ ...prefs });

  useEffect(() => {
    apiGetHistory().then(d => { if (Array.isArray(d)) setHistory(d); }).catch(() => {});
  }, []);

  function handlePrefChange(key, value) { setLocalPrefs(p => ({ ...p, [key]: value })); }

  function handleSave() {
    updatePrefs(localPrefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const initial    = user?.username ? user.username[0].toUpperCase() : "?";
  const highRisk   = history.filter(h => h.overall_risk === "HIGH").length;
  const totalTxns  = history.reduce((a, h) => a + (h.total_transactions || 0), 0);
  const totalFlags = history.reduce((a, h) => a + (h.ml_flagged_count || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Profile &amp; Preferences</h2>
        <p className="page-subtitle">Manage your account information and customise how the system behaves</p>
      </div>

      <div className="profile-layout">
        {/* LEFT — profile card */}
        <div>
          <div className="profile-card">
            <div className="profile-avatar-lg">{initial}</div>
            <div className="profile-name">{user?.username}</div>
            <div className="profile-email">{user?.email || "no email set"}</div>
            <div className="divider" />
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.5px",color:"var(--text-muted)",marginBottom:8}}>Role</div>
              <div style={{fontSize:14,fontWeight:600,color:"var(--text-primary)"}}>{localPrefs.role || "Forensic Analyst"}</div>
              {localPrefs.organisation && (
                <>
                  <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.5px",color:"var(--text-muted)",marginBottom:8,marginTop:14}}>Organisation</div>
                  <div style={{fontSize:14,color:"var(--text-primary)"}}>{localPrefs.organisation}</div>
                </>
              )}
            </div>
            <div className="profile-stat-grid">
              <div className="profile-stat-box">
                <div className="profile-stat-num">{history.length}</div>
                <div className="profile-stat-label">Analyses Run</div>
              </div>
              <div className="profile-stat-box">
                <div className="profile-stat-num" style={{color:"var(--red)"}}>{highRisk}</div>
                <div className="profile-stat-label">High Risk Results</div>
              </div>
              <div className="profile-stat-box">
                <div className="profile-stat-num">{totalTxns.toLocaleString()}</div>
                <div className="profile-stat-label">Transactions Scanned</div>
              </div>
              <div className="profile-stat-box">
                <div className="profile-stat-num" style={{color:"var(--amber)"}}>{totalFlags}</div>
                <div className="profile-stat-label">Total ML Flags</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — preferences sections */}
        <div className="profile-sections">

          {/* Account info */}
          <div className="profile-section">
            <div className="profile-section-header">
              <span className="profile-section-title">◉ Account Information</span>
            </div>
            <div className="profile-section-body">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">Username</label>
                  <input className="form-input" value={user?.username || ""} disabled style={{opacity:0.6,cursor:"not-allowed"}} />
                </div>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">Email</label>
                  <input className="form-input" value={user?.email || ""} disabled style={{opacity:0.6,cursor:"not-allowed"}} />
                </div>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">Role / Job Title</label>
                  <input className="form-input" value={localPrefs.role} onChange={e => handlePrefChange("role", e.target.value)} placeholder="e.g. Internal Auditor" />
                </div>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">Organisation</label>
                  <input className="form-input" value={localPrefs.organisation} onChange={e => handlePrefChange("organisation", e.target.value)} placeholder="e.g. Harare Steel Ltd" />
                </div>
              </div>
            </div>
          </div>

          {/* Analysis preferences */}
          <div className="profile-section">
            <div className="profile-section-header">
              <span className="profile-section-title">⬡ Analysis Preferences</span>
            </div>
            <div className="profile-section-body">
              <div className="pref-grid">
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">Default Tab After Analysis</label>
                  <select className="form-select" value={localPrefs.defaultTab} onChange={e => handlePrefChange("defaultTab", e.target.value)}>
                    <option value="data_overview">Data Overview</option>
                    <option value="benford">Benford's Law</option>
                    <option value="ml">XGBoost ML</option>
                  </select>
                </div>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">Alert Sensitivity</label>
                  <select className="form-select" value={localPrefs.alertSensitivity} onChange={e => handlePrefChange("alertSensitivity", e.target.value)}>
                    <option value="low">Low — fewer flags, higher confidence</option>
                    <option value="medium">Medium — balanced (recommended)</option>
                    <option value="high">High — more flags, broader coverage</option>
                  </select>
                </div>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">Base Currency</label>
                  <select className="form-select" value={localPrefs.currency} onChange={e => handlePrefChange("currency", e.target.value)}>
                    <option value="USD">USD — US Dollar</option>
                    <option value="ZIG">ZiG — Zimbabwe Gold</option>
                    <option value="ZAR">ZAR — South African Rand</option>
                  </select>
                </div>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">Language</label>
                  <select className="form-select" value={localPrefs.language} onChange={e => handlePrefChange("language", e.target.value)}>
                    <option value="en">English</option>
                    <option value="sn">Shona</option>
                    <option value="nd">Ndebele</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Display preferences */}
          <div className="profile-section">
            <div className="profile-section-header">
              <span className="profile-section-title">◈ Display Preferences</span>
            </div>
            <div className="profile-section-body">
              {[
                {key:"showMonoNumbers",    label:"Monospace numbers in tables",   sub:"Use fixed-width font for amounts and scores"},
                {key:"compactTables",      label:"Compact table rows",             sub:"Reduce row padding to show more data"},
                {key:"autoExportPDF",      label:"Auto-export PDF after analysis", sub:"Automatically download PDF when analysis completes"},
                {key:"emailNotifications", label:"Email notifications",            sub:"Get notified when high-risk findings are detected"},
              ].map(({key, label, sub}) => (
                <div className="form-toggle-row" key={key}>
                  <div>
                    <div className="form-toggle-label">{label}</div>
                    <div className="form-toggle-sub">{sub}</div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={localPrefs[key]} onChange={e => handlePrefChange(key, e.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
            {saved && <div className="msg msg-success" style={{marginBottom:0,alignSelf:"center"}}>✓ Preferences saved</div>}
            <button className="btn btn-primary" onClick={handleSave} style={{width:"auto",padding:"11px 28px"}}>Save Preferences</button>
          </div>
        </div>
      </div>
    </div>
  );
}
