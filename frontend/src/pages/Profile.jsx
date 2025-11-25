import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
            const res = await fetch("/api/users/me/");
            if (res.ok) {
                const data = await res.json();
                setUsername(data.username);
                setEmoji(data.emoji);
                setDescription(data.description);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const res = await fetch("/api/users/me/", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    emoji: emoji, 
                    description: description 
                })
            });
            if (res.ok) {
                alert("Profile updated successfully!");
            } else {
                alert("Error updating profile");
            }
        } catch (e) {
            console.error(e);
            alert("Network error");
        }
    };

    if (loading) return <div style={{padding:20, color:'#f7a85d'}}>Loading profile...</div>;

    return (
        <div className="screen" style={{display:'block', maxWidth: '600px', margin: '0 auto', padding: '20px'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #f7a85d', paddingBottom:10, marginBottom:20}}>
                <h1 className="logo small" style={{margin:0}}>Employee Profile</h1>
                <button className="btn" onClick={() => navigate("/")}>Back to Menu</button>
            </div>

            <div style={{background: '#111', padding: '20px', border: '1px solid #333', borderRadius: '8px'}}>
                
                <div style={{textAlign: 'center', marginBottom: '20px'}}>
                    <div style={{position: 'relative', display: 'inline-block'}}>
                        <div 
                            style={{
                                fontSize: '64px', cursor: 'pointer', 
                                border: '2px dashed #444', borderRadius: '50%',
                                width: '100px', height: '100px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto'
                            }}
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            title="Click to change avatar"
                        >
                            {emoji}
                        </div>

                        {showEmojiPicker && (
                            <div style={{
                                position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)',
                                background: '#000', border: '1px solid #f7a85d', zIndex: 10,
                                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px', padding: '10px',
                                width: '200px', boxShadow: '0 5px 15px rgba(0,0,0,0.8)'
                            }}>
                                {EMOJI_OPTIONS.map(emo => (
                                    <div 
                                        key={emo}
                                        style={{fontSize: '24px', cursor: 'pointer', textAlign: 'center', padding: '5px', borderRadius: '4px', background: emoji === emo ? '#333' : 'transparent'}}
                                        onClick={() => {
                                            setEmoji(emo);
                                            setShowEmojiPicker(false);
                                        }}
                                    >
                                        {emo}
                                    </div>
                                ))}
                            </div>
                        )}
                        <p style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>Click icon to change</p>
                    </div>
                    
                    <h2 style={{color: '#fff', marginTop: '10px'}}>{username}</h2>
                </div>

                <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', color: '#f7a85d', marginBottom: '5px'}}>Description / Bio:</label>
                    <textarea 
                        className="input"
                        style={{width: '100%', height: '100px', resize: 'vertical', boxSizing: 'border-box'}}
                        placeholder="Write something about yourself..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div style={{textAlign: 'right'}}>
                    <button className="btn" style={{padding: '10px 20px', fontSize: '14px'}} onClick={handleSave}>
                        Save Changes
                    </button>
                </div>

            </div>
        </div>
    );
}