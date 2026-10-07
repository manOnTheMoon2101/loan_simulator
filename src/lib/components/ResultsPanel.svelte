<script lang="ts">
  import type {
    EligibilityResponse,
    RateCalculationResponse,
  } from "#lib/types";
  import { formatCurrency, formatPercent } from "#lib/utils/format";
  import Button from "./ui/button/button.svelte";

  interface Props {
    eligibility: EligibilityResponse;
    rateData: RateCalculationResponse;
    onRecalculate: () => void;
  }

  let { eligibility, rateData, onRecalculate }: Props = $props();

  let showSchedule = $state<boolean>(false);
  let scheduleRows = $state<number>(6);

  const eligibilityResult = $derived(eligibility.eligibilityResult);
  const recommendedLoan = $derived(eligibility.recommendedLoan);
  const affordabilityAnalysis = $derived(eligibility.affordabilityAnalysis);

  type RiskKey = "low" | "medium" | "high";
  type AffordabilityKey = "excellent" | "good" | "fair" | "poor";

  const riskConfig: Record<
    RiskKey,
    { label: string; textColor: string; bgColor: string; dotColor: string }
  > = {
    low: {
      label: "Low Risk",
      textColor: "text-success-700",
      bgColor: "bg-success-100",
      dotColor: "bg-success-500",
    },
    medium: {
      label: "Medium Risk",
      textColor: "text-warning-700",
      bgColor: "bg-warning-100",
      dotColor: "bg-warning-500",
    },
    high: {
      label: "High Risk",
      textColor: "text-danger-700",
      bgColor: "bg-danger-100",
      dotColor: "bg-danger-500",
    },
  };

  const affordabilityConfig: Record<
    AffordabilityKey,
    { label: string; color: string }
  > = {
    excellent: { label: "Excellent", color: "text-success-600" },
    good: { label: "Good", color: "text-success-500" },
    fair: { label: "Fair", color: "text-warning-600" },
    poor: { label: "Poor", color: "text-danger-600" },
  };

  const risk = $derived(riskConfig[eligibilityResult.riskCategory]);
  const affordability = $derived(
    affordabilityConfig[affordabilityAnalysis.affordabilityScore],
  );

  const visibleSchedule = $derived(
    rateData.paymentSchedule.slice(0, scheduleRows),
  );
  const hasMore = $derived(scheduleRows < rateData.paymentSchedule.length);

  const dtiColor = $derived(
    affordabilityAnalysis.debtToIncomeRatio < 30
      ? "bg-success-500"
      : affordabilityAnalysis.debtToIncomeRatio < 50
        ? "bg-warning-500"
        : "bg-danger-500",
  );

  const likelihoodColor = $derived(
    eligibilityResult.approvalLikelihood >= 70
      ? "bg-success-500"
      : eligibilityResult.approvalLikelihood >= 45
        ? "bg-warning-500"
        : "bg-danger-500",
  );
</script>

<div class="space-y-6">
  <div
    class="rounded-2xl p-6 text-white {eligibilityResult.isEligible
      ? 'bg-linear-to-br from-success-500 to-success-700'
      : 'bg-linear-to-br from-danger-500 to-danger-700'}"
  >
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div class="flex items-center gap-4">
        <div
          class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
          aria-hidden="true"
        >
          {#if eligibilityResult.isEligible}
            <svg
              class="h-8 w-8"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          {:else}
            <svg
              class="h-8 w-8"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          {/if}
        </div>
        <div>
          <h2 class="text-2xl font-extrabold">
            {eligibilityResult.isEligible ? "You're Eligible!" : "Not Eligible"}
          </h2>
        </div>
      </div>
    </div>
  </div>

  <div
    class="grid gap-4 {eligibilityResult.isEligible
      ? 'sm:grid-cols-2 xl:grid-cols-3'
      : 'grid-cols-1'}"
  >
    {#if eligibilityResult.isEligible}
      <div class="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-center gap-2">
          <h3 class="font-semibold text-slate-800">Recommended Loan</h3>
        </div>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between">
            <dt class="text-slate-500">Loan Amount</dt>
            <dd class="font-semibold text-slate-800">
              {formatCurrency(recommendedLoan.recommendedAmount)}
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-slate-500">Max You Qualify For</dt>
            <dd class="font-semibold text-success-600">
              {formatCurrency(recommendedLoan.maxAmount)}
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-slate-500">Interest Rate</dt>
            <dd class="font-semibold text-slate-800">
              {formatPercent(recommendedLoan.interestRate)} p.a.
            </dd>
          </div>
          <div class="border-t border-slate-100 pt-3">
            <div class="flex justify-between">
              <dt class="text-slate-500">Monthly Payment</dt>
              <dd class="text-base font-bold text-primary">
                {formatCurrency(recommendedLoan.monthlyPayment)}
              </dd>
            </div>
          </div>
          <div class="flex justify-between">
            <dt class="text-slate-500">Total Repayment</dt>
            <dd class="font-semibold text-slate-700">
              {formatCurrency(recommendedLoan.totalRepayment)}
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-slate-500">Total Interest</dt>
            <dd class="font-semibold text-slate-600">
              {formatCurrency(rateData.totalInterest)}
            </dd>
          </div>
        </dl>
      </div>
    {/if}

    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="mb-4 flex items-center gap-2">
        <h3 class="font-semibold text-slate-800">Affordability</h3>
      </div>
      <dl class="space-y-3 text-sm">
        <div class="flex justify-between">
          <dt class="text-slate-500">Disposable Income</dt>
          <dd
            class="font-semibold {affordabilityAnalysis.disposableIncome > 0
              ? 'text-success-600'
              : 'text-danger-600'}"
          >
            {formatCurrency(affordabilityAnalysis.disposableIncome)}
          </dd>
        </div>
        <div>
          <div class="mb-1.5 flex justify-between">
            <dt class="text-slate-500">Debt-to-Income</dt>
            <dd class="font-semibold text-slate-800">
              {formatPercent(affordabilityAnalysis.debtToIncomeRatio)}
            </dd>
          </div>
          <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-1.5 rounded-full transition-all duration-700 {dtiColor}"
              style="width: {Math.min(
                100,
                affordabilityAnalysis.debtToIncomeRatio,
              )}%"
            ></div>
          </div>
        </div>
        <div class="flex justify-between">
          <dt class="text-slate-500">Loan-to-Income</dt>
          <dd class="font-semibold text-slate-800">
            {formatPercent(affordabilityAnalysis.loanToIncomeRatio)}
          </dd>
        </div>
        <div
          class="border-t border-slate-100 pt-3 flex justify-between items-center"
        >
          <dt class="text-slate-500">Affordability Score</dt>
          <dd class="font-bold {affordability.color}">{affordability.label}</dd>
        </div>
      </dl>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="mb-4 flex items-center gap-2">
        <h3 class="font-semibold text-slate-800">Risk Profile</h3>
        <span
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold
							{risk.bgColor} {risk.textColor}"
        >
          <span class="h-1.5 w-1.5 rounded-full {risk.dotColor}"></span>
          {risk.label}
        </span>
      </div>

      <div class="space-y-4">
        {#if eligibilityResult.isEligible}
          <div>
            <div class="mb-1.5 flex justify-between text-xs text-slate-500">
              <span>Approval Score</span>
              <span class="font-semibold text-slate-700"
                >{eligibilityResult.approvalLikelihood}/100</span
              >
            </div>
            <div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-2.5 rounded-full transition-all duration-700 {likelihoodColor}"
                style="width: {eligibilityResult.approvalLikelihood}%"
              ></div>
            </div>
          </div>
        {/if}

        <div class="rounded-xl bg-slate-50 p-3">
          <p class="text-xs leading-relaxed text-slate-600">
            {eligibilityResult.decisionReason}
          </p>
        </div>
      </div>
    </div>
  </div>

  {#if eligibilityResult.isEligible}
    <div
      class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <button
        onclick={() => {
          showSchedule = !showSchedule;
          scheduleRows = 6;
        }}
        aria-expanded={showSchedule}
        class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50
					focus:outline-none focus:ring-2 focus:ring-inset focus:primary"
      >
        <div class="flex items-center gap-2">
          <span class="font-semibold text-slate-800">Payment Schedule</span>
          <span class="text-sm text-slate-400"
            >({rateData.paymentSchedule.length} months)</span
          >
        </div>
        <svg
          class="h-5 w-5 text-slate-400 transition-transform duration-200 {showSchedule
            ? 'rotate-180'
            : ''}"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {#if showSchedule}
        <div class="border-t border-slate-100">
          <div class="grid grid-cols-2 gap-4 bg-slate-50 px-5 py-3 text-sm">
            <div>
              <span class="text-slate-500">Total Interest: </span>
              <span class="font-semibold text-danger-600"
                >{formatCurrency(rateData.totalInterest)}</span
              >
            </div>
            <div>
              <span class="text-slate-500">Total Repayment: </span>
              <span class="font-semibold text-slate-700"
                >{formatCurrency(rateData.totalRepayment)}</span
              >
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 bg-slate-50">
                  <th
                    scope="col"
                    class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >Month</th
                  >
                  <th
                    scope="col"
                    class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >Payment</th
                  >
                  <th
                    scope="col"
                    class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >Principal</th
                  >
                  <th
                    scope="col"
                    class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >Interest</th
                  >
                  <th
                    scope="col"
                    class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >Balance</th
                  >
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                {#each visibleSchedule as row}
                  <tr class="transition-colors hover:bg-slate-50">
                    <td class="px-4 py-3 font-medium text-slate-700"
                      >{row.month}</td
                    >
                    <td class="px-4 py-3 text-right text-slate-700"
                      >{formatCurrency(row.payment, true)}</td
                    >
                    <td
                      class="px-4 py-3 text-right font-medium text-success-600"
                      >{formatCurrency(row.principal, true)}</td
                    >
                    <td class="px-4 py-3 text-right text-danger-500"
                      >{formatCurrency(row.interest, true)}</td
                    >
                    <td class="px-4 py-3 text-right font-medium text-slate-700"
                      >{formatCurrency(row.balance)}</td
                    >
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          <div
            class="flex justify-center gap-4 border-t border-slate-100 px-4 py-3"
          >
            {#if hasMore}
              <button
                onclick={() =>
                  (scheduleRows = Math.min(
                    scheduleRows + 12,
                    rateData.paymentSchedule.length,
                  ))}
                class="text-sm font-medium text-secondary hover:underline focus:outline-none"
              >
                Show more
              </button>
            {/if}
            {#if scheduleRows > 6}
              <button
                onclick={() => (scheduleRows = 6)}
                class="text-sm font-medium text-slate-500 hover:underline focus:outline-none"
              >
                Collapse
              </button>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <div
    class="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between"
  >
    <Button
      onclick={onRecalculate}
      
    >
    
      Recalculate
    </Button>
  </div>
</div>
