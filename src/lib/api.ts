const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
export async function api(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type":"application/json", ...(token? { Authorization:`Bearer ${token}` }:{}) };
  const res = await fetch(API + path, { ...opts, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
