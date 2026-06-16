export default function SummaryCards({ results, onExport, exporting }) {
  const r = results;
  return (
    <div style={{marginBottom: 20}}>
      <div className="summary-cards">
        <div className={`stat-card ${r.overall_risk}`}>
          <div className="stat-card-label">Overall Risk</div>
          <div style={{marginBottom: 4}}>
            <span className={`risk-badge ${r.overall_risk}`}>{r.overall_risk}</span>
          </div>
          <div className="stat-card-sub" style={{fontFamily: "var(--mono)", fontSize: 11}}>{r.filename}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Transactions</div>
          <div className="stat-card-value">{r.total_rows?.toLocaleString()}</div>
          <div className="stat-card-sub">Analysed</div>
        </div>
        <div className={`stat-card ${r.benford?.risk}`}>
          <div className="stat-card-label">Benford's Law</div>
          <div className="stat-card-value" style={{fontSize: 13, marginTop: 4}}>
            {r.benford?.conformity}
          </div>
          <div className="stat-card-sub">MAD: {r.benford?.mad}</div>
        </div>
        <div className={`stat-card ${r.ml_anomalies?.risk}`}>
          <div className="stat-card-label">ML Flagged</div>
          <div className="stat-card-value">{r.ml_anomalies?.flagged_count}</div>
          <div className="stat-card-sub">{r.ml_anomalies?.flagged_percentage}% of total</div>
        </div>
      </div>

      <div style={{display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap"}}>
        <span style={{fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--mono)"}}>
          💱 1 USD = {r.zig_rate_used} ZiG &nbsp;·&nbsp; rates: {r.exchange_rate_source}
        </span>
        <button
          className="btn btn-danger btn-sm"
          style={{marginLeft: "auto"}}
          onClick={onExport}
          disabled={exporting}
        >
          {exporting ? "Generating..." : "📄 Export PDF Report"}
        </button>
      </div>
    </div>
  );
}
