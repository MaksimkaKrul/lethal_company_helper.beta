import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";

const VERSIONS = ["v40", "v45", "v49", "v50", "v56", "v62", "v64", "v69", "v72", "v73", "v81"];

const CODE_REGEX = /^[A-Z0-9]{1,10}$/;

export default function Home({ user, setUser }) {
  const navigate = useNavigate();
  const [view, setView] = useState("menu");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [createData, setCreateData] = useState({ version: "v50", code: "" });
  const [joinCode, setJoinCode] = useState("");

  const validateCode = (code) => {
    if (!code) return "Room code is mandatory.";
    if (!CODE_REGEX.test(code)) {
        return "Code must be 1-10 characters long and contain only English letters or numbers.";
    }
    return null;
  };

  const handleAction = async (actionFn) => {
    setError(null);
    setIsLoading(true);
    try {
      await actionFn();
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    handleAction(async () => {
      const data = await apiClient.post("/api/users/login/", {
        username: formData.get("user"),
        password: formData.get("pass"),
      });
      setUser(data.username);
      setView("menu");
    });
  };

  const onCreateRoom = () => {
    const validationError = validateCode(createData.code);
    if (validationError) {
        setError(validationError);
        return;
    }

    handleAction(async () => {
      const data = await apiClient.post("/api/rooms/", {
        gameVersion: createData.version,
        code: createData.code,
      });
      navigate(`/room/${data.id}`, { 
        state: { code: data.code, version: data.gameVersion } 
      });
    });
  };

  const onJoinRoom = () => {
    const codeToJoin = joinCode.trim();
    const validationError = validateCode(codeToJoin);
    
    if (validationError) {
        setError(validationError);
        return;
    }

    handleAction(async () => {
      const data = await apiClient.get(`/api/rooms/code/${codeToJoin}/`);
      navigate(`/room/${data.id}`, { 
        state: { code: data.code, version: data.gameVersion } 
      });
    });
  };

  const onLogout = () => {
    handleAction(async () => {
      await apiClient.post("/api/users/logout/");
      setUser(null);
      window.location.reload();
    });
  };

  const ErrorBanner = () => error && (
    <div style={{
        background: "rgba(224, 102, 102, 0.2)",
        border: "1px solid #e06666",
        color: "#e06666",
        padding: "10px",
        marginBottom: "15px",
        fontSize: "12px",
        textAlign: "center",
        lineHeight: "1.4"
    }}>
      {error}
    </div>
  );

  if (!user) {
    return (
      <div className="screen" style={{ display: "block" }}>
        <h1 className="logo">LETHAL COMPANY</h1>
        <div className="menu">
          <h2>{view === "register" ? "Register" : "Login"}</h2>
          <ErrorBanner />
          <form onSubmit={onLogin}>
            <input name="user" className="input" placeholder="Username" required disabled={isLoading} />
            <input name="pass" className="input" placeholder="Password" type="password" required disabled={isLoading} />
            <button className="btn" type="submit" disabled={isLoading}>
                {isLoading ? "Syncing..." : "Enter Terminal"}
            </button>
          </form>
          <button className="btn" onClick={() => { setView(view === "login" ? "register" : "login"); setError(null); }}>
            {view === "login" ? "Create New Record" : "Back to Login"}
          </button>
        </div>
      </div>
    );
  }

  if (view === "create") {
    return (
      <div className="screen" style={{ display: "block" }}>
        <h1 className="logo small">Create Room</h1>
        <div className="menu" style={{ width: 350 }}>
          <ErrorBanner />
          <label>Ship Firmware Version:</label>
          <select 
            className="input" 
            value={createData.version} 
            onChange={(e) => setCreateData({ ...createData, version: e.target.value })}
          >
            {VERSIONS.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <label>Link Code (A-Z, 0-9):</label>
          <input 
            className="input" 
            placeholder="Max 10 characters" 
            value={createData.code} 
            maxLength={10}
            onChange={(e) => setCreateData({ ...createData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })} 
          />
          <button className="btn" onClick={onCreateRoom} disabled={isLoading}>
            {isLoading ? "Initializing..." : "Launch Sync"}
          </button>
          <button className="btn" onClick={() => { setView("menu"); setError(null); }}>Abort</button>
        </div>
      </div>
    );
  }

  if (view === "join") {
    return (
      <div className="screen" style={{ display: "block" }}>
        <h1 className="logo small">Join Room</h1>
        <div className="menu">
          <ErrorBanner />
          <input 
            className="input" 
            placeholder="Enter Frequency Code" 
            value={joinCode} 
            maxLength={10}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} 
          />
          <button className="btn" onClick={onJoinRoom} disabled={isLoading}>
            {isLoading ? "Searching Signal..." : "Establish Link"}
          </button>
          <button className="btn" onClick={() => { setView("menu"); setError(null); }}>Abort</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen" style={{ display: "block" }}>
      <h1 className="logo small" style={{ borderBottom: "1px solid #f7a85d" }}>Lethal Company Helper</h1>
      <div style={{ display: "flex", height: "80vh" }}>
        <div style={{ width: 200, borderRight: "1px solid #333", padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ textAlign: "center", color: "#fff", marginBottom: 10 }}>
            Employee: <b>{user}</b>
          </div>
          <button className="btn" onClick={() => navigate("/profile")}>Record File</button>
          <button className="btn" onClick={onLogout}>Clock Out</button>
          <div style={{ height: 20 }}></div>
          <button className="btn" onClick={() => setView("create")}>Initialize Room</button>
          <button className="btn" onClick={() => setView("join")}>Link to Room</button>
          <button className="btn" onClick={() => navigate("/forum")}>Comms (Forum)</button>
        </div>
        <div style={{ flex: 1, padding: 20 }}>
          <h2>Terminal Active</h2>
          <p style={{ color: "#888" }}>Welcome back, {user}. All systems nominal.</p>
        </div>
      </div>
    </div>
  );
}