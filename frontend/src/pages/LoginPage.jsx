import { useState } from "react";
import { apiLogin }  from "../api";
import { useUser }   from "../context/UserContext";

export default function LoginPage({ onLogin, onGoRegister }) {
  const { login }   = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const data = await apiLogin(username, password);
      if (data.access_token) {
        login(data.username, data.email || "", data.access_token);
        onLogin();
      } else {
        setError(data.detail || "Incorrect username or password");
      }
    } catch {
      setError("Could not connect to server. Make sure the backend is running.");
    }
    setLoading(false);
  }

  return (
    <div className="auth-root">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">🔍</div>
          <span className="auth-brand-name">ForensicAI</span>
        </div>
        <h1 className="auth-headline">
          Detect fraud.<br />
          <span>Protect your</span><br />
          organisation.
        </h1>
        <p className="auth-sub">
          A forensic analytics platform built for Zimbabwean manufacturing
          companies. Six detection techniques. Real-time multi-currency analysis.
          Evidence-based fraud risk scoring.
        </p>
        <div className="auth-stats">
          <div>
            <div className="auth-stat-num">35.9pp</div>
            <div className="auth-stat-label">Detection advantage<br/>over conventional audit</div>
          </div>
          <div>
            <div className="auth-stat-num">F1=0.85</div>
            <div className="auth-stat-label">XGBoost model<br/>accuracy score</div>
          </div>
          <div>
            <div className="auth-stat-num">6</div>
            <div className="auth-stat-label">Forensic analytics<br/>techniques</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-mobile-logo">
            <div className="auth-brand-icon" style={{ width: 38, height: 38, fontSize: 18, borderRadius: 8 }}>🔍</div>
            <span className="auth-brand-name" style={{ color: "var(--blue-deep)", fontSize: 18, fontWeight: 700, fontFamily: "var(--mono)", marginLeft: 10 }}>ForensicAI</span>
          </div>
          <div className="auth-card-title">Sign in</div>
          <div className="auth-card-sub">Enter your credentials to access the system</div>
          {error && <div className="msg msg-error">⚠ {error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="your username" required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{marginTop: 8}}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>
          <div className="auth-link">
            No account yet? <span onClick={onGoRegister}>Create one here</span>
          </div>
        </div>
      </div>
    </div>
  );
}
