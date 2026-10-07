<script lang="ts">
  import { untrack } from "svelte";
  import type { FinancialInfo, FormErrors } from "#lib/types";
  import { Input } from "#lib/components/ui/input/index.js";
  import { Button } from "#lib/components/ui/button/index.js";

  interface Props {
    initialData: FinancialInfo;
    onNext: (data: FinancialInfo) => void;
    onBack: () => void;
  }

  let { initialData, onNext, onBack }: Props = $props();

  let monthlyIncome = $state<number | null>(
    untrack(() => initialData.monthlyIncome),
  );
  let monthlyExpenses = $state<number | null>(
    untrack(() => initialData.monthlyExpenses),
  );
  let existingDebt = $state<number | null>(
    untrack(() => initialData.existingDebt),
  );
  let creditScore = $state<number | null>(
    untrack(() => initialData.creditScore),
  );
  let errors = $state<FormErrors>({});

  const disposableIncome = $derived(
    monthlyIncome !== null && monthlyExpenses !== null
      ? Number(monthlyIncome) - Number(monthlyExpenses)
      : null,
  );

  function validate(): boolean {
    const e: FormErrors = {};

    const inc = Number(monthlyIncome);
    if (monthlyIncome === null || isNaN(inc) || inc < 5000) {
      e.monthlyIncome = "Minimum monthly income of R5,000 required";
    }

    const exp = Number(monthlyExpenses);
    if (monthlyExpenses === null || isNaN(exp) || exp < 0) {
      e.monthlyExpenses =
        "Please enter your monthly expenses (enter 0 if none)";
    }

    const debt = Number(existingDebt);
    if (existingDebt !== null && !isNaN(debt) && debt < 0) {
      e.existingDebt = "Existing debt cannot be a negative value";
    }

    if (creditScore !== null) {
      const cs = Number(creditScore);
      if (isNaN(cs) || cs < 300 || cs > 850) {
        e.creditScore = "Credit score must be between 300 and 850";
      }
    }

    errors = e;
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) {
      onNext({
        monthlyIncome,
        monthlyExpenses,
        existingDebt: existingDebt ?? 0,
        creditScore,
      });
    }
  }
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-2xl font-bold text-slate-800">Financial Information</h2>
  </div>

  <div class="grid gap-5 sm:grid-cols-2">
    <div class="space-y-1.5">
      <label
        for="monthly-income"
        class="block text-sm font-medium text-slate-700"
      >
        Gross Monthly Income <span class="text-danger-500" aria-hidden="true"
          >*</span
        >
      </label>
      <div class="relative">
        <span
          class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500"
          aria-hidden="true">R</span
        >
        <Input
          id="monthly-income"
          type="number"
          min="0"
          step="500"
          bind:value={monthlyIncome}
          placeholder="25 000"
          aria-required="true"
          class="block w-full rounded-xl border py-3 pl-8 pr-4 text-slate-800 placeholder-slate-400 transition-shadow
						focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent
						{errors.monthlyIncome
            ? 'border-danger-400 bg-danger-50'
            : 'border-slate-200 bg-white hover:border-slate-300'}"
        />
      </div>
      {#if errors.monthlyIncome}
        <p
          role="alert"
          class="flex items-center gap-1.5 text-sm text-danger-600"
        >
          <svg
            class="h-4 w-4 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clip-rule="evenodd"
            />
          </svg>
          {errors.monthlyIncome}
        </p>
      {/if}
    </div>

    <div class="space-y-1.5">
      <label
        for="monthly-expenses"
        class="block text-sm font-medium text-slate-700"
      >
        Monthly Living Expenses <span class="text-danger-500" aria-hidden="true"
          >*</span
        >
      </label>
      <div class="relative">
        <span
          class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500"
          aria-hidden="true">R</span
        >
        <Input
          id="monthly-expenses"
          type="number"
          min="0"
          step="500"
          bind:value={monthlyExpenses}
          placeholder="15 000"
          aria-required="true"
          class="block w-full rounded-xl border py-3 pl-8 pr-4 text-slate-800 placeholder-slate-400 transition-shadow
						focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent
						{errors.monthlyExpenses
            ? 'border-danger-400 bg-danger-50'
            : 'border-slate-200 bg-white hover:border-slate-300'}"
        />
      </div>
      {#if errors.monthlyExpenses}
        <p
          role="alert"
          class="flex items-center gap-1.5 text-sm text-danger-600"
        >
          <svg
            class="h-4 w-4 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clip-rule="evenodd"
            />
          </svg>
          {errors.monthlyExpenses}
        </p>
      {/if}
    </div>

    <div class="space-y-1.5">
      <label
        for="existing-debt"
        class="block text-sm font-medium text-slate-700"
      >
        Existing Monthly Debt
        <span class="text-xs font-normal text-slate-400">(Optional)</span>
      </label>
      <div class="relative">
        <span
          class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500"
          aria-hidden="true">R</span
        >
        <Input
          id="existing-debt"
          type="number"
          min="0"
          step="100"
          bind:value={existingDebt}
          placeholder="5 000"
          class="block w-full rounded-xl border py-3 pl-8 pr-4 text-slate-800 placeholder-slate-400 transition-shadow
						focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent
						{errors.existingDebt
            ? 'border-danger-400 bg-danger-50'
            : 'border-slate-200 bg-white hover:border-slate-300'}"
        />
      </div>

      {#if errors.existingDebt}
        <p
          role="alert"
          class="flex items-center gap-1.5 text-sm text-danger-600"
        >
          <svg
            class="h-4 w-4 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clip-rule="evenodd"
            />
          </svg>
          {errors.existingDebt}
        </p>
      {/if}
    </div>

    <div class="space-y-1.5">
      <label
        for="credit-score"
        class="block text-sm font-medium text-slate-700"
      >
        Credit Score
        <span class="text-xs font-normal text-slate-400">(Optional)</span>
      </label>
      <Input
        id="credit-score"
        type="number"
        min="300"
        max="850"
        bind:value={creditScore}
        placeholder="e.g. 650"
        aria-describedby="credit-score-hint"
        class="block w-full rounded-xl border px-4 py-3 text-slate-800 placeholder-slate-400 transition-shadow
					focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent
					{errors.creditScore
          ? 'border-danger-400 bg-danger-50'
          : 'border-slate-200 bg-white hover:border-slate-300'}"
      />

      {#if errors.creditScore}
        <p
          role="alert"
          class="flex items-center gap-1.5 text-sm text-danger-600"
        >
          <svg
            class="h-4 w-4 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clip-rule="evenodd"
            />
          </svg>
          {errors.creditScore}
        </p>
      {/if}
    </div>
  </div>

  <div class="flex items-center justify-between border-t border-slate-100 pt-6">
    <Button
      onclick={onBack}
      class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-600
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
          d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
        />
      </svg>
      Back
    </Button>
    <Button onclick={handleNext} size='lg'>Continue</Button>
  </div>
</div>
