// All API calls go through this file.
// Token is stored in localStorage and sent with every request.
const getBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return "https://fraud-detection-1qg5.onrender.com";
};

const BASE_URL = getBaseUrl();

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function apiRegister(username, email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  return res.json();
}

export async function apiLogin(username, password) {
  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    body: form,
  });
  return res.json();
}

export async function apiAnalyse(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/analyse`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Analysis failed");
  }
  return res.json();
}

export async function apiGetHistory() {
  const res = await fetch(`${BASE_URL}/history`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function apiExportPDF(analysisId) {
  const res = await fetch(`${BASE_URL}/export/${analysisId}`, {
    headers: authHeaders(),
  });
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `forensic_report_${analysisId}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
}
