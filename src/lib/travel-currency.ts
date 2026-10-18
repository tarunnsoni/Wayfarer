export const DEFAULT_TRIP_BUDGET = "15000";
export const TRAVEL_CURRENCY_INSTRUCTION =
  "Show all monetary amounts in Indian rupees (INR) using the ₹ symbol and Indian number grouping. Never use USD or $ for estimates. Foreign destination prices must be estimated in INR; clarify that exchange rates and prices are approximate, not live quotes.";

export function formatTripBudget(budget: string) {
  return `INR ₹${budget.replace(/^(?:INR\s*|₹\s*)+/i, "").trim()}`;
}
