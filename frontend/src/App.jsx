import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./pages/Room";
import Forum from "./pages/Forum";
import Profile from "./pages/Profile";

// Определяем базовый URL для API
const API_BASE = import.meta.env.VITE_API_URL || "";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Используем API_BASE
      const res = await fetch(`${API_BASE}/api/users/me/`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.username);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("Auth check failed", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{color:'#f7a85d', padding:20}}>Loading system...</div>;

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home user={user} setUser={setUser} />} />
          <Route 
            path="/forum" 
            element={user ? <Forum user={user} /> : <Navigate to="/" />} 
          />
          <Route path="/room/:roomId" element={<Room user={user} />} />
          <Route 
            path="/profile" 
            element={user ? <Profile user={user} /> : <Navigate to="/" />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;