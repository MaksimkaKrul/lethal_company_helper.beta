import { useState } from "react";

const EMOJI_OPTIONS = ["🧑‍🚀", "👹", "🤡", "🤖", "👽", "💩", "👻", "💀", "🐞", "🐛", "🐝", "🦖"];

export default function PlayersList({ players, currentUser, onSetEmoji }) {
    const [editingEmoji, setEditingEmoji] = useState(false);

    return (
        <div style={{padding: 20}}>
            <h3>Current Squad ({players.length})</h3>
            <ul style={{listStyle: 'none', padding: 0}}>
                {players.map((p, index) => {
                    const isMe = p.username === currentUser;

                    return (
                        <li key={index} style={{
                            padding: '10px', 
                            borderBottom: '1px solid #333',
                            color: isMe ? '#fff' : '#f7a85d',
                            fontSize: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <div style={{position: 'relative'}}>
                                <span 
                                    style={{cursor: isMe ? 'pointer' : 'default', fontSize: '24px'}}
                                    onClick={() => isMe && setEditingEmoji(!editingEmoji)}
                                    title={isMe ? "Click to change emoji" : ""}
                                >
                                    {p.emoji || "🧑‍🚀"}
                                </span>

                                {isMe && editingEmoji && (
                                    <div style={{
                                        position: 'absolute', top: '110%', left: '-10px', marginTop: '5px', width: '180px',   
                                        background: '#111', border: '1px solid #f7a85d', boxShadow: '0 5px 15px rgba(0,0,0,0.8)',
                                        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px', 
                                        padding: 5, zIndex: 100, borderRadius: '8px', zIndex: 999
                                    }}>
                                        {EMOJI_OPTIONS.map(emo => (
                                            <div 
                                                key={emo} 
                                                style={{    cursor: 'pointer', 
                                                            padding: '6px', 
                                                            textAlign: 'center',
                                                            borderRadius: '4px',
                                                            fontSize: '20px'}}
                                                onMouseEnter={(e) => e.target.style.background = '#333'}
                                                onMouseLeave={(e) => e.target.style.background = 'transparent'}           
                                                onClick={() => {
                                                    onSetEmoji(emo);
                                                    setEditingEmoji(false);
                                                }}
                                            >
                                                {emo}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <span>
                                {p.username} {isMe && <span style={{fontSize:10, color:'#666'}}>(you)</span>}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}