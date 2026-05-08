const BASE = "https://dvd-rental-jndm.vercel.app/api";

const getHeaders = () => {
  const token = localStorage.getItem("cv_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ── AUTH ──────────────────────────────────────────────────────
export const apiRegister = (body) =>
  fetch(`${BASE}/auth/register`, { method:"POST", headers:getHeaders(), body:JSON.stringify(body) }).then(handle);

export const apiLogin = (body) =>
  fetch(`${BASE}/auth/login`, { method:"POST", headers:getHeaders(), body:JSON.stringify(body) }).then(handle);

export const apiGetMe = () =>
  fetch(`${BASE}/auth/me`, { headers:getHeaders() }).then(handle);

// ── FILMS ─────────────────────────────────────────────────────
export const apiGetFilms = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return fetch(`${BASE}/films${q ? "?" + q : ""}`, { headers:getHeaders() }).then(handle);
};

export const apiGetFilm = (id) =>
  fetch(`${BASE}/films/${id}`, { headers:getHeaders() }).then(handle);

// ── RENTALS ───────────────────────────────────────────────────
export const apiCreateRental = (filmId) =>
  fetch(`${BASE}/rentals`, { method:"POST", headers:getHeaders(), body:JSON.stringify({ filmId }) }).then(handle);

export const apiGetMyRentals = () =>
  fetch(`${BASE}/rentals/my`, { headers:getHeaders() }).then(handle);

// ── MEMBERS ───────────────────────────────────────────────────
export const apiGetProfile = () =>
  fetch(`${BASE}/members/profile`, { headers:getHeaders() }).then(handle);

export const apiUpdateProfile = (body) =>
  fetch(`${BASE}/members/profile`, { method:"PUT", headers:getHeaders(), body:JSON.stringify(body) }).then(handle);

// ── CATALOG ───────────────────────────────────────────────────
export const apiGetCategories = () =>
  fetch(`${BASE}/categories`, { headers:getHeaders() }).then(handle);

export const apiGetActors = (name = "") =>
  fetch(`${BASE}/actors${name ? "?name=" + name : ""}`, { headers:getHeaders() }).then(handle);

// ── REVIEWS ───────────────────────────────────────────────────
export const apiGetReviews = (filmId) =>
  fetch(`${BASE}/reviews/${filmId}`, { headers:getHeaders() }).then(handle);

export const apiCreateReview = (filmId, stars, text) =>
  fetch(`${BASE}/reviews`, { method:"POST", headers:getHeaders(), body:JSON.stringify({ filmId, stars, text }) }).then(handle);

export const apiDeleteReview = (id) =>
  fetch(`${BASE}/reviews/${id}`, { method:"DELETE", headers:getHeaders() }).then(handle);

// ── PROFILE PICTURE ──────────────────────────────────────────
export const apiUploadProfilePic = (base64Image) =>
  fetch(`${BASE}/members/profile/picture`, { method:"PUT", headers:getHeaders(), body:JSON.stringify({ image: base64Image }) }).then(handle);

