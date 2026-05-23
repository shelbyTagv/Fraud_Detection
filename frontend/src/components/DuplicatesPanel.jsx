export default function DuplicatesPanel({ data }) {
  if (!data) return null;
  return (
    <div className="panel">
      <h3>📋 Duplicate Payment Detection</h3>
      <p className="panel-desc">
        Detects exact duplicate transactions and near-duplicate vendor names that may indicate
        shell companies or double-payment fraud.
      </p>
      <div className="stat-row">
        <div className="stat"><strong>{data.exact_duplicate_count}</strong><br/>Exact Duplicates</div>
        <div className="stat"><strong>{data.fuzzy_match_count}</strong><br/>Similar Vendors</div>
        <div className="stat"><strong>{data.total_issues}</strong><br/>Total Issues</div>
        <div className="stat"><span className={`risk-badge ${data.risk}`}>{data.risk}</span><br/>Risk</div>
      </div>

      {data.exact_duplicates?.length > 0 && (
        <>
          <h4 style={{fontSize:13, margin:"16px 0 8px"}}>Exact Duplicate Transactions</h4>
          <table className="data-table">
            <thead><tr><th>ID</th><th>Invoice</th><th>Vendor</th><th>Amount (USD)</th><th>Date</th><th>Employee</th></tr></thead>
            <tbody>
              {data.exact_duplicates.map((d, i) => (
                <tr key={i}>
                  <td>{d.transaction_id}</td>
                  <td style={{color:"#c0392b"}}>{d.invoice_number}</td>
                  <td>{d.vendor_name}</td>
                  <td>${d.amount_usd?.toLocaleString()}</td>
                  <td>{d.date}</td>
                  <td>{d.employee_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {data.fuzzy_vendor_matches?.length > 0 && (
        <>
          <h4 style={{fontSize:13, margin:"16px 0 8px"}}>Similar Vendor Names (Possible Shell Companies)</h4>
          <table className="data-table">
            <thead><tr><th>Vendor 1</th><th>Vendor 2</th><th>Similarity</th><th>Risk</th></tr></thead>
            <tbody>
              {data.fuzzy_vendor_matches.map((f, i) => (
                <tr key={i}>
                  <td>{f.vendor_1}</td>
                  <td>{f.vendor_2}</td>
                  <td>{f.similarity_score}%</td>
                  <td><span className={`risk-badge ${f.risk}`}>{f.risk}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
