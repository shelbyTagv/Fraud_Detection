// DATA OVERVIEW PAGE
// Shows summary statistics about the uploaded CSV:
// transaction count, date range, currency breakdown, top vendors,
// top employees, amount distribution, department breakdown.
// All data comes from results already returned by the API — no new API call.

export default function DataOverviewPage({ results }) {
  if (!results) return null;

  // ── Derive stats from the raw results ────────────────────────────
  const ml        = results.ml_anomalies  || {};
  const network   = results.network       || {};
  const dupes     = results.duplicates    || {};
  const nlp       = results.nlp           || {};
  const benford   = results.benford       || {};
  const journal   = results.journal       || {};

  const totalTxns    = results.total_rows || 0;
  const totalFlagged = (ml.flagged_count || 0)
                     + (dupes.total_issues || 0)
                     + (nlp.flagged_count  || 0)
                     + (journal.flagged_count || 0);

  const overallRisk  = results.overall_risk || "LOW";
  const zigRate      = results.zig_rate_used || "N/A";
  const rateSource   = results.exchange_rate_source || "N/A";

  // Technique summary rows
  const techniqueSummary = [
    {
      name:    "Benford's Law",
      status:  benford.conformity || "—",
      risk:    benford.risk || "LOW",
      finding: benford.suspicious
               ? `MAD ${benford.mad} — digit anomaly detected`
               : `MAD ${benford.mad} — digits conform to expected distribution`,
    },
    {
      name:    "XGBoost ML",
      status:  `${ml.flagged_count || 0} flagged`,
      risk:    ml.risk || "LOW",
      finding: `${ml.flagged_percentage || 0}% of transactions scored as anomalous`,
    },
    {
      name:    "Network Analysis",
      status:  `${network.suspicious_node_count || 0} hubs`,
      risk:    network.risk || "LOW",
      finding: `${network.node_count || 0} nodes, ${network.edge_count || 0} payment relationships mapped`,
    },
    {
      name:    "Duplicate Detection",
      status:  `${dupes.total_issues || 0} issues`,
      risk:    dupes.risk || "LOW",
      finding: `${dupes.exact_duplicate_count || 0} exact duplicates, ${dupes.fuzzy_match_count || 0} similar vendor names`,
    },
    {
      name:    "NLP Keyword Scan",
      status:  `${nlp.flagged_count || 0} flagged`,
      risk:    nlp.risk || "LOW",
      finding: `${(nlp.keyword_summary || []).length} unique red-flag keywords found`,
    },
    {
      name:    "Journal Entry Testing",
      status:  `${journal.flagged_count || 0} flagged`,
      risk:    journal.risk || "LOW",
      finding: `${journal.flagged_count || 0} entries triggered after-hours, round-number, or period-end rules`,
    },
  ];

  const riskColors = { HIGH: "#ef4444", MEDIUM: "#f59e0b", LOW: "#10b981" };
  const riskBgs    = { HIGH: "#fee2e2", MEDIUM: "#fef3c7", LOW: "#d1fae5" };

  return (
    <div>

      {/* ── TOP STAT STRIP ────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 14,
        marginBottom: 24
      }}>
        {[
          { label: "Total Transactions", value: totalTxns.toLocaleString(),  icon: "⬡", color: "var(--blue-electric)" },
          { label: "Overall Risk Level",  value: overallRisk,                 icon: "◎", color: riskColors[overallRisk] },
          { label: "Total Issues Found",  value: totalFlagged.toLocaleString(),icon: "⚑", color: "#f59e0b" },
          { label: "ZiG / USD Rate",      value: `${zigRate}`,               icon: "💱", color: "var(--text-primary)" },
          { label: "Rate Source",         value: rateSource,                  icon: "🌐", color: "var(--text-muted)" },
          { label: "File Analysed",       value: results.filename,            icon: "📁", color: "var(--text-primary)" },
        ].map((s, i) => (
          <div className="card" key={i} style={{padding: "16px 18px"}}>
            <div style={{fontSize: 18, marginBottom: 6}}>{s.icon}</div>
            <div style={{
              fontFamily: "var(--mono)", fontSize: i === 5 ? 11 : 20,
              fontWeight: 600, color: s.color,
              wordBreak: "break-all", lineHeight: 1.2
            }}>
              {s.value}
            </div>
            <div style={{fontSize: 11, color: "var(--text-muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.4px"}}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20}}>

        {/* ── TECHNIQUE SUMMARY TABLE ──────────────────────────────── */}
        <div className="panel" style={{gridColumn: "1 / -1"}}>
          <h3>Analysis Run Summary</h3>
          <p className="panel-desc">
            Overview of what each technique found in this dataset.
            Click any technique in the sidebar to view its full results.
          </p>
          <table className="data-table">
            <thead>
              <tr>
                <th>Technique</th>
                <th>Result</th>
                <th>Risk</th>
                <th>Key Finding</th>
              </tr>
            </thead>
            <tbody>
              {techniqueSummary.map((t, i) => (
                <tr key={i}>
                  <td style={{fontWeight: 600}}>{t.name}</td>
                  <td style={{fontFamily: "var(--mono)", fontSize: 12}}>{t.status}</td>
                  <td>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: "var(--mono)",
                      background: riskBgs[t.risk],
                      color: riskColors[t.risk]
                    }}>
                      {t.risk}
                    </span>
                  </td>
                  <td style={{fontSize: 12, color: "var(--text-secondary)"}}>{t.finding}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── COMBINED RISK SNAPSHOT ────────────────────────────────── */}
        <div className="panel">
          <h3>Multi-Technique Risk Snapshot</h3>
          <p className="panel-desc">
            Transactions flagged by more than one technique simultaneously carry the highest risk.
          </p>
          {(results.combined_risk_table || []).slice(0, 8).length === 0 ? (
            <p style={{color: "var(--text-muted)", fontSize: 13}}>No cross-technique flags found.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Vendor</th>
                  <th>Amount (USD)</th>
                  <th>Techniques</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {(results.combined_risk_table || []).slice(0, 8).map((t, i) => (
                  <tr key={i}>
                    <td style={{fontFamily: "var(--mono)", fontSize: 11}}>{t.transaction_id}</td>
                    <td>{t.vendor_name}</td>
                    <td style={{fontFamily: "var(--mono)", fontSize: 12}}>
                      ${t.amount_usd?.toLocaleString()}
                    </td>
                    <td style={{fontSize: 11, color: "var(--text-secondary)"}}>{t.flagged_by}</td>
                    <td>
                      <span style={{
                        display: "inline-block", padding: "2px 8px",
                        borderRadius: 20, fontSize: 10, fontWeight: 700,
                        background: riskBgs[t.overall_risk],
                        color: riskColors[t.overall_risk]
                      }}>
                        {t.overall_risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── EXCHANGE RATE INFO ────────────────────────────────────── */}
        <div className="panel">
          <h3>Currency Normalisation</h3>
          <p className="panel-desc">
            All amounts were converted to USD before analysis using these rates.
          </p>
          <table className="data-table">
            <thead>
              <tr><th>Currency</th><th>Rate (per 1 USD)</th></tr>
            </thead>
            <tbody>
              {Object.entries(results.exchange_rates_used || {})
                .filter(([k]) => ["USD","ZIG","ZAR","GBP","EUR"].includes(k))
                .map(([currency, rate]) => (
                  <tr key={currency}>
                    <td style={{fontFamily: "var(--mono)", fontWeight: 600}}>{currency}</td>
                    <td style={{fontFamily: "var(--mono)"}}>{Number(rate).toFixed(4)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          <div style={{
            marginTop: 14, padding: "10px 14px",
            background: "var(--bg-input)", borderRadius: "var(--radius-sm)",
            fontSize: 12, color: "var(--text-muted)"
          }}>
            Source: <strong style={{color: "var(--text-primary)"}}>{rateSource}</strong>
            {rateSource === "fallback" && " — internet unavailable, hardcoded rates used"}
          </div>
        </div>

      </div>
    </div>
  );
}
