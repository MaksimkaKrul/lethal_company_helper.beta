import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { apiClient } from "./api/client";
import Home from "./pages/Home";
import Room from "./pages/Room";
import Forum from "./pages/Forum";
import Profile from "./pages/Profile";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await apiClient.get("/api/users/me/");
      if (data && data.username) {
        setUser(data.username);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: "#f7a85d", padding: 20 }}>
        Synchronizing with Terminal...
      </div>
    );
  }

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