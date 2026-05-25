import React from "react";

const MOONS = ["Experimentation", "Assurance", "Vow", "Offense", "March", "Adamance", "Rend", "Dine", "Titan", "Artifice", "Liquidation", "Embrion"];
const WEATHERS = ["Clear", "Rainy", "Stormy", "Foggy", "Flooded", "Eclipsed"];

export default function QuotaTable({ 
    quotas, 
    onUpdate, 
    onAdd, 
    onDelete, 
    strategy 
}) {
    let runningShipLoot = 0;

    const handleCellChange = (index, newData) => {
        const updatedQuotas = [...quotas];
        updatedQuotas[index] = { ...updatedQuotas[index], ...newData };
        onUpdate(updatedQuotas);
    };

    return (
        <div className="quota-container">
            <table className="lc-table">
                <thead>
                    <tr>
                        <th rowSpan="2">#</th>
                        <th rowSpan="2" className="green-header">QUOTA TOTAL</th>
                        <th rowSpan="2">ROLL</th>
                        <th style={{ width: 60 }}>DAY</th>
                        <th rowSpan="2" className="green-header">MOON</th>
                        <th rowSpan="2" className="green-header">CONDITION</th>
                        <th rowSpan="2" className="green-header">COLLECTED</th>
                        <th rowSpan="2">COLLECTED TOTAL</th>
                        <th rowSpan="2" className="green-header">SOLD</th>
                        <th rowSpan="2">SHIP LOOT</th>
                        <th rowSpan="2">SELL TO QUOTA</th>
                        <th rowSpan="2">OVERTIME</th>
                        <th rowSpan="2">NEXT ROLL ESTIMATE</th>
                    </tr>
                    <tr>
                        <th style={{ fontSize: 9 }}>1 | 2 | 3</th>
                    </tr>
                </thead>
                <tbody>
                    {quotas.map((data, index) => {
                        const dayStats = strategy.calculateDayStats(
                            data.day1?.collected, 
                            data.day2?.collected, 
                            data.day3?.collected
                        );
                        
                        const quotaValue = parseFloat(data.quota) || 0;
                        const soldValue = parseFloat(data.sold) || 0;
                        const overtime = strategy.calculateOvertime(soldValue, quotaValue);
                        const sellToQuota = quotaValue - soldValue;
                        const currentLoot = Math.max(0, runningShipLoot + dayStats.total - soldValue);
                        runningShipLoot = currentLoot;

                        const prevQuota = index > 0 ? parseFloat(quotas[index - 1].quota) : 0;
                        const roll = strategy.calculateRoll(data.quota, prevQuota, index);
                        const prediction = strategy.getNextRollPrediction(index);

                        return (
                            <React.Fragment key={data.id ?? index}>
                                <tr style={{ borderTop: '2px solid #555' }}>
                                    <td rowSpan="3" style={{ fontSize: 16, fontWeight: 'bold' }}>{data.id}</td>
                                    <td rowSpan="3">
                                        <input className="table-input" value={data.quota} 
                                            onChange={(e) => handleCellChange(index, { quota: e.target.value })} />
                                    </td>
                                    <td rowSpan="3" style={{ fontStyle: 'italic', color: '#888' }}>{roll}</td>
                                    <td>D1</td>
                                    <td>
                                        <select className="table-select" value={data.day1?.moon} 
                                            onChange={(e) => handleCellChange(index, { day1: { ...data.day1, moon: e.target.value } })}>
                                            {MOONS.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        <select className="table-select" value={data.day1?.weather}
                                            onChange={(e) => handleCellChange(index, { day1: { ...data.day1, weather: e.target.value } })}>
                                            {WEATHERS.map(w => <option key={w} value={w}>{w}</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        <input className="table-input" value={data.day1?.collected}
                                            onChange={(e) => handleCellChange(index, { day1: { ...data.day1, collected: e.target.value } })} />
                                    </td>
                                    <td rowSpan="3" style={{ fontSize: 14, fontWeight: 'bold' }}>{dayStats.total}</td>
                                    <td rowSpan="3">
                                        <input className="table-input" style={{ color: '#6aa84f' }} value={data.sold}
                                            onChange={(e) => handleCellChange(index, { sold: e.target.value })} />
                                    </td>
                                    <td rowSpan="3" style={{ color: '#f6b26b', fontWeight: 'bold' }}>{currentLoot}</td>
                                    <td rowSpan="3" style={{ color: sellToQuota > 0 ? '#e06666' : '#6aa84f' }}>{sellToQuota}</td>
                                    <td rowSpan="3" style={{ fontWeight: 'bold' }}>{overtime}</td>
                                    <td rowSpan="3" style={{ fontSize: 10, color: '#888' }}>
                                        MIN: +{prediction.min}<br/>AVG: +{prediction.avg}<br/>MAX: +{prediction.max}
                                    </td>
                                </tr>
                                <tr>
                                    <td>D2</td>
                                    <td>
                                        <select className="table-select" value={data.day2?.moon} 
                                            onChange={(e) => handleCellChange(index, { day2: { ...data.day2, moon: e.target.value } })}>
                                            {MOONS.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        <select className="table-select" value={data.day2?.weather}
                                            onChange={(e) => handleCellChange(index, { day2: { ...data.day2, weather: e.target.value } })}>
                                            {WEATHERS.map(w => <option key={w} value={w}>{w}</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        <input className="table-input" value={data.day2?.collected}
                                            onChange={(e) => handleCellChange(index, { day2: { ...data.day2, collected: e.target.value } })} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>D3</td>
                                    <td>
                                        <select className="table-select" value={data.day3?.moon} 
                                            onChange={(e) => handleCellChange(index, { day3: { ...data.day3, moon: e.target.value } })}>
                                            {MOONS.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        <select className="table-select" value={data.day3?.weather}
                                            onChange={(e) => handleCellChange(index, { day3: { ...data.day3, weather: e.target.value } })}>
                                            {WEATHERS.map(w => <option key={w} value={w}>{w}</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        <input className="table-input" value={data.day3?.collected}
                                            onChange={(e) => handleCellChange(index, { day3: { ...data.day3, collected: e.target.value } })} />
                                    </td>
                                </tr>
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
            
            <div style={{ marginTop: 15, display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="btn" style={{ backgroundColor: '#e06666' }} onClick={onDelete}>Delete Quota</button>
                <button className="btn" style={{ backgroundColor: '#6aa84f' }} onClick={onAdd}>+ Add Quota</button>
            </div>
        </div>
    );
}