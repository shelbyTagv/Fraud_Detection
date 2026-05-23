import { useState } from "react";
import { apiRegister } from "../api";

export default function RegisterPage({ onRegistered, onGoLogin }) {
  const [form, setForm]       = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const data = await apiRegister(form.username, form.email, form.password);
      if (data.message) {
        setSuccess("Account created! Redirecting to login...");
        setTimeout(onRegistered, 1600);
      } else {
        setError(data.detail || "Registration failed");
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
          Join the<br /><span>forensic</span><br />analytics platform.
        </h1>
        <p className="auth-sub">
          Create your account to start analysing financial transactions
          for fraud using six advanced forensic techniques validated
          on Zimbabwean manufacturing data.
        </p>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-mobile-logo">
            <div className="auth-brand-icon" style={{ width: 38, height: 38, fontSize: 18, borderRadius: 8 }}>🔍</div>
            <span className="auth-brand-name" style={{ color: "var(--blue-deep)", fontSize: 18, fontWeight: 700, fontFamily: "var(--mono)", marginLeft: 10 }}>ForensicAI</span>
          </div>
          <div className="auth-card-title">Create account</div>
          <div className="auth-card-sub">Fill in your details to get started</div>
          {error   && <div className="msg msg-error">⚠ {error}</div>}
          {success && <div className="msg msg-success">✓ {success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" name="username" value={form.username} onChange={handleChange} placeholder="choose a username" required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="at least 6 characters" required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <input className="form-input" name="confirm" type="password" value={form.confirm} onChange={handleChange} placeholder="repeat your password" required />
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{marginTop: 8}}>
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>
          <div className="auth-link">
            Already have an account? <span onClick={onGoLogin}>Sign in here</span>
          </div>
        </div>
      </div>
    </div>
  );
}
