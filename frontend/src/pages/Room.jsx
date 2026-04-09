import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import QuotaTable from "../components/QuotaTable";
import Museum from "../components/Museum";
import PlayersList from "../components/PlayersList";

const API_BASE = import.meta.env.VITE_API_URL || "";

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
    const [activeTab, setActiveTab] = useState("Quota");
    const socketRef = useRef(null);
    const fileInputRef = useRef(null);

    const [players, setPlayers] = useState([]);
    const [scale, setScale] = useState(1);
    const [quotas, setQuotas] = useState([{ ...createEmptyQuota(1), quota: 130 }]);
    const [museumItems, setMuseumItems] = useState([]); 

    const roomInfo = location.state || { code: "???", version: "?" };

    useEffect(() => {
        let ws_url;
        if (import.meta.env.VITE_API_URL) {
            // В интернете используем wss:// (безопасный сокет)
            ws_url = import.meta.env.VITE_API_URL.replace(/^http/, 'ws');
        } else {
            ws_url = `ws://${window.location.host}`;
        }

        const socket = new WebSocket(`${ws_url}/ws/rooms/${roomId}/`);
        socketRef.current = socket;

        socket.onopen = () => console.log("Comms established.");
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "UPDATE_QUOTAS") setQuotas(data.content);
            if (data.type === "UPDATE_MUSEUM") setMuseumItems(data.content);
            if (data.type === "UPDATE_PLAYERS") setPlayers(data.players);
        };

        return () => socket.close();
    }, [roomId]);

    const sendQuotasUpdate = (newQuotas) => {
        setQuotas(newQuotas);
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: "UPDATE_QUOTAS", content: newQuotas }));
        }
    };

    const sendMuseumUpdate = (newItems) => {
        setMuseumItems(newItems);
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: "UPDATE_MUSEUM", content: newItems }));
        }
    };

    const sendEmojiUpdate = (newEmoji) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: "SET_EMOJI", emoji: newEmoji }));
        }
    };

    const handleUpdateQuota = (index, updatedQuota) => {
        const newQuotas = [...quotas];
        newQuotas[index] = updatedQuota;
        sendQuotasUpdate(newQuotas);
    };

    const addQuota = () => {
        const nextId = quotas.length + 1;
        const newQuotas = [...quotas, createEmptyQuota(nextId)];
        sendQuotasUpdate(newQuotas);
    };

    const deleteQuota = () => {
        if (quotas.length <= 1) return;
        const newQuotas = quotas.slice(0, -1);
        sendQuotasUpdate(newQuotas);
    };

    const handleExport = () => {
        const dataToSave = { date: new Date().toISOString(), roomCode: roomInfo.code, quotas, museum: museumItems };
        const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `LethalSave_${roomInfo.code}.json`;
        link.click();
    };

    const handleImportClick = () => fileInputRef.current.click();

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.quotas) {
                    sendQuotasUpdate(data.quotas);
                    if (data.museum) sendMuseumUpdate(data.museum);
                }
            } catch (err) { alert("Invalid save file."); }
        };
        reader.readAsText(file);
    };

    return (
        <div className="screen" style={{display:'block'}}>
            <input type="file" ref={fileInputRef} style={{display: 'none'}} accept=".json" onChange={handleFileChange} />
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 10px', background: '#000', borderBottom: '1px solid #333'}}>
                <div style={{display:'flex', alignItems:'center', gap: 15}}>
                    <h1 className="logo small" style={{margin:0, fontSize: '16px'}}>Room {roomInfo.code}</h1>
                    <button className="btn" style={{padding:'4px 8px', fontSize:10, background: '#4b6e32', color:'#fff'}} onClick={handleExport}>SAVE</button>
                    <button className="btn" style={{padding:'4px 8px', fontSize:10, background: '#e69138', color:'#000'}} onClick={handleImportClick}>LOAD</button>
                </div>
                <button className="btn" style={{padding:'2px 8px', fontSize:10}} onClick={() => navigate("/")}>EXIT</button>
            </div>
            <div style={{transform: `scale(${scale})`, transformOrigin: 'top center', transition: 'transform 0.2s'}}>
                <div className="tabs">
                    <button className={`tab ${activeTab === 'Quota' ? 'active' : ''}`} onClick={() => setActiveTab('Quota')}>Quota</button>
                    <button className={`tab ${activeTab === 'Museum' ? 'active' : ''}`} onClick={() => setActiveTab('Museum')}>Museum</button>
                    <button className={`tab ${activeTab === 'Players' ? 'active' : ''}`} onClick={() => setActiveTab('Players')}>Players</button>
                </div>
                <div className="tab-pane active" style={{display: 'block'}}>
                    {activeTab === 'Quota' && <QuotaTable quotas={quotas} onUpdate={handleUpdateQuota} onAdd={addQuota} onDelete={deleteQuota} />}
                    {activeTab === 'Museum' && <Museum collectedItems={museumItems} onUpdate={sendMuseumUpdate} />}
                    {activeTab === 'Players' && <PlayersList players={players} currentUser={user} onSetEmoji={sendEmojiUpdate} />}
                </div>
            </div>
        </div>
    );
}