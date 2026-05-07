import { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useToast } from "./hooks/useToast";
import { useDarkMode } from "./hooks/useDarkMode";
import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import FilmDetail from "./pages/FilmDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

function AppContent() {
  const { toasts, show, remove } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = useCallback((q) => setSearchQuery(q), []);
  const { dark, toggle } = useDarkMode();

  return (
    <>
      <Navbar onSearch={handleSearch} dark={dark} onToggleDark={toggle} />
      <Toast toasts={toasts} remove={remove} />
      <Routes>
        <Route path="/"          element={<Home searchQuery={searchQuery} showToast={show} />} />
        <Route path="/film/:id"  element={<FilmDetail showToast={show} />} />
        <Route path="/login"     element={<Login showToast={show} />} />
        <Route path="/register"  element={<Register showToast={show} />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard showToast={show} /></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><Profile showToast={show} /></ProtectedRoute>} />
        <Route path="*"          element={<Home searchQuery="" showToast={show} />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
