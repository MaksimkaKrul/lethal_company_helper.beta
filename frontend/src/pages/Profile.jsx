import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "";
const EMOJI_OPTIONS = ["🧑‍🚀", "👹", "🤡", "🤖", "👽", "💩", "👻", "💀", "🐞", "🐛", "🐝", "🦖"];

export default function Profile({ user }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [emoji, setEmoji] = useState("🧑‍🚀");
    const [description, setDescription] = useState("");
    const [username, setUsername] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/users/me/`);
            if (res.ok) {
                const data = await res.json();
                setUsername(data.username);
                setEmoji(data.emoji || "🧑‍🚀");
                setDescription(data.description || "");
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSave = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/users/me/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emoji, description })
            });
            if (res.ok) alert("Profile updated!");
            else alert("Error updating profile");
        } catch (e) { console.error(e); }
    };

    // UI...
    return (
        <div className="screen" style={{display:'block', maxWidth: '600px', margin: '0 auto', padding: '20px'}}>
             <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #f7a85d', paddingBottom:10, marginBottom:20}}>
                <h1 className="logo small" style={{margin:0}}>Employee Profile</h1>
                <button className="btn" onClick={() => navigate("/")}>Back</button>
            </div>
            <div style={{background: '#111', padding: '20px', border: '1px solid #333'}}>
                <div style={{textAlign: 'center', marginBottom: '20px'}}>
                    <div style={{fontSize: '64px', cursor: 'pointer'}} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>{emoji}</div>
                    <h2 style={{color: '#fff'}}>{username}</h2>
                </div>
                <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', color: '#f7a85d'}}>Bio:</label>
                    <textarea className="input" style={{width: '100%', height: '100px'}} value={description} onChange={(e) => setDescription(e.target.value)}/>
                </div>
                <button className="btn" onClick={handleSave}>Save Changes</button>
            </div>
        </div>
    );
}