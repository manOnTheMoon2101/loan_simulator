/**
 * Format a number as South African Rand (ZAR)
 */
export function formatCurrency(amount: number, showDecimals = false): string {
	return new Intl.NumberFormat('en-ZA', {
		style: 'currency',
		currency: 'ZAR',
		minimumFractionDigits: showDecimals ? 2 : 0,
		maximumFractionDigits: showDecimals ? 2 : 0
	}).format(amount);
}

/**
 * Format a number with thousands separator
 */
export function formatNumber(value: number): string {
	return new Intl.NumberFormat('en-ZA').format(value);
}

/**
 * Format a percentage value
 */
export function formatPercent(value: number, decimals = 1): string {
	return `${value.toFixed(decimals)}%`;
}

/**
 * Format employment status enum value to a human-readable label
 */
export function formatEmploymentStatus(status: string): string {
	const map: Record<string, string> = {
		employed: 'Employed',
		self_employed: 'Self-Employed',
		unemployed: 'Unemployed',
		retired: 'Retired'
	};
	return map[status] ?? status.replace(/_/g, ' ');
}

/**
 * Format loan purpose enum value to a human-readable label
 */
export function formatLoanPurpose(purpose: string): string {
	const map: Record<string, string> = {
		debt_consolidation: 'Debt Consolidation',
		home_improvement: 'Home Improvement',
		education: 'Education',
		medical: 'Medical',
		other: 'Other',
		new_vehicle: 'New Vehicle',
		used_vehicle: 'Used Vehicle'
	};
	return map[purpose] ?? purpose.replace(/_/g, ' ');
}

/**
 * Capitalise the first letter of each word
 */
export function titleCase(str: string): string {
	return str.replace(/\b\w/g, (c) => c.toUpperCase());
}
