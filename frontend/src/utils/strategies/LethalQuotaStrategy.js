import { IQuotaStrategy } from "./IQuotaStrategy";

export class LethalQuotaStrategy extends IQuotaStrategy {
    getBaseIncrease(index) {
        const timesFulfilled = index - 1;
        if (timesFulfilled < 0) return 0;
        return 100 * (1 + Math.pow(timesFulfilled, 2) / 16);
    }

    calculateRoll(currentQuota, prevQuota, index) {
        if (index === 0) return "1.00";
        
        const current = parseFloat(currentQuota);
        const prev = parseFloat(prevQuota);

        if (isNaN(current) || isNaN(prev)) return "-";

        const actual = current - prev;
        const base = this.getBaseIncrease(index);

        return (actual / base).toFixed(2);
    }

    getNextRollPrediction(index) {
        const base = this.getBaseIncrease(index + 1);

        return {
            min: Math.floor(base * 0.5),
            avg: Math.floor(base * 1.0),
            max: Math.floor(base * 1.5)
        };
    }

    calculateOvertime(sold, quota) {
        const s = parseFloat(sold) || 0;
        const q = parseFloat(quota) || 0;
        
        if (s <= q) return 0;

        const bonus = (s - q) / 5 - 15;
        return bonus > 0 ? Math.floor(bonus) : 0;
    }

    calculateDayStats(d1, d2, d3) {
        const a = parseFloat(d1) || 0;
        const b = parseFloat(d2) || 0;
        const c = parseFloat(d3) || 0;
        const total = a + b + c;

        return {
            total,
            average: Number((total / 3).toFixed(1))
        };
    }
}