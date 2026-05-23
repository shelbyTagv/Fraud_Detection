import UploadPanel     from "../components/UploadPanel";
import SummaryCards    from "../components/SummaryCards";
import BenfordPanel    from "../components/BenfordPanel";
import MLPanel         from "../components/MLPanel";
import NetworkPanel    from "../components/NetworkPanel";
import DuplicatesPanel from "../components/DuplicatesPanel";
import NLPPanel        from "../components/NLPPanel";
import JournalPanel    from "../components/JournalPanel";
import MatrixPanel     from "../components/MatrixPanel";
import RiskTable       from "../components/RiskTable";
import MaturityPanel   from "../components/MaturityPanel";
import DataOverviewPage from "./DataOverviewPage";

import { useState }    from "react";
import { apiExportPDF } from "../api";

export default function AnalysisPage({
  results,
  onResults,
  activeResultPage,
  onResultPageChange,
}) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (!results?.analysis_id) return;
    setExporting(true);
    await apiExportPDF(results.analysis_id);
    setExporting(false);
  }

  function handleNewResults(r) {
    onResults(r);
    onResultPageChange("data_overview");
  }

  return (
    <div>

      {/* Upload panel — always shown so user can run a new analysis */}
      {!results && (
        <div className="page-header">
          <h2 className="page-title">Run Analysis</h2>
          <p className="page-subtitle">
            Upload a CSV file of financial transactions to scan for fraud
            using six validated forensic analytics techniques.
          </p>
        </div>
      )}

      <UploadPanel onResults={handleNewResults} />

      {/* Everything below only shows after an analysis has been run */}
      {results && (
        <>
          {/* Summary cards — always visible on every result page */}
          <SummaryCards
            results={results}
            onExport={handleExport}
            exporting={exporting}
          />

          {/* Divider */}
          <div style={{
            height: 1,
            background: "var(--border)",
            margin: "4px 0 20px"
          }} />

          {/* Render the selected technique page */}
          {activeResultPage === "data_overview" && (
            <DataOverviewPage results={results} />
          )}
          {activeResultPage === "benford" && (
            <BenfordPanel data={results.benford} />
          )}
          {activeResultPage === "ml" && (
            <MLPanel data={results.ml_anomalies} />
          )}
          {activeResultPage === "network" && (
            <NetworkPanel data={results.network} />
          )}
          {activeResultPage === "duplicates" && (
            <DuplicatesPanel data={results.duplicates} />
          )}
          {activeResultPage === "nlp" && (
            <NLPPanel data={results.nlp} />
          )}
          {activeResultPage === "journal" && (
            <JournalPanel data={results.journal} />
          )}
          {activeResultPage === "matrix" && (
            <MatrixPanel data={results.performance_matrix} />
          )}
          {activeResultPage === "risk" && (
            <RiskTable data={results.combined_risk_table} />
          )}
          {activeResultPage === "maturity" && (
            <MaturityPanel results={results} />
          )}

          {/* Fallback if no technique selected yet */}
          {!activeResultPage && (
            <div style={{
              textAlign: "center", padding: "48px 20px",
              color: "var(--text-muted)"
            }}>
              <div style={{fontSize: 36, marginBottom: 12}}>←</div>
              <div style={{fontSize: 15, fontWeight: 600}}>
                Select a technique from the sidebar
              </div>
              <p style={{fontSize: 13, marginTop: 6}}>
                Click any item under "Current Results" to view its findings
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
