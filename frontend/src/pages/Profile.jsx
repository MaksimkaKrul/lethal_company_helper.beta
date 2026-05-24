import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { apiClient } from "../api/client";

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
            const data = await apiClient.get("/api/users/me/");

            setUsername(data.username);
            setEmoji(data.emoji || "🧑‍🚀");
            setDescription(data.description || "");
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await apiClient.patch("/api/users/me/", {
                emoji,
                description
            });

            alert("Profile updated!");
        } catch (e) {
            console.error(e);
            alert("Error updating profile. Access denied.");
        }
    };

    if (loading) {
        return (
            <div style={{padding:20, color:'#f7a85d'}}>
                Accessing employee record...
            </div>
        );
    }

    return (
        <div
            className="screen"
            style={{
                display:'block',
                maxWidth: '600px',
                margin: '0 auto',
                padding: '20px'
            }}
        >
            <div
                style={{
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'space-between',
                    borderBottom:'1px solid #f7a85d',
                    paddingBottom:10,
                    marginBottom:20
                }}
            >
                <h1 className="logo small" style={{margin:0}}>
                    Employee Profile
                </h1>

                <button className="btn" onClick={() => navigate("/")}>
                    Back
                </button>
            </div>

            <div
                style={{
                    background: '#111',
                    padding: '20px',
                    border: '1px solid #333'
                }}
            >
                <div
                    style={{
                        textAlign: 'center',
                        marginBottom: '20px'
                    }}
                >
                    <div
                        style={{
                            fontSize: '64px',
                            cursor: 'pointer',
                            border:'1px dashed #444',
                            borderRadius:'50%',
                            width:'100px',
                            height:'100px',
                            margin:'0 auto',
                            display:'flex',
                            alignItems:'center',
                            justifyContent:'center'
                        }}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                        {emoji}
                    </div>

                    {showEmojiPicker && (
                        <div
                            style={{
                                display:'grid',
                                gridTemplateColumns:'repeat(4, 1fr)',
                                gap:5,
                                background:'#000',
                                padding:10,
                                border:'1px solid #f7a85d',
                                marginTop:10
                            }}
                        >
                            {EMOJI_OPTIONS.map(e => (
                                <span
                                    key={e}
                                    style={{
                                        fontSize:24,
                                        cursor:'pointer'
                                    }}
                                    onClick={() => {
                                        setEmoji(e);
                                        setShowEmojiPicker(false);
                                    }}
                                >
                                    {e}
                                </span>
                            ))}
                        </div>
                    )}

                    <h2 style={{color: '#fff'}}>
                        {username}
                    </h2>
                </div>

                <div style={{marginBottom: '20px'}}>
                    <label
                        style={{
                            display: 'block',
                            color: '#f7a85d',
                            marginBottom:5
                        }}
                    >
                        Employee Bio:
                    </label>

                    <textarea
                        className="input"
                        style={{
                            width: '100%',
                            height: '100px',
                            boxSizing:'border-box'
                        }}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <button className="btn" onClick={handleSave}>
                    Save Changes
                </button>
            </div>
        </div>
    );
}