import React from "react";

const MOONS = ["Experimentation", "Assurance", "Vow", "Offense", "March", "Adamance", "Rend", "Dine", "Titan", "Artifice", "Liquidation", "Embrion"];
const WEATHERS = ["Clear", "Rainy", "Stormy", "Foggy", "Flooded", "Eclipsed"];

export default function QuotaTable({ quotas, onUpdate, onAdd, onDelete }) {
    
    const getBaseIncrease = (quotaIndex) => {
        const timesFulfilled = quotaIndex - 1;
        if (timesFulfilled < 0) return 0;
        return 100 * (1 + Math.pow(timesFulfilled, 2) / 16);
    };

    const calculateRoll = (currentQuota, prevQuota, index) => {
        if (index === 0) return "1.00";
        if (!currentQuota || !prevQuota) return "-";
        
        const actualIncrease = currentQuota - prevQuota;
        const baseIncrease = getBaseIncrease(index);
        
        return (actualIncrease / baseIncrease).toFixed(2);
    };

    const getNextRollPrediction = (index) => {
        const nextIndex = index + 1;
        const base = getBaseIncrease(nextIndex);
        
        const minInc = Math.floor(base * 0.5);
        const avgInc = Math.floor(base * 1.0);
        const maxInc = Math.floor(base * 1.5);
        
        return { min: minInc, avg: avgInc, max: maxInc };
    };


    let runningShipLoot = 0;

    return (
        <div className="quota-container">
            <table className="lc-table">
                <thead>
                    <tr>
                        <th rowSpan="2">#</th>
                        <th rowSpan="2" className="green-header">QUOTA TOTAL</th>
                        <th rowSpan="2">ROLL</th>
                        <th style={{width: 60}}>DAY</th>
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
                        <th style={{fontSize:9}}>1 | 2 | 3</th>
                    </tr>
                </thead>
                <tbody>
                    {quotas.map((data, index) => {
                        const d1 = parseFloat(data.day1?.collected) || 0;
                        const d2 = parseFloat(data.day2?.collected) || 0;
                        const d3 = parseFloat(data.day3?.collected) || 0;
                        const quota = parseFloat(data.quota) || 0;
                        const sold = parseFloat(data.sold) || 0;

                        const collectedTotal = d1 + d2 + d3;
                        const sellToQuota = quota - sold;

                        let overtime = 0;
                        if (sold >= quota) {
                            const profit = sold - quota;
                            const bonus = (profit / 5) - 15;
                            overtime = bonus > 0 ? Math.floor(bonus) : 0;
                        }

                        const lootBeforeSell = runningShipLoot + collectedTotal;
                        const lootAfterSell = lootBeforeSell - sold;
                        runningShipLoot = lootAfterSell;

                        const prevQuota = index > 0 ? parseFloat(quotas[index-1].quota) : 0;
                        const currentRoll = calculateRoll(quota, prevQuota, index);
                        const nextPred = getNextRollPrediction(index);

                        const updateDay = (dayKey, field, value) => {
                            onUpdate(index, { ...data, [dayKey]: { ...data[dayKey], [field]: value } });
                        };
                        const updateField = (field, value) => {
                            onUpdate(index, { ...data, [field]: value });
                        };

                        return (
                            <React.Fragment key={data.id}>
                                <tr style={{borderTop: '2px solid #777'}}>
                                    <td rowSpan="3" style={{fontSize:16, fontWeight:'bold'}}>{data.id}</td>
                                    
                                    <td rowSpan="3">
                                        <input 
                                            className="table-input" 
                                            style={{width: 50, fontWeight:'bold', fontSize:14}}
                                            value={data.quota} 
                                            placeholder="?"
                                            onChange={(e) => updateField('quota', e.target.value)}
                                        />
                                    </td>
                                    
                                    <td rowSpan="3" style={{color: '#aaa', fontStyle:'italic'}}>{currentRoll}</td>
                                    
                                    <td style={{color:'#aaa'}}>Day 1</td>
                                    <td>
                                        <select className="table-select" value={data.day1?.moon} onChange={(e) => updateDay('day1', 'moon', e.target.value)}>
                                            {MOONS.map(m => <option key={m}>{m}</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        <select className="table-select" value={data.day1?.weather} onChange={(e) => updateDay('day1', 'weather', e.target.value)}
                                            style={{color: data.day1?.weather === 'Clear' ? '#fff' : data.day1?.weather === 'Eclipsed' ? '#e06666' : '#f6b26b'}}>
                                            {WEATHERS.map(w => <option key={w}>{w}</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        <input className="table-input" value={data.day1?.collected} onChange={(e) => updateDay('day1', 'collected', e.target.value)} />
                                    </td>

                                    <td rowSpan="3" style={{fontSize: 14, fontWeight:'bold'}}>{collectedTotal}</td>
                                    
                                    <td rowSpan="3">
                                        <input 
                                            className="table-input" 
                                            style={{color: '#6aa84f', fontWeight: 'bold'}}
                                            value={data.sold} 
                                            onChange={(e) => updateField('sold', e.target.value)}
                                        />
                                    </td>

                                    <td rowSpan="3" style={{color: '#f6b26b', fontWeight:'bold'}}>
                                        {lootAfterSell}
                                    </td>

                                    <td rowSpan="3" style={{color: sellToQuota > 0 ? '#e06666' : '#6aa84f'}}>
                                        {sellToQuota}
                                    </td>

                                    <td rowSpan="3" style={{fontWeight:'bold', color: '#f6b26b'}}>
                                        {overtime}
                                    </td>

                                    <td rowSpan="3" style={{fontSize:10, color:'#888'}}>
                                        +Min: {nextPred.min}<br/>
                                        +Avg: {nextPred.avg}<br/>
                                        +Max: {nextPred.max}
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{color:'#aaa'}}>Day 2</td>
                                    <td>
                                        <select className="table-select" value={data.day2?.moon} onChange={(e) => updateDay('day2', 'moon', e.target.value)}>
                                            {MOONS.map(m => <option key={m}>{m}</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        <select className="table-select" value={data.day2?.weather} onChange={(e) => updateDay('day2', 'weather', e.target.value)}
                                            style={{color: data.day2?.weather === 'Clear' ? '#fff' : data.day2?.weather === 'Eclipsed' ? '#e06666' : '#f6b26b'}}>
                                            {WEATHERS.map(w => <option key={w}>{w}</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        <input className="table-input" value={data.day2?.collected} onChange={(e) => updateDay('day2', 'collected', e.target.value)} />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{color:'#aaa'}}>Day 3</td>
                                    <td>
                                        <select className="table-select" value={data.day3?.moon} onChange={(e) => updateDay('day3', 'moon', e.target.value)}>
                                            {MOONS.map(m => <option key={m}>{m}</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        <select className="table-select" value={data.day3?.weather} onChange={(e) => updateDay('day3', 'weather', e.target.value)}
                                            style={{color: data.day3?.weather === 'Clear' ? '#fff' : data.day3?.weather === 'Eclipsed' ? '#e06666' : '#f6b26b'}}>
                                            {WEATHERS.map(w => <option key={w}>{w}</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        <input className="table-input" value={data.day3?.collected} onChange={(e) => updateDay('day3', 'collected', e.target.value)} />
                                    </td>
                                </tr>
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
            
            <div style={{marginTop: 20, display:'flex', gap: 10, justifyContent: 'center'}}>
                <button className="btn" style={{backgroundColor: '#e06666'}} onClick={onDelete}>Delete Quota</button>
                <button className="btn" style={{backgroundColor: '#6aa84f'}} onClick={onAdd}>+ Add Next Quota</button>
            </div>
        </div>
    );
}