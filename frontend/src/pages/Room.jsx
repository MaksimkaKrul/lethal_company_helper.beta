import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import QuotaTable from "../components/QuotaTable";
import Museum from "../components/Museum";
import PlayersList from "../components/PlayersList";
import { WebSocketService } from "../websocket/ws";
import { RoomCommands } from "../websocket/commands";

const createEmptyQuota = (id) => ({
    id: id, 
    quota: "", 
    sold: 0,
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
    const [players, setPlayers] = useState([]);
    const [scale, setScale] = useState(1.0);
    const [quotas, setQuotas] = useState([{ ...createEmptyQuota(1), quota: 130 }]);
    const [museumItems, setMuseumItems] = useState([]); 

    const roomInfo = location.state || { code: "???", version: "?" };

    useEffect(() => {
        WebSocketService.connect(roomId);
        
        const unsubscribe = WebSocketService.subscribe((data) => {
            if (data.type === "UPDATE_QUOTAS") setQuotas(data.content);
            if (data.type === "UPDATE_MUSEUM") setMuseumItems(data.content);
            if (data.type === "UPDATE_PLAYERS") setPlayers(data.players);
        });

        return () => unsubscribe();
    }, [roomId]);

    const broadcastQuotas = (newQuotas) => {
        setQuotas(newQuotas);
        WebSocketService.send(RoomCommands.updateQuotas(newQuotas));
    };

    const broadcastMuseum = (newItems) => {
        setMuseumItems(newItems);
        WebSocketService.send(RoomCommands.updateMuseum(newItems));
    };

    const handleUpdateQuota = (index, updatedQuota) => {
        const newQuotas = [...quotas];
        newQuotas[index] = updatedQuota;
        broadcastQuotas(newQuotas);
    };

    const addQuota = () => {
        const nextId = quotas.length + 1;
        broadcastQuotas([...quotas, createEmptyQuota(nextId)]);
    };

    const deleteQuota = () => {
        if (quotas.length > 1) broadcastQuotas(quotas.slice(0, -1));
    };

    const handleExport = () => {
        const dataToSave = { 
            date: new Date().toISOString(), 
            roomCode: roomInfo.code, 
            quotas, 
            museum: museumItems 
        };
        const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `LethalSave_${roomInfo.code}.json`;
        link.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.quotas) {
                    broadcastQuotas(data.quotas);
                    if (data.museum) broadcastMuseum(data.museum);
                }
            } catch (err) { alert("ERROR: Save file corrupted."); }
        };
        reader.readAsText(file);
    };

    return (
        <div className="screen" style={{display:'block'}}>
            <input type="file" ref={fileInputRef} style={{display: 'none'}} accept=".json" onChange={handleFileChange} />
            
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 15px', background: '#000', borderBottom: '1px solid #333'}}>
                <div style={{display:'flex', alignItems:'center', gap: 15}}>
                    <h1 className="logo small" style={{margin:0, fontSize: '18px'}}>Room {roomInfo.code}</h1>
                    <button className="btn" style={{background: '#4b6e32', color: '#fff'}} onClick={handleExport}>SAVE</button>
                    <button className="btn" style={{background: '#e69138'}} onClick={() => fileInputRef.current.click()}>LOAD</button>
                </div>
                
                <div style={{display:'flex', gap: 15, alignItems:'center'}}>
                    <div style={{display:'flex', alignItems:'center', gap: 5}}>
                        <span style={{fontSize: 9, color: '#666'}}>UI SCALE: {scale}</span>
                        <input type="range" min="0.6" max="1.4" step="0.1" value={scale} onChange={(e) => setScale(Number(e.target.value))} />
                    </div>
                    <button className="btn" onClick={() => { WebSocketService.disconnect(); navigate("/"); }}>EXIT</button>
                </div>
            </div>

            <div style={{
                transform: `scale(${scale})`, 
                transformOrigin: 'top center', 
                transition: 'transform 0.1s ease-out',
                padding: '10px'
            }}>
                <div className="tabs">
                    {['Quota', 'Museum', 'Players'].map(t => (
                        <button 
                            key={t} 
                            className={`tab ${activeTab === t ? 'active' : ''}`} 
                            onClick={() => setActiveTab(t)}
                        >
                            {t} Table
                        </button>
                    ))}
                </div>

                <div className="tab-pane active" style={{display: 'block', background: '#111', border: '1px solid #333', borderTop: 'none'}}>
                    {activeTab === 'Quota' && (
                        <QuotaTable quotas={quotas} onUpdate={handleUpdateQuota} onAdd={addQuota} onDelete={deleteQuota} />
                    )}
                    
                    {activeTab === 'Museum' && (
                        <Museum collectedItems={museumItems} onUpdate={broadcastMuseum} />
                    )}
                    
                    {activeTab === 'Players' && (
                        <PlayersList 
                            players={players} 
                            currentUser={user} 
                            onSetEmoji={(emo) => WebSocketService.send(RoomCommands.setEmoji(emo))} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
}