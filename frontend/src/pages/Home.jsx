import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config"; // Імпорт

export default function Home({ user, setUser }) {
  const navigate = useNavigate();
  const [view, setView] = useState("menu");
  
  // React-style: тримаємо дані форми в стейті
  const [createData, setCreateData] = useState({ version: "1.6.1", code: "" });
  const [joinCode, setJoinCode] = useState("");

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
        alert(data.error || "Login failed");
      }
    } catch (e) { alert("Connection error."); }
  };

  const handleCreateRoom = async () => {
    const code = (createData.code || Math.random().toString(36).slice(2,4)).toUpperCase();
    try {
      const res = await fetch(`${API_BASE}/api/rooms/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ gameVersion: createData.version, code }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/room/${data.id}`, { state: { code: data.code, version: data.gameVersion } });
      }
    } catch (e) { alert("Failed to transmit."); }
  };

  const handleJoinRoom = async () => {
    if (!joinCode) return;
    try {
        const res = await fetch(`${API_BASE}/api/rooms/code/${joinCode}/`, { credentials: "include" });
        const data = await res.json();
        if (res.ok) {
            navigate(`/room/${data.id}`, { state: { code: data.code, version: data.gameVersion } });
        } else {
            alert("Room not found.");
        }
    } catch (e) { alert("Signal lost."); }
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
                        // handleRegister logic here
                    }}>
                        <input name="user" className="input" placeholder="Username" />
                        <input name="pass" className="input" placeholder="Password" type="password" />
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
                <select className="input" value={createData.version} onChange={e => setCreateData({...createData, version: e.target.value})}>
                    <option>1.6.1</option>
                    <option>1.6.2</option>
                </select>
                <label>Room Code:</label>
                <input className="input" placeholder="Optional custom code" value={createData.code} onChange={e => setCreateData({...createData, code: e.target.value.toUpperCase})} />
                <button className="btn" onClick={handleCreateRoom}>Confirm & Launch</button>
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
                <input className="input" placeholder="Enter link code" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} />
                <button className="btn" onClick={handleJoinRoom}>Establish Link</button>
                <button className="btn" onClick={() => setView("menu")}>Cancel</button>
            </div>
        </div>
      )
  }

  return (
    <div className="screen" style={{display:'block'}}>
      <h1 className="logo small" style={{borderBottom: '1px solid #f7a85d'}}>Lethal Company Helper</h1>
      <div style={{display:'flex', height:'80vh'}}>
        <div style={{width:200, borderRight:'1px solid #333', padding:10, display:'flex', flexDirection:'column', gap:10}}>
            <div style={{textAlign:'center', color:'#fff', marginBottom:10}}>Employee: <b>{user}</b></div>
            <button className="btn" onClick={() => navigate("/profile")}>Record File</button>
            <button className="btn" onClick={handleLogout}>Clock Out</button>
            <div style={{height:20}}></div>
            <button className="btn" onClick={() => setView("create")}>Initialize Room</button>
            <button className="btn" onClick={() => setView("join")}>Link to Room</button>
            <button className="btn" onClick={() => navigate("/forum")}>Comms (Forum)</button>
        </div>
        <div style={{flex:1, padding:20}}><h2>Terminal Active</h2><p style={{color:'#888'}}>Welcome back, {user}. Systems Nominal.</p></div>
      </div>
    </div>
  );
}