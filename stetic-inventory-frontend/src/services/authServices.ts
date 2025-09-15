export async function loginApi(username: string, password: string) {
  // Ejemplo de llamada al backend
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json(); // { user, token }
}