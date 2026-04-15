import { useState, useRef, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import QuotaTable from "../components/QuotaTable";
import Museum from "../components/Museum";
import PlayersList from "../components/PlayersList";
import { useRoomSocket } from "../hooks/useRoomSocket";
import { WebSocketStatus } from "../websocket/ws";
import { RoomCommands } from "../websocket/commands";
import { apiClient } from "../api/client";
import { QUOTA_STRATEGIES, DEFAULT_STRATEGY } from "../utils/quotaStrategies";

const createEmptyQuota = (id) => ({
    id: id, 
    quota: "", sold: 0,
    day1: { moon: 'Experimentation', weather: 'Clear', collected: 0 },
    day2: { moon: 'Experimentation', weather: 'Clear', collected: 0 },
    day3: { moon: 'Experimentation', weather: 'Clear', collected: 0 },
});

export default function Room({ user }) {
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const [activeTab, setActiveTab] = useState("Quota");
    const [scale, setScale] = useState(1.0);

    const [roomInfo, setRoomInfo] = useState(location.state || null);
    
    const [strategyName, setStrategyName] = useState(DEFAULT_STRATEGY);
    const currentStrategy = QUOTA_STRATEGIES[strategyName];

    const { status, players, quotas, museum, send } = useRoomSocket(roomId);

    useEffect(() => {
        if (!roomInfo) {
            apiClient.get(`/api/rooms/${roomId}/`)
                .then(data => {
                    setRoomInfo(data);
                })
                .catch(err => {
                    console.error("Critical error: Room record unreachable", err);
                });
        }
    }, [roomId, roomInfo, navigate]);

    const handleExport = () => {
        if (!roomInfo) return;
        const dataToSave = { date: new Date().toISOString(), roomCode: roomInfo.code, quotas, museum };
        const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `LethalSave_${roomInfo.code}.json`;
        link.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (imported.quotas) send(RoomCommands.updateQuotas(imported.quotas));
                if (imported.museum) send(RoomCommands.updateMuseum(imported.museum));
            } catch (err) { alert("ERROR: Save file corrupted."); }
        };
        reader.readAsText(file);
    };

    if (!roomInfo) {
        return (
            <div className="screen" style={{display:'block', padding: '20px', color: '#f7a85d'}}>
                <h1 className="logo small">Connecting to Ship Terminal...</h1>
            </div>
        );
    }

    return (
        <div className="screen" style={{display:'block'}}>
            <input type="file" ref={fileInputRef} style={{display: 'none'}} accept=".json" onChange={handleFileChange} />
            
            {status !== WebSocketStatus.OPEN && (
                <div style={{
                    background: status === WebSocketStatus.FAILED ? '#741b47' : (status === WebSocketStatus.CONNECTING ? '#f6b26b' : '#e06666'),
                    color: '#fff', padding: '5px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold'
                }}>
                    {status === WebSocketStatus.FAILED ? 'CRITICAL: TERMINAL OFFLINE. REFRESH REQUIRED.' : 'RE-ESTABLISHING LINK...'}
                </div>
            )}

            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 15px', background: '#000', borderBottom: '1px solid #333'}}>
                <div style={{display:'flex', alignItems:'center', gap: 15}}>
                    <h1 className="logo small" style={{margin:0, fontSize: '18px'}}>
                        Room {roomInfo.code} <span style={{fontSize: 10, color: '#666'}}>v{roomInfo.gameVersion}</span>
                    </h1>
                    <button className="btn" style={{background: '#4b6e32', color: '#fff'}} onClick={handleExport}>SAVE</button>
                    <button className="btn" style={{background: '#e69138'}} onClick={() => fileInputRef.current.click()}>LOAD</button>
                </div>
                <div style={{display:'flex', gap: 15, alignItems:'center'}}>
                    <input type="range" min="0.6" max="1.4" step="0.1" value={scale} onChange={(e) => setScale(Number(e.target.value))} title="Scale UI" />
                    <button className="btn" onClick={() => navigate("/")}>EXIT</button>
                </div>
            </div>

            <div style={{
                transform: `scale(${scale})`, transformOrigin: 'top center', padding: '10px',
                opacity: status === WebSocketStatus.OPEN ? 1 : 0.6,
                pointerEvents: status === WebSocketStatus.OPEN ? 'auto' : 'none',
                filter: status === WebSocketStatus.OPEN ? 'none' : 'grayscale(50%)'
            }}>
                <div className="tabs">
                    {['Quota', 'Museum', 'Players'].map(t => (
                        <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t} Table</button>
                    ))}
                </div>
                <div className="tab-pane active" style={{background: '#111', border: '1px solid #333', borderTop: 'none'}}>
                    {activeTab === 'Quota' && (
                        <QuotaTable 
                            quotas={quotas.length ? quotas : [{...createEmptyQuota(1), quota: 130}]} 
                            strategy={currentStrategy}
                            onUpdate={(idx, val) => {
                                const next = [...quotas]; 
                                next[idx] = val; 
                                send(RoomCommands.updateQuotas(next));
                            }} 
                            onAdd={() => send(RoomCommands.updateQuotas([...quotas, createEmptyQuota(quotas.length+1)]))} 
                            onDelete={() => send(RoomCommands.updateQuotas(quotas.slice(0, -1)))} 
                        />
                    )}
                    {activeTab === 'Museum' && <Museum collectedItems={museum} onUpdate={(items) => send(RoomCommands.updateMuseum(items))} />}
                    {activeTab === 'Players' && <PlayersList players={players} currentUser={user} onSetEmoji={(emo) => send(RoomCommands.setEmoji(emo))} />}
                </div>
            </div>
        </div>
    );
}