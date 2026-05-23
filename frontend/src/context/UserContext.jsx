import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [prefs, setPrefs] = useState({
    theme:              "light",
    defaultTab:         "benford",
    autoExportPDF:      false,
    showMonoNumbers:    true,
    compactTables:      false,
    alertSensitivity:   "medium",
    currency:           "USD",
    organisation:       "",
    role:               "",
    emailNotifications: false,
    language:           "en",
  });

  useEffect(() => {
    const savedPrefs = localStorage.getItem("fa_prefs");
    if (savedPrefs) {
      try { setPrefs(JSON.parse(savedPrefs)); } catch {}
    }
    const token    = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const email    = localStorage.getItem("email");
    if (token && username) {
      setUser({ username, email: email || "", token });
    }
  }, []);

  function login(username, email, token) {
    localStorage.setItem("token",    token);
    localStorage.setItem("username", username);
    localStorage.setItem("email",    email || "");
    setUser({ username, email: email || "", token });
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    setUser(null);
  }

  function updatePrefs(newPrefs) {
    const merged = { ...prefs, ...newPrefs };
    setPrefs(merged);
    localStorage.setItem("fa_prefs", JSON.stringify(merged));
  }

  return (
    <UserContext.Provider value={{ user, prefs, login, logout, updatePrefs }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
