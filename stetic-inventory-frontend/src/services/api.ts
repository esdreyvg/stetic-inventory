// Configuración base para llamadas a la API REST
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, options);
  if (!res.ok) throw new Error("API Error");
  return res.json();
}