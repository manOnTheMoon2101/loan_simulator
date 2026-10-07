import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getInterestRate,
	calculateMonthlyPayment,
	generatePaymentSchedule
} from '#lib/utils/calculations';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { loanAmount, loanTerm, creditScore, loanType } = body;

	const interestRate = getInterestRate(creditScore, loanType);
	const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTerm);
	const totalRepayment = parseFloat((monthlyPayment * loanTerm).toFixed(2));
	const totalInterest = parseFloat((totalRepayment - loanAmount).toFixed(2));
	const paymentSchedule = generatePaymentSchedule(loanAmount, interestRate, loanTerm);

	return json({
		interestRate,
		monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
		totalInterest,
		totalRepayment,
		paymentSchedule
	});
};
