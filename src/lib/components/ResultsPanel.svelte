<script lang="ts">
  import type {
    EligibilityResponse,
    RateCalculationResponse,
  } from "#lib/types";
  import { formatCurrency, formatPercent } from "#lib/utils/format";

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
          <p class="mt-0.5 max-w-sm text-sm text-white/80">
            {eligibilityResult.decisionReason}
          </p>
        </div>
      </div>

      {#if eligibilityResult.isEligible}
        <div class="shrink-0 text-right">
          <p class="text-xs text-white/70">Approval Likelihood</p>
          <p class="text-4xl font-black">
            {eligibilityResult.approvalLikelihood}%
          </p>
        </div>
      {/if}
    </div>

    {#if eligibilityResult.isEligible}
      <div class="mt-5">
        <div class="h-2 w-full overflow-hidden rounded-full bg-white/25">
          <div
            class="h-2 rounded-full bg-white transition-all duration-1000"
            style="width: {eligibilityResult.approvalLikelihood}%"
            role="progressbar"
            aria-valuenow={eligibilityResult.approvalLikelihood}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Approval likelihood"
          ></div>
        </div>
        <div class="mt-3 flex items-center justify-end">
          <span
            class="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm"
          >
            <span class="h-2 w-2 rounded-full {risk.dotColor}"></span>
            {risk.label}
          </span>
        </div>
      </div>
    {/if}
  </div>

  <!-- ── Result cards ──────────────────────────────────────────────────────── -->
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    <!-- Recommended Loan -->
    {#if eligibilityResult.isEligible}
      <div class="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-center gap-2">
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100"
          >
            <svg
              class="h-4 w-4 text-brand-700"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
              />
            </svg>
          </div>
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
              <dd class="text-base font-bold text-brand-700">
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
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100"
        >
          <svg
            class="h-4 w-4 text-slate-600"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
            />
          </svg>
        </div>
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

    <div
      class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm
				{eligibilityResult.isEligible
        ? 'sm:col-span-2 xl:col-span-1'
        : 'sm:col-span-2 xl:col-span-1'}"
    >
      <div class="mb-4 flex items-center gap-2">
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
					{eligibilityResult.isEligible ? 'bg-success-100' : 'bg-danger-100'}"
        >
          <svg
            class="h-4 w-4 {eligibilityResult.isEligible
              ? 'text-success-600'
              : 'text-danger-600'}"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
        </div>
        <h3 class="font-semibold text-slate-800">Risk Profile</h3>
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-500">Risk Category</span>
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold
							{risk.bgColor} {risk.textColor}"
          >
            <span class="h-1.5 w-1.5 rounded-full {risk.dotColor}"></span>
            {risk.label}
          </span>
        </div>

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
					focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-700"
      >
        <div class="flex items-center gap-2">
          <svg
            class="h-5 w-5 text-brand-700"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m5.25 0h-5.25"
            />
          </svg>
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
                class="text-sm font-medium text-brand-700 hover:underline focus:outline-none"
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
    <button
      onclick={onRecalculate}
      class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-600
				hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] transition-all duration-150
				focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
    >
      <svg
        class="h-4 w-4"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
        />
      </svg>
      Recalculate
    </button>

    {#if eligibilityResult.isEligible}
      <button
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-8 py-3 text-sm font-semibold text-white shadow-sm
					hover:bg-brand-800 active:scale-[0.98] transition-all duration-150
					focus:outline-none focus:ring-2 focus:ring-brand-700 focus:ring-offset-2"
        aria-label="Proceed to loan application (demo only)"
      >
        Apply Now
        <svg
          class="h-4 w-4"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
          />
        </svg>
      </button>
    {/if}
  </div>
</div>
