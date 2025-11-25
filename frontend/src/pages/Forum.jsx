import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Forum({ user, onBack }) {
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
            const res = await fetch("/api/forum/");
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
            const res = await fetch(`/api/forum/${id}/`);
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
            const res = await fetch("/api/forum/", {
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
            const res = await fetch(`/api/forum/${currentThread.id}/messages/`, {
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

            {loading && <div style={{color:'#888'}}>Transmitting data...</div>}

            {view === "LIST" && !loading && (
                <div>
                    <div style={{background:'#111', padding:15, border:'1px solid #333', marginBottom:20}}>
                        <h3 style={{marginTop:0}}>New Frequency</h3>
                        <div style={{display:'flex', gap:10}}>
                            <input 
                                className="input" 
                                style={{flex:1}} 
                                placeholder="Thread Title..." 
                                value={newThreadTitle}
                                onChange={e => setNewThreadTitle(e.target.value)}
                            />
                            <button className="btn" onClick={createThread}>Broadcast</button>
                        </div>
                    </div>

                    <div style={{display:'flex', flexDirection:'column', gap: 10}}>
                        {threads.map(t => (
                            <div 
                                key={t.id} 
                                onClick={() => fetchThreadDetails(t.id)}
                                style={{
                                    border: '1px solid #444', padding: '15px', cursor: 'pointer',
                                    background: '#000', transition: '0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#f7a85d'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#444'}
                            >
                                <div style={{fontSize:18, fontWeight:'bold', color:'#f7a85d'}}>{t.title}</div>
                                <div style={{fontSize:12, color:'#666'}}>
                                    Signal by: {t.author_name} | {new Date(t.created_at).toLocaleString()} | {t.messages.length} msgs
                                </div>
                            </div>
                        ))}
                        {threads.length === 0 && <div style={{color:'#666', fontStyle:'italic'}}>No signals detected.</div>}
                    </div>
                </div>
            )}

            {view === "THREAD" && currentThread && (
                <div>
                    <h2 style={{color:'#fff', borderBottom:'1px solid #333', paddingBottom:10}}>
                        {currentThread.title} 
                        <span style={{fontSize:12, color:'#666', marginLeft:10}}>by {currentThread.author_name}</span>
                    </h2>

                    <div style={{
                        maxHeight: '60vh', overflowY: 'auto', display:'flex', flexDirection:'column', gap: 10,
                        padding: 10, background:'#111', border:'1px solid #333', marginBottom: 20
                    }}>
                        {currentThread.messages.map(msg => (
                            <div key={msg.id} style={{
                                padding: '10px', background: '#000', borderLeft: '3px solid #f7a85d'
                            }}>
                                <div style={{display:'flex', justifyContent:'space-between', marginBottom: 5}}>
                                    <span style={{fontWeight:'bold', color:'#f7a85d'}}>
                                        {msg.author_emoji} {msg.author_name}
                                    </span>
                                    <span style={{fontSize:10, color:'#666'}}>
                                        {new Date(msg.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <div style={{whiteSpace: 'pre-wrap', color:'#ccc'}}>{msg.content}</div>
                            </div>
                        ))}
                        {currentThread.messages.length === 0 && <div>No messages yet.</div>}
                    </div>

                    <div style={{display:'flex', gap:10}}>
                        <textarea 
                            className="input" 
                            style={{flex:1, height: 50, resize: 'none'}} 
                            placeholder="Type transmission..." 
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
                        />
                        <button className="btn" style={{height: 'auto'}} onClick={sendMessage}>SEND</button>
                    </div>
                </div>
            )}
        </div>
    );
}