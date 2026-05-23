import { useState } from "react";
import { apiAnalyse } from "../api";

export default function UploadPanel({ onResults }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyse() {
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      const results = await apiAnalyse(file);
      onResults(results);
    } catch (err) {
      setError(err.message || "Analysis failed");
    }
    setLoading(false);
  }

  return (
    <div className="upload-panel">
      <h3>Upload Transaction Data</h3>
      <p>Select a CSV file containing financial transactions. The system will automatically analyse it for fraud indicators.</p>
      <div className="upload-area">
        <label className="file-label" htmlFor="csv-upload">
          📁 Choose CSV File
        </label>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={e => setFile(e.target.files[0])}
        />
        {file && <span className="file-name">✅ {file.name}</span>}
        {file && !loading && (
          <button className="btn btn-success" onClick={handleAnalyse}>
            🔍 Run Analysis
          </button>
        )}
      </div>
      {loading && <p className="analysing-msg">⏳ Analysing transactions — fetching live exchange rates and running all 5 techniques...</p>}
      {error && <p style={{color:"#c0392b", marginTop:12}}>{error}</p>}
    </div>
  );
}
