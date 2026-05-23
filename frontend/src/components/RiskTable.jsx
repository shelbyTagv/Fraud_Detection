export default function RiskTable({ data }) {
  if (!data?.length) return (
    <div className="panel"><p>No cross-technique risk data available.</p></div>
  );

  return (
    <div className="panel">
      <h3>⚠️ Combined Risk Table</h3>
      <p className="panel-desc">
        Transactions flagged by multiple techniques simultaneously carry the highest risk.
        This table cross-references all 5 techniques to surface the most suspicious transactions.
      </p>
      <table className="data-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Vendor</th>
            <th>Amount (USD)</th>
            <th>Techniques Flagged</th>
            <th>Count</th>
            <th>Overall Risk</th>
          </tr>
        </thead>
        <tbody>
          {data.map((t, i) => (
            <tr key={i}>
              <td>{t.transaction_id}</td>
              <td>{t.vendor_name}</td>
              <td>${t.amount_usd?.toLocaleString()}</td>
              <td style={{fontSize:12}}>{t.flagged_by}</td>
              <td style={{fontWeight:700, color:"#c0392b"}}>{t.flagged_by_count}</td>
              <td><span className={`risk-badge ${t.overall_risk}`}>{t.overall_risk}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
