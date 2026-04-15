import { LethalQuotaStrategy } from "./strategies/LethalQuotaStrategy";

export const QUOTA_STRATEGIES = {
    vanilla: new LethalQuotaStrategy(),
};

export const DEFAULT_STRATEGY = "vanilla";