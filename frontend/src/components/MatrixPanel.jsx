// Fraud Type-Technique Performance Matrix
// Updated to match Table 4.10 from the research document exactly:
// - Added Currency / Exchange Rate Fraud row
// - Added Journal Entry Testing column
// - Displays F1 scores alongside HIGH/MEDIUM/LOW ratings

const FRAUD_TYPES = [
  "Procurement Fraud",
  "Payroll Fraud",
  "Inventory Manipulation",
  "Financial Statement Fraud",
  "Currency / Exchange Rate Fraud"
];

const TECHNIQUES = [
  { key: "benford",    label: "Benford's Law",         f1: "0.79" },
  { key: "ml",         label: "XGBoost / ML",          f1: "0.85" },
  { key: "network",    label: "Network Analysis",      f1: "0.81" },
  { key: "duplicates", label: "Duplicate Detection",   f1: "0.83" },
  { key: "nlp",        label: "NLP Scan",              f1: "0.62" },
  { key: "journal",    label: "Journal Entry Testing", f1: "0.71" }
];

export default function MatrixPanel({ data }) {
  if (!data) return null;

  return (
    <div className="panel">
      <h3>📈 Fraud Type–Technique Performance Matrix</h3>
      <p className="panel-desc">
        Auto-generated from this analysis run. Based on experimental F1-scores from
        testing on 17 Zimbabwean manufacturing organisations (Mushayiwedu, 2026 — Table 4.10).
        Shows which technique is most effective for each fraud category in the local context.
      </p>

      <div style={{ overflowX: "auto" }}>
        <table className="matrix-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left", minWidth: 160 }}>Fraud Type</th>
              {TECHNIQUES.map(t => (
                <th key={t.key}>
                  {t.label}<br />
                  <span style={{ fontSize: 10, opacity: 0.75 }}>Overall F1: {t.f1}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FRAUD_TYPES.map(ft => (
              <tr key={ft}>
                <td style={{ fontWeight: 600, color: "#1a2744" }}>{ft}</td>
                {TECHNIQUES.map(t => {
                  const val = data[ft]?.[t.key] || "—";
                  return (
                    <td key={t.key} className={`cell-${val}`}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12 }}>
        <span><span style={{
          background: "#eafaf1", color: "#27ae60",
          padding: "2px 8px", borderRadius: 4, fontWeight: 600
        }}>HIGH</span> F1 &gt; 0.75 — most effective</span>
        <span><span style={{
          background: "#fef0e6", color: "#e67e22",
          padding: "2px 8px", borderRadius: 4, fontWeight: 600
        }}>MEDIUM</span> F1 0.55–0.75 — moderately effective</span>
        <span><span style={{
          background: "#fdecea", color: "#c0392b",
          padding: "2px 8px", borderRadius: 4, fontWeight: 600
        }}>LOW</span> F1 &lt; 0.55 — less effective for this type</span>
      </div>

      <p style={{ fontSize: 11, color: "#aaa", marginTop: 10 }}>
        Source: Mushayiwedu (2026) — Table 4.10. Experimental testing on anonymised financial datasets
        from 17 Zimbabwean manufacturing companies (2023–2025).
      </p>
    </div>
  );
}
