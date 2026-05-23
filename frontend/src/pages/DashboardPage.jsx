import { useUser }       from "../context/UserContext";
import { apiGetHistory } from "../api";
import { useEffect, useState } from "react";

const TECHNIQUE_CARDS = [
  { icon: "📊", name: "Benford's Law",         f1: "0.79", best: "Financial Statement Fraud" },
  { icon: "🤖", name: "XGBoost ML",            f1: "0.85", best: "Currency Fraud" },
  { icon: "🕸",  name: "Network Analysis",      f1: "0.81", best: "Procurement Fraud" },
  { icon: "📋", name: "Duplicate Detection",   f1: "0.83", best: "Payroll Fraud" },
  { icon: "🔤", name: "NLP Keyword Scan",      f1: "0.62", best: "Procurement Fraud" },
  { icon: "📒", name: "Journal Entry Testing", f1: "0.71", best: "Financial Statement Fraud" },
];

export default function DashboardPage({ onNavigateAnalysis, onNavigateHistory, lastResults, historyCount }) {
  const { user }  = useUser();
  const [recentCount, setRecentCount] = useState(0);

  useEffect(() => {
    apiGetHistory().then(data => {
      if (Array.isArray(data)) setRecentCount(data.length);
    }).catch(() => {});
  }, [historyCount]);

  const initial = user?.username ? user.username[0].toUpperCase() : "?";

  return (
    <div>
      {/* Welcome banner */}
      <div style={{background:"linear-gradient(135deg,#1a2744 0%,#1e40af 100%)",borderRadius:14,padding:"28px 32px",marginBottom:24,display:"flex",justifyContent:"space-between",alignItems:"center",color:"white",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,opacity:0.05,backgroundImage:"linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",backgroundSize:"30px 30px"}} />
        <div style={{position:"relative"}}>
          <div style={{fontSize:13,opacity:0.7,marginBottom:6,fontFamily:"var(--mono)"}}>Good day, {user?.username}</div>
          <h2 style={{fontSize:26,fontWeight:700,marginBottom:8,letterSpacing:"-0.5px"}}>Forensic Analytics Dashboard</h2>
          <p style={{fontSize:13,opacity:0.75,maxWidth:480}}>Upload a financial transactions CSV to scan for fraud using six validated forensic analytics techniques. Results are saved automatically.</p>
          <div style={{marginTop:20,display:"flex",gap:10}}>
            <button className="btn btn-success" onClick={onNavigateAnalysis}>⬡ Run New Analysis</button>
            <button className="btn" style={{background:"rgba(255,255,255,0.12)",color:"white",border:"1px solid rgba(255,255,255,0.2)"}} onClick={onNavigateHistory}>◷ View History ({recentCount})</button>
          </div>
        </div>
        <div style={{width:80,height:80,borderRadius:"50%",background:"rgba(59,130,246,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,position:"relative",flexShrink:0}}>{initial}</div>
      </div>

      {/* Quick stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
        {[
          {label:"Total Analyses Run",  value:recentCount,  icon:"◷"},
          {label:"Detection Advantage", value:"35.9pp",     icon:"↑"},
          {label:"Best ML F1 Score",    value:"0.85",       icon:"⬡"},
          {label:"Techniques Active",   value:"6",          icon:"✦"},
        ].map((s,i) => (
          <div className="card" key={i} style={{padding:"18px 20px"}}>
            <div style={{fontSize:22,marginBottom:8}}>{s.icon}</div>
            <div style={{fontFamily:"var(--mono)",fontSize:24,fontWeight:600,color:"var(--blue-electric)"}}>{s.value}</div>
            <div style={{fontSize:12,color:"var(--text-muted)",marginTop:4}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Last analysis summary */}
      {lastResults && (
        <div className="panel" style={{marginBottom:24,borderLeft:"4px solid var(--blue-electric)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div>
              <h3 style={{marginBottom:2}}>Most Recent Analysis</h3>
              <p style={{fontSize:12,color:"var(--text-muted)",fontFamily:"var(--mono)"}}>{lastResults.filename} — {lastResults.total_rows} transactions</p>
            </div>
            <div style={{display:"flex",gap:8}}>
              <span className={`risk-badge ${lastResults.overall_risk}`}>{lastResults.overall_risk} RISK</span>
              <button className="btn btn-secondary btn-sm" onClick={onNavigateAnalysis}>View Results →</button>
            </div>
          </div>
          <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
            {[
              {label:"ML Flagged",   val:lastResults.ml_anomalies?.flagged_count},
              {label:"Duplicates",   val:lastResults.duplicates?.total_issues},
              {label:"NLP Flags",    val:lastResults.nlp?.flagged_count},
              {label:"Network Hubs", val:lastResults.network?.suspicious_node_count},
              {label:"Journal Flags",val:lastResults.journal?.flagged_count},
            ].map((s,i) => (
              <div key={i}>
                <div style={{fontFamily:"var(--mono)",fontSize:20,fontWeight:600,color:"var(--text-primary)"}}>{s.val ?? "—"}</div>
                <div style={{fontSize:11,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.4px"}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technique cards */}
      <h3 style={{fontSize:15,fontWeight:700,marginBottom:14,color:"var(--text-primary)"}}>Active Detection Techniques</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
        {TECHNIQUE_CARDS.map((t,i) => (
          <div className="card" key={i} style={{padding:"16px 18px",display:"flex",gap:14,alignItems:"flex-start"}}>
            <div style={{fontSize:24,flexShrink:0}}>{t.icon}</div>
            <div>
              <div style={{fontWeight:600,fontSize:14,color:"var(--text-primary)",marginBottom:3}}>{t.name}</div>
              <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--blue-electric)",marginBottom:4}}>Overall F1: {t.f1}</div>
              <div style={{fontSize:11,color:"var(--text-muted)"}}>Best for: {t.best}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
