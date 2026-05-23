import { useEffect, useState } from "react";

const PAGE_META = {
  dashboard:    { title: "Dashboard",            crumb: "Home / Dashboard" },
  analysis:     { title: "Run Analysis",          crumb: "Home / Analysis" },
  history:      { title: "Analysis History",      crumb: "Home / History" },
  profile:      { title: "Profile & Preferences", crumb: "Home / Profile" },
};

const RESULT_PAGE_META = {
  data_overview: { title: "Data Overview",           crumb: "Analysis / Data Overview" },
  benford:       { title: "Benford's Law",            crumb: "Analysis / Benford's Law" },
  ml:            { title: "XGBoost ML Anomaly",       crumb: "Analysis / XGBoost ML" },
  network:       { title: "Network Analysis",         crumb: "Analysis / Network Analysis" },
  duplicates:    { title: "Duplicate Detection",      crumb: "Analysis / Duplicates" },
  nlp:           { title: "NLP Keyword Scan",         crumb: "Analysis / NLP Scan" },
  journal:       { title: "Journal Entry Testing",    crumb: "Analysis / Journal Entries" },
  matrix:        { title: "Performance Matrix",       crumb: "Analysis / Performance Matrix" },
  risk:          { title: "Combined Risk Table",      crumb: "Analysis / Risk Table" },
  maturity:      { title: "Maturity Model (FA-CMM)",  crumb: "Analysis / Maturity Model" },
};

export default function TopBar({ page, activeResultPage, lastAnalysis, results }) {
  // Pick the right metadata
  const meta = (page === "analysis" && activeResultPage)
    ? RESULT_PAGE_META[activeResultPage] || PAGE_META.analysis
    : PAGE_META[page] || { title: page, crumb: "Home" };

  const [rates, setRates] = useState({ USD: 1.00, ZAR: 18.50, ZWG: 13.56 });

  useEffect(() => {
    fetch("https://api.exchangerate-api.com/v4/latest/USD")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rates) {
          setRates({
            USD: 1.00,
            ZAR: data.rates.ZAR || 18.50,
            ZWG: data.rates.ZIG || data.rates.ZWG || 13.56,
          });
        }
      })
      .catch(() => {
        // Fallback already set in initial state
      });
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-title">{meta.title}</div>
        <div className="topbar-breadcrumb">{meta.crumb}</div>
      </div>
      <div className="topbar-right">
        {results && (
          <div className="topbar-chip">
            <span style={{
              fontFamily: "var(--mono)", fontSize: 11,
              color: "var(--text-secondary)"
            }}>
              {results.filename} &nbsp;·&nbsp; {results.total_rows?.toLocaleString()} rows
            </span>
          </div>
        )}
        {lastAnalysis && (
          <div className="topbar-chip">
            <span className="dot" />
            Last run: {lastAnalysis}
          </div>
        )}
        <div className="topbar-chip">
          💵 1 USD = {rates.ZWG.toFixed(2)} ZWG = {rates.ZAR.toFixed(2)} ZAR
        </div>
      </div>
    </div>
  );
}
