import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function Home({ user, setUser }) {
  const navigate = useNavigate();
  const [view, setView] = useState("menu"); 

  const handleLogin = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.username);
        setView("menu");
      } else {
        alert("Login failed: " + (data.error || "Check credentials"));
      }
    } catch (e) { alert("Server not responding."); }
  };

  const createRoom = async (version, code) => {
    try {
      const res = await fetch(`${API_BASE}/api/rooms/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ gameVersion: version, code }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/room/${data.id}`, { state: { code: data.code, version: data.gameVersion } });
      } else {
        alert("Room error: " + (data.detail || "Access denied"));
      }
    } catch (e) { alert("Failed to connect to Terminal."); }
  };

  const joinRoom = async () => {
      const inputCode = document.getElementById('join-code').value;
      if (!inputCode) return;
      try {
          // ИСПРАВЛЕНО: Добавлены credentials: "include"
          const res = await fetch(`${API_BASE}/api/rooms/code/${inputCode}/`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: "include"
          });
          const data = await res.json();
          if (res.ok) {
              navigate(`/room/${data.id}`, { state: { code: data.code, version: data.gameVersion } });
          } else {
              // Теперь мы увидим реальную причину ошибки
              alert("Link failed: " + (data.detail || "Room not found or unauthorized"));
          }
      } catch (e) { 
          alert("Signal lost. Check connection to the Terminal."); 
      }
  }

  const handleRegister = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        alert("Account created!");
        setView("login");
      } else { alert("Registration failed."); }
    } catch (e) { console.error(e); }
  };

  const handleLogout = async () => {
      await fetch(`${API_BASE}/api/users/logout/`, { method: "POST", credentials: "include" });
      setUser(null);
      window.location.reload();
  };

  if (!user) {
      if (view === 'register') {
          return (
            <div className="screen" style={{display:'block'}}>
                <h1 className="logo">LETHAL COMPANY</h1>
                <div className="menu">
                    <h2>Register</h2>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleRegister(e.target.elements.reg_user.value, e.target.elements.reg_pass.value);
                    }}>
                        <input name="reg_user" className="input" placeholder="Username" />
                        <input name="reg_pass" className="input" placeholder="Password" type="password" />
                        <button className="btn">Create Account</button>
                    </form>
                    <button className="btn" onClick={() => setView("login")}>Back</button>
                </div>
            </div>
          )
      }
      return (
        <div className="screen" style={{display:'block'}}>
            <h1 className="logo">LETHAL COMPANY</h1>
            <div className="menu">
                <h2>Login</h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin(e.target.user.value, e.target.pass.value);
                }}>
                    <input name="user" className="input" placeholder="Username" />
                    <input name="pass" className="input" placeholder="Password" type="password" />
                    <button className="btn">Login</button>
                </form>
                <button className="btn" onClick={() => setView("register")}>Register</button>
            </div>
        </div>
      );
  }

  if (view === "create") {
      return (
        <div className="screen" style={{display:'block'}}>
            <h1 className="logo small">Create Room</h1>
            <div className="menu" style={{width: 350}}>
                <label>Game Version:</label>
                <select id="ver" className="input"><option>1.6.1</option><option>1.6.2</option></select>
                <label>Room Code:</label>
                <input id="code" className="input" placeholder="Optional code" />
                <button className="btn" onClick={() => {
                    const ver = document.getElementById('ver').value;
                    const code = document.getElementById('code').value || Math.random().toString(36).substr(2,4).toUpperCase();
                    createRoom(ver, code);
                }}>Confirm & Launch</button>
                <button className="btn" onClick={() => setView("menu")}>Cancel</button>
            </div>
        </div>
      )
  }

  if (view === "join") {
      return (
        <div className="screen" style={{display:'block'}}>
            <h1 className="logo small">Join Room</h1>
            <div className="menu">
                <input id="join-code" className="input" placeholder="Enter Code" />
                <button className="btn" onClick={joinRoom}>Establish Link</button>
                <button className="btn" onClick={() => setView("menu")}>Cancel</button>
            </div>
        </div>
      )
  }

  return (
    <div className="screen" style={{display:'block'}}>
      <h1 className="logo small" style={{borderBottom: '1px solid #f7a85d'}}>
        Lethal Company <span style={{fontSize:14, color:'#666'}}>Speedrun Helper</span>
      </h1>
      <div style={{display:'flex', height:'80vh'}}>
        <div style={{width:200, borderRight:'1px solid #333', padding:10, display:'flex', flexDirection:'column', gap:10}}>
            <div style={{textAlign:'center', color:'#fff', marginBottom:10}}>User: <b>{user}</b></div>
            <button className="btn" onClick={() => navigate("/profile")}>My Profile</button>
            <button className="btn" onClick={handleLogout}>Logout</button>
            <div style={{height:20}}></div>
            <button className="btn" onClick={() => setView("create")}>Create Room</button>
            <button className="btn" onClick={() => setView("join")}>Join Room</button>
            <button className="btn" onClick={() => navigate("/forum")}>Comms (Forum)</button>
        </div>
        <div style={{flex:1, padding:20}}>
            <h2>Updates</h2>
            <p style={{color:'#888'}}>Welcome back, employee {user}. All systems nominal.</p>
        </div>
      </div>
    </div>
  );
}