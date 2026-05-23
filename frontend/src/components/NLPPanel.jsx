export default function NLPPanel({ data }) {
  if (!data || data.error) return <div className="panel"><p>{data?.error || "No data"}</p></div>;
  return (
    <div className="panel">
      <h3>🔤 NLP Keyword Scan</h3>
      <p className="panel-desc">
        Scans transaction descriptions for red-flag language patterns associated with
        procurement fraud, including sole-source bypassing, emergency payments, and cash-only requests.
      </p>
      <div className="stat-row">
        <div className="stat"><strong>{data.flagged_count}</strong><br/>Flagged Transactions</div>
        <div className="stat"><strong>{data.total_scanned}</strong><br/>Total Scanned</div>
        <div className="stat"><span className={`risk-badge ${data.risk}`}>{data.risk}</span><br/>Risk</div>
      </div>

      {data.keyword_summary?.length > 0 && (
        <div style={{margin:"16px 0"}}>
          <h4 style={{fontSize:13, marginBottom:8}}>Red-Flag Keywords Found</h4>
          <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
            {data.keyword_summary.map((k, i) => (
              <span key={i} className="flag-tag">"{k.keyword}" × {k.count}</span>
            ))}
          </div>
        </div>
      )}

      <table className="data-table">
        <thead><tr><th>ID</th><th>Vendor</th><th>Amount (USD)</th><th>Description</th><th>Flags</th></tr></thead>
        <tbody>
          {data.flagged_transactions?.map((t, i) => (
            <tr key={i}>
              <td>{t.transaction_id}</td>
              <td>{t.vendor_name}</td>
              <td>${t.amount_usd?.toLocaleString()}</td>
              <td style={{fontSize:12}}>{t.description}</td>
              <td>{t.flags?.map((f, j) => <span key={j} className="flag-tag">{f}</span>)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
