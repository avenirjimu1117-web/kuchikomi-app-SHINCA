const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ADMIN_ACTIONS = new Set(["saveStoreConfig", "createStore", "deleteStore"]);
const ADMIN_PASSWORD_SESSION_KEY = "kuchikomi_admin_password";

function getAdminPassword() {
  let password = sessionStorage.getItem(ADMIN_PASSWORD_SESSION_KEY);
  if (!password) {
    password = window.prompt("管理者パスワードを入力してください") || "";
    if (!password) throw new Error("管理者認証をキャンセルしました");
    sessionStorage.setItem(ADMIN_PASSWORD_SESSION_KEY, password);
  }
  return password;
}

function assertConfigured() {
  if (!API_BASE_URL) {
    throw new Error(
      "VITE_API_BASE_URL が設定されていません。.env(または Vercel の環境変数)にGASの/exec URLを設定してください。"
    );
  }
}

async function unwrap(response) {
  const json = await response.json();
  if (!json.ok) {
    throw new Error(json.error || "APIエラーが発生しました");
  }
  return json.data;
}

export async function apiGet(action, params = {}) {
  assertConfigured();
  const url = new URL(API_BASE_URL);
  url.searchParams.set("action", action);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString(), { method: "GET" });
  return unwrap(res);
}

// GASのWebアプリはOPTIONSプリフライトに応答できないため、
// Content-Type: text/plain で送ってブラウザのプリフライトを回避する。
// doPost側は e.postData.contents をJSON.parseするので中身はJSONのままでよい。
export async function apiPost(action, body = {}) {
  assertConfigured();
  const requestBody = { action, ...body };
  if (ADMIN_ACTIONS.has(action)) {
    requestBody.adminPassword = getAdminPassword();
  }
  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(requestBody),
  });
  try {
    return await unwrap(res);
  } catch (error) {
    if (ADMIN_ACTIONS.has(action) && /管理者認証/.test(error.message || "")) {
      sessionStorage.removeItem(ADMIN_PASSWORD_SESSION_KEY);
    }
    throw error;
  }
}
