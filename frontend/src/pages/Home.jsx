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
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        setUser(username);
        setView("menu");
      } else {
        alert("Login failed");
      }
    } catch (e) { console.error(e); }
  };

  const handleRegister = async (username, password) => {
    if (!username || !password) {
        alert("Please enter username and password");
        return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/users/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Account created! Now please login.");
        setView("login");
      } else {
        alert(JSON.stringify(data));
      }
    } catch (e) { 
        console.error(e); 
        alert("Registration error");
    }
  };

  const handleLogout = async () => {
      await fetch(`${API_BASE}/api/users/logout/`, { method: "POST" });
      setUser(null);
      setView("login");
  };

  const createRoom = async (version, code) => {
    try {
      const res = await fetch(`${API_BASE}/api/rooms/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameVersion: version, code }),
      });
      if (res.ok) {
        const data = await res.json();
        navigate(`/room/${data.id}`, { state: { code: data.code, version: data.gameVersion } });
      }
    } catch (e) { console.error(e); }
  };

  const joinRoom = async () => {
      const inputCode = document.getElementById('join-code').value;
      if (!inputCode) return;
      try {
          const res = await fetch(`${API_BASE}/api/rooms/code/${inputCode}/`);
          const data = await res.json();
          if (res.ok) {
              navigate(`/room/${data.id}`, { state: { code: data.code, version: data.gameVersion } });
          } else {
              alert(data.detail || "Room not found");
          }
      } catch (e) {
          console.error(e);
          alert("Connection error");
      }
  }

  // Оставляю твой UI без изменений...
  if (!user) {
      if (view === 'register') {
          return (
            <div className="screen" style={{display:'block'}}>
                <h1 className="logo">LETHAL COMPANY</h1>
                <div className="menu">
                    <h2>Register</h2>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const user = e.target.elements.reg_user.value;
                        const pass = e.target.elements.reg_pass.value;
                        handleRegister(user, pass);
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

  return (
    <div className="screen" style={{display:'block'}}>
      <h1 className="logo small" style={{borderBottom: '1px solid #f7a85d'}}>
        Lethal Company <span style={{fontSize:14, color:'#666'}}>Speedrun Helper</span>
      </h1>
      <div style={{display:'flex', height:'80vh'}}>
        <div style={{width:200, borderRight:'1px solid #333', padding:10, display:'flex', flexDirection:'column', gap:10}}>
            <div style={{textAlign:'center', color:'#fff', marginBottom:10}}>User: <b>{user}</b></div>
            <button className="btn" onClick={() => navigate("/profile")} style={{marginBottom: '5px'}}>My Profile</button>
            <button className="btn" onClick={handleLogout}>Logout</button>
            <div style={{height:20}}></div>
            <button className="btn" onClick={() => setView("create")}>Create Room</button>
            <button className="btn" onClick={() => setView("join")}>Join Room</button>
            <div style={{height:10}}></div>
            <button className="btn" onClick={() => navigate("/forum")}>Comms (Forum)</button>
        </div>
        <div style={{flex:1, padding:20}}>
            <h2>Updates</h2>
            <p style={{color:'#888'}}>Welcome back, {user}.</p>
        </div>
      </div>
    </div>
  );
}