import { useEffect, useState } from "react";
import { apiGetHistory, apiExportPDF } from "../api";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetHistory().then(data => {
      setHistory(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{textAlign:"center",padding:60,color:"var(--text-muted)"}}>Loading history...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Analysis History</h2>
        <p className="page-subtitle">All previous analysis runs are saved here. Click Export to download a PDF report.</p>
      </div>

      {history.length === 0 ? (
        <div className="no-history">
          <div className="no-history-icon">◷</div>
          <div className="no-history-text">No analyses yet.</div>
          <p style={{fontSize:13,marginTop:8}}>Go to Run Analysis and upload a CSV to get started.</p>
        </div>
      ) : (
        <div className="history-grid">
          {history.map(r => (
            <div className="history-card" key={r.id}>
              <div className="history-card-header">
                <div>
                  <div className="history-card-filename">{r.filename}</div>
                  <div className="history-card-date">{r.created_at}</div>
                </div>
                <span className={`risk-badge ${r.overall_risk}`}>{r.overall_risk}</span>
              </div>
              <div className="history-card-stats">
                <div className="history-stat">
                  <div className="history-stat-label">Transactions</div>
                  <div className="history-stat-value">{r.total_transactions?.toLocaleString()}</div>
                </div>
                <div className="history-stat">
                  <div className="history-stat-label">ML Flagged</div>
                  <div className="history-stat-value">{r.ml_flagged_count}</div>
                </div>
                <div className="history-stat">
                  <div className="history-stat-label">Duplicates</div>
                  <div className="history-stat-value">{r.duplicates_found}</div>
                </div>
                <div className="history-stat">
                  <div className="history-stat-label">NLP Flags</div>
                  <div className="history-stat-value">{r.nlp_flagged_count}</div>
                </div>
              </div>
              <div className="history-card-footer">
                <span style={{fontSize:12,color:"var(--text-muted)",fontFamily:"var(--mono)"}}>{r.benford_conformity || "—"}</span>
                <button className="btn btn-danger btn-sm" onClick={() => apiExportPDF(r.id)}>📄 Export PDF</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
