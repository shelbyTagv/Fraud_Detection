// FA-CMM — Forensic Analytics Capability Maturity Model
// 5 levels per Table 4.16 of the research document (Mushayiwedu, 2026)
// The system auto-suggests a maturity level based on what this analysis found

const LEVELS = [
  {
    level: 1,
    stage: "Initial",
    detection_range: "< 25%",
    description: "No systematic analytics. Fraud detection entirely reactive, relying on tip-offs and accidental discovery.",
    indicators: [
      "No analytics mandate in audit charter",
      "Audit Committee unaware of forensic analytics tools"
    ],
    next_step: "Conduct Phase 1 Readiness Assessment. Obtain Audit Committee commitment to FA programme."
  },
  {
    level: 2,
    stage: "Developing",
    detection_range: "25–45%",
    description: "Benford's Law and duplicate detection in use. Basic vendor analysis. Multi-currency normalisation established.",
    indicators: [
      "FA referenced in internal audit charter",
      "Quarterly Audit Committee analytics reporting established",
      "Data extraction protocols documented"
    ],
    next_step: "Invest in staff forensic analytics training. Establish data governance policy. Deploy continuous monitoring foundation."
  },
  {
    level: 3,
    stage: "Defined",
    detection_range: "45–65%",
    description: "Machine learning models deployed. Network analysis active for procurement fraud. Continuous monitoring alerts running.",
    indicators: [
      "Dedicated FA function within internal audit",
      "ZACC Investigation Escalation Protocol operative",
      "Senior management support formally documented"
    ],
    next_step: "Deploy XGBoost / Gradient Boosting models. Expand network analysis scope. Implement NLP on procurement documentation."
  },
  {
    level: 4,
    stage: "Managed",
    detection_range: "65–80%",
    description: "Full ML suite (XGBoost, Autoencoders). Real-time transaction monitoring. NLP applied to all unstructured documents. SHAP explainability in reports.",
    indicators: [
      "Board-level forensic analytics reporting adopted",
      "External PAAB assurance on FA programme",
      "Deterrence communication programme active"
    ],
    next_step: "Implement deterrence communication strategy. Integrate FA into performance culture. Pursue regulatory recognition from PAAB/ZACC."
  },
  {
    level: 5,
    stage: "Optimising",
    detection_range: "> 80%",
    description: "AI-driven adaptive fraud detection. Continuous model recalibration. Predictive fraud risk scoring across all transactions in real time.",
    indicators: [
      "FA fully embedded in governance framework",
      "Annual independent QAIP review completed",
      "ACFE Zimbabwe Chapter exemplar status"
    ],
    next_step: "Contribute to ICAZ/ZIIA forensic analytics framework development. Mentor Level 1–3 organisations through professional body network."
  }
];

export default function MaturityPanel({ results }) {
  if (!results) return null;

  // Auto-suggest maturity level based on how many techniques found something
  const techniqueResults = [
    results?.benford?.suspicious,
    results?.ml_anomalies?.flagged_count > 0,
    results?.network?.suspicious_node_count > 0,
    results?.duplicates?.total_issues > 0,
    results?.nlp?.flagged_count > 0,
    results?.journal?.flagged_count > 0
  ];
  const techniqueCount = techniqueResults.filter(Boolean).length;

  const suggestedLevel =
    techniqueCount >= 5 ? 3 :
    techniqueCount >= 3 ? 2 : 1;

  return (
    <div className="panel">
      <h3>🎯 Forensic Analytics Capability Maturity Model (FA-CMM)</h3>
      <p className="panel-desc">
        Developed and expert-validated as part of this research (Delphi consensus, n=14 panellists).
        Locates your organisation's current FA maturity and provides a contextually appropriate
        development roadmap for the Zimbabwean manufacturing sector.
      </p>

      <div style={{
        background: "#eef1fa", border: "1px solid #c0ccec",
        borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 13
      }}>
        💡 <strong>Based on this analysis run:</strong> {techniqueCount} of 6 techniques
        produced findings. &nbsp;
        Suggested starting maturity level: <strong>Level {suggestedLevel} — {LEVELS[suggestedLevel - 1].stage}</strong>
      </div>

      {LEVELS.map(lvl => {
        const issuggested = lvl.level === suggestedLevel;
        return (
          <div key={lvl.level} style={{
            border:       issuggested ? "2px solid #2c4a8c" : "1px solid #e0e0e0",
            borderRadius: 10,
            padding:      16,
            marginBottom: 12,
            background:   issuggested ? "#f0f4fb" : "white"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <strong style={{ color: "#1a2744", fontSize: 15 }}>
                  Level {lvl.level} — {lvl.stage}
                </strong>
                {issuggested && (
                  <span style={{
                    background: "#2c4a8c", color: "white",
                    padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600
                  }}>
                    Suggested Level
                  </span>
                )}
              </div>
              <span style={{
                fontSize: 12, color: "#666",
                background: "#f0f0f0", padding: "3px 10px", borderRadius: 20
              }}>
                Detection Rate: {lvl.detection_range}
              </span>
            </div>

            <p style={{ fontSize: 13, color: "#444", marginBottom: 8 }}>
              {lvl.description}
            </p>

            <div style={{ marginBottom: 8 }}>
              {lvl.indicators.map((ind, i) => (
                <span key={i} style={{
                  display: "inline-block", fontSize: 11,
                  background: "#f5f5f5", color: "#555",
                  padding: "2px 8px", borderRadius: 4,
                  marginRight: 6, marginBottom: 4
                }}>
                  ✓ {ind}
                </span>
              ))}
            </div>

            <p style={{ fontSize: 12, color: "#27ae60", fontWeight: 600, marginTop: 4 }}>
              → Next step: {lvl.next_step}
            </p>
          </div>
        );
      })}

      <p style={{ fontSize: 11, color: "#aaa", marginTop: 8 }}>
        Source: Mushayiwedu (2026) — FA-CMM Table 4.16. Expert-validated via modified Delphi technique (n=14, consensus threshold mean ≥ 4.0).
      </p>
    </div>
  );
}
