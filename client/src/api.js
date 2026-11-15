// Locally Vite forwards /api to Express. Online, VITE_API_URL points to Render.
const url = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

// One small helper keeps fetch code the same on every page.
export async function callApi(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData))
    headers["Content-Type"] = "application/json";

  const response = await fetch(url + path, {
    ...options,
    headers,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

// Resume files are downloaded as files, not as JSON.
export async function downloadFile(path, fileName) {
  const token = localStorage.getItem("token");
  const response = await fetch(url + path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error("Could not download this resume");
  const file = await response.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
