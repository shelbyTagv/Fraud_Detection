// Journal Entry Testing Panel
// Displays results from Technique 6 — Journal Entry Testing
// Flags: after-hours postings, period-end entries, round numbers, top-value transactions

export default function JournalPanel({ data }) {
  if (!data || data.error) {
    return (
      <div className="panel">
        <h3>📒 Journal Entry Testing</h3>
        <p>{data?.error || "No data available"}</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h3>📒 Journal Entry Testing</h3>
      <p className="panel-desc">
        Tests transaction patterns consistent with fraudulent journal entry manipulation.
        Per the research Performance Matrix (Table 4.10), this technique achieves
        F1=0.84 for Financial Statement Fraud — second most effective technique for that category.
      </p>

      <div className="stat-row">
        <div className="stat">
          <strong>{data.flagged_count}</strong><br />Flagged Entries
        </div>
        <div className="stat">
          <strong>{data.total_tested}</strong><br />Total Tested
        </div>
        <div className="stat">
          <strong>${data.top_3pct_threshold?.toLocaleString()}</strong><br />Top 3% Threshold (USD)
        </div>
        <div className="stat">
          <span className={`risk-badge ${data.risk}`}>{data.risk}</span><br />Risk Level
        </div>
      </div>

      {data.flagged_transactions?.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Date</th>
              <th>Vendor</th>
              <th>Employee</th>
              <th>Amount (USD)</th>
              <th>Flags Triggered</th>
            </tr>
          </thead>
          <tbody>
            {data.flagged_transactions.map((t, i) => (
              <tr key={i}>
                <td>{t.transaction_id}</td>
                <td>{t.date}</td>
                <td>{t.vendor_name}</td>
                <td>{t.employee_id}</td>
                <td>${t.amount_usd?.toLocaleString()}</td>
                <td>
                  {t.reasons?.map((r, j) => (
                    <span key={j} className="flag-tag">{r}</span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: "#27ae60", marginTop: 12 }}>
          ✅ No suspicious journal entry patterns detected.
        </p>
      )}
    </div>
  );
}
