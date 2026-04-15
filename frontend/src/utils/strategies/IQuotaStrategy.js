export class IQuotaStrategy {
    getBaseIncrease(index) { throw new Error("Not implemented"); }

    calculateRoll(current, prev, index) { throw new Error("Not implemented"); }

    getNextRollPrediction(index) { throw new Error("Not implemented"); }

    calculateOvertime(sold, quota) { throw new Error("Not implemented"); }

    calculateDayStats(d1, d2, d3) { throw new Error("Not implemented"); }
}