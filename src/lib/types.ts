// ─── Form State Types ──────────────────────────────────────────────────────────

export interface PersonalInfo {
	age: number | null;
	employmentStatus: string;
	employmentDuration: number | null;
}

export interface FinancialInfo {
	monthlyIncome: number | null;
	monthlyExpenses: number | null;
	existingDebt: number | null;
	creditScore: number | null;
}

export interface LoanDetails {
	requestedAmount: number | null;
	loanTerm: number;
	loanPurpose: string;
	loanType: string;
}

export interface FormErrors {
	[key: string]: string;
}

// ─── API Request Types ─────────────────────────────────────────────────────────

export interface EligibilityRequest {
	personalInfo: {
		age: number;
		employmentStatus: string;
		employmentDuration: number;
	};
	financialInfo: {
		monthlyIncome: number;
		monthlyExpenses: number;
		existingDebt: number;
		creditScore?: number;
	};
	loanDetails: {
		requestedAmount: number;
		loanTerm: number;
		loanPurpose: string;
	};
}

export interface RateCalculationRequest {
	loanAmount: number;
	loanTerm: number;
	creditScore?: number;
	loanType: string;
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface EligibilityResult {
	isEligible: boolean;
	approvalLikelihood: number;
	riskCategory: 'low' | 'medium' | 'high';
	decisionReason: string;
}

export interface RecommendedLoan {
	maxAmount: number;
	recommendedAmount: number;
	interestRate: number;
	monthlyPayment: number;
	totalRepayment: number;
}

export interface AffordabilityAnalysis {
	disposableIncome: number;
	debtToIncomeRatio: number;
	loanToIncomeRatio: number;
	affordabilityScore: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface EligibilityResponse {
	eligibilityResult: EligibilityResult;
	recommendedLoan: RecommendedLoan;
	affordabilityAnalysis: AffordabilityAnalysis;
}

export interface LoanProduct {
	id: string;
	name: string;
	description: string;
	minAmount: number;
	maxAmount: number;
	minTerm: number;
	maxTerm: number;
	interestRateRange: {
		min: number;
		max: number;
	};
	purposes: string[];
}

export interface ProductsResponse {
	products: LoanProduct[];
}

export interface PaymentScheduleItem {
	month: number;
	payment: number;
	principal: number;
	interest: number;
	balance: number;
}

export interface RateCalculationResponse {
	interestRate: number;
	monthlyPayment: number;
	totalInterest: number;
	totalRepayment: number;
	paymentSchedule: PaymentScheduleItem[];
}

export interface ValidationRuleField {
	min?: number;
	max?: number;
	required: boolean;
	options?: string[];
	errorMessage: string;
}

export interface ValidationRulesResponse {
	personalInfo: {
		age: ValidationRuleField;
		employmentStatus: ValidationRuleField;
		employmentDuration: ValidationRuleField;
	};
	financialInfo: {
		monthlyIncome: ValidationRuleField;
		monthlyExpenses: ValidationRuleField;
		creditScore: ValidationRuleField;
	};
	loanDetails: {
		requestedAmount: ValidationRuleField;
		loanTerm: ValidationRuleField;
	};
}
