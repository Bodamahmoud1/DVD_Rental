import { createContext, useContext, useState, useEffect } from "react";
import { apiLogin, apiRegister, apiGetMe, apiGetMyRentals } from "../services/api";

const AuthContext = createContext(null);

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const getRentalStatus = (rental) => {
  if (rental?.returnDate) return "done";
  const due = rental?.dueDateBack ? new Date(rental.dueDateBack) : null;
  if (!due || Number.isNaN(due.getTime())) return "active";

  const now = new Date();
  const msLeft = due.getTime() - now.getTime();
  if (msLeft < 0) return "over";
  if (msLeft <= 2 * 24 * 60 * 60 * 1000) return "due";
  return "active";
};

const normalizeRentals = (payload) => {
  if (!Array.isArray(payload)) return [];
  return payload.map((r, index) => ({
    id: r?._id || r?.id || `rental-${index}`,
    filmId: r?.copyId?.filmId?._id || r?.copyId?.filmId || r?.filmId || null,
    filmTitle: r?.copyId?.filmId?.filmTitle || r?.filmTitle || "Untitled Film",
    dateRented: formatDate(r?.dateRented),
    dueDateBack: formatDate(r?.dueDateBack),
    status: getRentalStatus(r),
    overdue: Number(r?.overDueCost || r?.overdue || 0),
    returnDate: r?.returnDate || null,
  }));
};

const normalizeUser = (raw) => {
  if (!raw) return null;
  const name = raw.name || raw.memberName || "Member";
  const parts = String(name).trim().split(/\s+/);
  const initials =
    raw.initials ||
    ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() ||
    "?";
  const balance = raw.balance != null ? Number(raw.balance) : 0;
  return { ...raw, name, memberName: raw.memberName || name, initials, balance };
};

export function AuthProvider({ children }) {
  const [user,     setUser]     = useState(null);
  const [rentals,  setRentals]  = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading,  setLoading]  = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem("cv_token");
    if (token) {
      apiGetMe()
        .then(u => { setUser(normalizeUser(u)); return apiGetMyRentals(); })
        .then(d => setRentals(normalizeRentals(d?.rentals)))
        .catch(() => localStorage.removeItem("cv_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const patchUser = (partial) => {
    setUser((prev) => (prev ? normalizeUser({ ...prev, ...partial }) : null));
  };

  const refreshUser = async () => {
    const u = await apiGetMe();
    setUser(normalizeUser(u));
  };

  const login = async (email, password) => {
    const data = await apiLogin({ email, password });
    localStorage.setItem("cv_token", data.token);
    setUser(normalizeUser(data.member));
    const rd = await apiGetMyRentals();
    setRentals(normalizeRentals(rd?.rentals));
    return normalizeUser(data.member);
  };

  const register = async (values) => {
    const data = await apiRegister({
      memberName: values.firstName + " " + values.lastName,
      email: values.email, password: values.password, phone: values.phone,
    });
    localStorage.setItem("cv_token", data.token);
    setUser(normalizeUser(data.member));
    setRentals([]);
    return normalizeUser(data.member);
  };

  const logout = () => {
    localStorage.removeItem("cv_token");
    setUser(null); setRentals([]); setWishlist([]);
  };

  const refreshRentals = async () => {
    try {
      const d = await apiGetMyRentals();
      setRentals(normalizeRentals(d?.rentals));
    } catch {}
  };

  const toggleWishlist = (filmOrId) => {
    const filmId = String(filmOrId?._id || filmOrId?.id || filmOrId || "");
    if (!filmId) return;

    setWishlist((prev) => {
      const exists = prev.some((entry) => entry.id === filmId);
      if (exists) return prev.filter((entry) => entry.id !== filmId);

      const film = typeof filmOrId === "object" && filmOrId !== null ? filmOrId : null;
      return [...prev, { id: filmId, film }];
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, rentals, refreshRentals, refreshUser, patchUser, wishlist, toggleWishlist, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
