import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function Forum({ user }) {
    const navigate = useNavigate();
    const [view, setView] = useState("LIST");
    const [threads, setThreads] = useState([]);
    const [currentThread, setCurrentThread] = useState(null);
    const [loading, setLoading] = useState(false);
    const [newThreadTitle, setNewThreadTitle] = useState("");
    const [newMessage, setNewMessage] = useState("");

    const fetchThreads = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/forum/`);
            if (res.ok) {
                const data = await res.json();
                setThreads(data);
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const fetchThreadDetails = async (id) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/forum/${id}/`);
            if (res.ok) {
                const data = await res.json();
                setCurrentThread(data);
                setView("THREAD");
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => {
        fetchThreads();
    }, []);

    const createThread = async () => {
        if (!newThreadTitle.trim()) return;
        try {
            const res = await fetch(`${API_BASE}/api/forum/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newThreadTitle })
            });
            if (res.ok) {
                setNewThreadTitle("");
                fetchThreads();
            }
        } catch (e) { console.error(e); }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !currentThread) return;
        try {
            const res = await fetch(`${API_BASE}/api/forum/${currentThread.id}/messages/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newMessage })
            });
            if (res.ok) {
                setNewMessage("");
                fetchThreadDetails(currentThread.id); 
            }
        } catch (e) { console.error(e); }
    };

    // UI остается твоим...
    return (
        <div className="screen" style={{display:'block', padding: '20px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #f7a85d', paddingBottom:10, marginBottom:20}}>
                <h1 className="logo small" style={{margin:0}}>Comms Terminal (Forum)</h1>
                <button className="btn" onClick={() => {
                    if (view === "THREAD") {
                        setView("LIST");
                        fetchThreads();
                    } else {
                        navigate("/");
                    }
                }}>
                    {view === "THREAD" ? "Back to List" : "Exit Terminal"}
                </button>
            </div>
            {/* ... Весь остальной UI ... */}
            {view === "LIST" && (
                <div>
                   <div style={{background:'#111', padding:15, border:'1px solid #333', marginBottom:20}}>
                        <h3 style={{marginTop:0}}>New Frequency</h3>
                        <div style={{display:'flex', gap:10}}>
                            <input className="input" style={{flex:1}} placeholder="Thread Title..." value={newThreadTitle} onChange={e => setNewThreadTitle(e.target.value)}/>
                            <button className="btn" onClick={createThread}>Broadcast</button>
                        </div>
                    </div>
                    <div style={{display:'flex', flexDirection:'column', gap: 10}}>
                        {threads.map(t => (
                            <div key={t.id} onClick={() => fetchThreadDetails(t.id)} style={{border: '1px solid #444', padding: '15px', cursor: 'pointer', background: '#000'}}>
                                <div style={{fontSize:18, fontWeight:'bold', color:'#f7a85d'}}>{t.title}</div>
                                <div style={{fontSize:12, color:'#666'}}>
                                    Signal by: {t.author_name} | {new Date(t.created_at).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {view === "THREAD" && currentThread && (
                 <div>
                    <h2 style={{color:'#fff', borderBottom:'1px solid #333', paddingBottom:10}}>{currentThread.title}</h2>
                    <div style={{maxHeight: '60vh', overflowY: 'auto', display:'flex', flexDirection:'column', gap: 10, padding: 10, background:'#111', marginBottom: 20}}>
                        {currentThread.messages.map(msg => (
                            <div key={msg.id} style={{padding: '10px', background: '#000', borderLeft: '3px solid #f7a85d'}}>
                                <div style={{fontWeight:'bold', color:'#f7a85d'}}>{msg.author_emoji} {msg.author_name}</div>
                                <div style={{color:'#ccc'}}>{msg.content}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{display:'flex', gap:10}}>
                        <textarea className="input" style={{flex:1, height: 50}} placeholder="Type transmission..." value={newMessage} onChange={e => setNewMessage(e.target.value)}/>
                        <button className="btn" onClick={sendMessage}>SEND</button>
                    </div>
                </div>
            )}
        </div>
    );
}