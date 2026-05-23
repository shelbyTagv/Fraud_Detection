import { useState, useEffect } from "react";
import { UserProvider, useUser } from "./context/UserContext";

import Sidebar       from "./components/Sidebar";
import TopBar        from "./components/TopBar";
import LoginPage     from "./pages/LoginPage";
import RegisterPage  from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AnalysisPage  from "./pages/AnalysisPage";
import HistoryPage   from "./pages/HistoryPage";
import ProfilePage   from "./pages/ProfilePage";

import "./App.css";

function AppInner() {
  const { user }                          = useUser();
  const [page, setPage]                   = useState("login");
  const [results, setResults]             = useState(null);
  const [activeResultPage, setActiveResultPage] = useState(null);
  const [historyCount, setHistoryCount]   = useState(0);
  const [lastRun, setLastRun]             = useState(null);

  useEffect(() => {
    if (user) setPage("dashboard");
  }, [user]);

  function handleLogin() { setPage("dashboard"); }

  function handleResults(r) {
    setResults(r);
    setHistoryCount(c => c + 1);
    setLastRun(new Date().toLocaleTimeString());
    // After analysis completes, default to showing Data Overview
    setActiveResultPage("data_overview");
    setPage("analysis");
  }

  // Not logged in
  if (!user) {
    return (
      <>
        {page === "login" && (
          <LoginPage
            onLogin={handleLogin}
            onGoRegister={() => setPage("register")}
          />
        )}
        {page === "register" && (
          <RegisterPage
            onRegistered={() => setPage("login")}
            onGoLogin={() => setPage("login")}
          />
        )}
      </>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        onNavigate={(p) => {
          setPage(p);
          if (p !== "analysis") setActiveResultPage(null);
        }}
        analysisCount={historyCount}
        results={results}
        activeResultPage={activeResultPage}
        onResultPageChange={setActiveResultPage}
      />
      <div className="main-area">
        <TopBar
          page={page}
          activeResultPage={activeResultPage}
          lastAnalysis={lastRun}
          results={results}
        />
        <div className="page-content">
          {page === "dashboard" && (
            <DashboardPage
              onNavigateAnalysis={() => setPage("analysis")}
              onNavigateHistory={() => setPage("history")}
              lastResults={results}
              historyCount={historyCount}
            />
          )}
          {page === "analysis" && (
            <AnalysisPage
              results={results}
              onResults={handleResults}
              activeResultPage={activeResultPage}
              onResultPageChange={setActiveResultPage}
            />
          )}
          {page === "history"  && <HistoryPage />}
          {page === "profile"  && <ProfilePage />}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppInner />
    </UserProvider>
  );
}
