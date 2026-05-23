export default function MLPanel({ data }) {
  if (!data) return null;
  return (
    <div className="panel">
      <h3>🤖 ML Anomaly Detection — XGBoost + Isolation Forest Ensemble</h3>
      <p className="panel-desc">
        Isolation Forest generates pseudo-labels from your data, then XGBoost trains on
        those labels and re-scores every transaction. No pre-trained model or external
        dataset required — trains fresh on each upload in ~2 seconds.
        Overall F1-score: 0.85 (highest of all techniques per Table 4.10).
      </p>
      <div className="stat-row">
        <div className="stat"><strong>{data.flagged_count}</strong><br/>Flagged</div>
        <div className="stat"><strong>{data.total_transactions}</strong><br/>Total</div>
        <div className="stat"><strong>{data.flagged_percentage}%</strong><br/>Anomaly Rate</div>
        <div className="stat"><span className={`risk-badge ${data.risk}`}>{data.risk}</span><br/>Risk</div>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Transaction ID</th><th>Vendor</th><th>Employee</th>
            <th>Amount (USD)</th><th>Risk Score</th><th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.flagged_transactions?.map((t, i) => (
            <tr key={i}>
              <td>{t.transaction_id}</td>
              <td>{t.vendor_name}</td>
              <td>{t.employee_id}</td>
              <td>${t.amount_usd?.toLocaleString()}</td>
              <td style={{color:"#c0392b", fontWeight:600}}>{t.risk_score}</td>
              <td>{t.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
