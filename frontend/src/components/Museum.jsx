import React from "react";

const ITEMS = [
    { id: "1", name: "Dust pan" },
    { id: "2", name: "Egg Beater" },
    { id: "3", name: "Steering Wheel" },
    { id: "4", name: "Cookie Mold Pan" },
    { id: "5", name: "Remote" },
    { id: "6", name: "Stop Sign" },
    { id: "7", name: "Yield Sign" },
    { id: "8", name: "Chemical Jug" },
    { id: "9", name: "Bird Egg" },
    { id: "10", name: "Tattered Metal Sheet 2" },
    { id: "11", name: "Tattered Metal Sheet 4" },
    { id: "12", name: "Mug #1" },
    { id: "13", name: "Red Mug" },
    { id: "14", name: "White Blob Mug" },
    { id: "15", name: "Cow Mug" },
    { id: "16", name: "Morning Mug" },
    { id: "17", name: "Tragedy" },
    { id: "18", name: "Comedy" },
    { id: "19", name: "Round Flask" },
    { id: "20", name: "Flat Flask" },
    { id: "21", name: "Blue Egg" },
    { id: "22", name: "Line Egg" },
    { id: "23", name: "Greg" },
    { id: "24", name: "Rreg" },
    { id: "25", name: "Preg" },
    { id: "26", name: "Sky painting" },
    { id: "27", name: "River Painting" },
    { id: "28", name: "Bottles" },
    { id: "29", name: "V-Type Engine" },
    { id: "30", name: "Large Axle" },
    { id: "31", name: "Garbage lid" },
    { id: "32", name: "Control Pad" },
    { id: "33", name: "Soccer ball" },
    { id: "34", name: "Toilet paper" },
    { id: "35", name: "Fancy Lamp" },
    { id: "36", name: "Cash register" },
    { id: "37", name: "Apparatus" },
    { id: "38", name: "Big Bolt" },
    { id: "39", name: "Whoopie cushion" },
    { id: "40", name: "Toy Cube" },
    { id: "41", name: "Airhorn" },
    { id: "42", name: "Gift Box" },
    { id: "43", name: "Clock" },
    { id: "44", name: "Perfume bottle" },
    { id: "45", name: "Pill bottle" },
    { id: "46", name: "Hive" },
    { id: "47", name: "Homemade flashbang" },
    { id: "48", name: "brush" },
    { id: "49", name: "Toy Train" },
    { id: "50", name: "Clown Horn" },
    { id: "51", name: "Toy Robot" },
    { id: "52", name: "Hairdryer" },
    { id: "53", name: "Toothpaste" },
    { id: "54", name: "Candy" },
    { id: "55", name: "Kitchen knife" },
    { id: "56", name: "Plastic Fish" },
    { id: "57", name: "Plastic Cup" },
    { id: "58", name: "Magnifying Glass" },
    { id: "59", name: "Soda Can" },
    { id: "60", name: "Rubber Ducky" },
    { id: "61", name: "Ring" },
    { id: "62", name: "Gold Cup" },
    { id: "63", name: "Gold Bar" },
    { id: "64", name: "Shotgun" },
    { id: "65", name: "Tea kettle" },
    { id: "66", name: "Pickles" },
    { id: "67", name: "Bell" },
    { id: "68", name: "Phone" },
    { id: "69", name: "Laser Pointer" },
    { id: "70", name: "Teeth" },
    { id: "71", name: "magic 7 ball" },
    { id: "72", name: "Zed Dog" }
];

export default function Museum({ collectedItems, onUpdate }) {
    
    const isCollected = (id) => collectedItems.includes(id);

    const toggleItem = (id) => {
        let newItems;
        if (isCollected(id)) {
            newItems = collectedItems.filter(item => item !== id);
        } else {
            newItems = [...collectedItems, id];
        }
        onUpdate(newItems);
    };

    const resetTracker = () => {
        if (confirm("Reset museum tracker for everyone?")) {
            onUpdate([]);
        }
    };

    return (
        <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 15}}>
                <h2 className="tracker-header" style={{margin:0}}>Lethal Company Item Tracker</h2>
                <button className="btn" style={{backgroundColor:'#e06666', padding:'5px 15px'}} onClick={resetTracker}>
                    Reset
                </button>
            </div>
            
            <div className="museum-grid">
                {ITEMS.map((item) => (
                    <div 
                        key={item.id}
                        className={`museum-item ${isCollected(item.id) ? 'collected' : ''}`}
                        onClick={() => toggleItem(item.id)}
                        title={item.name}
                    >
                        <img 
                            src={`/items/${item.id}.png`} 
                            alt={item.name} 
                            onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src="https://placehold.co/64x64/333/fff?text=?";
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}