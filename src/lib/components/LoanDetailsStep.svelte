<script lang="ts">
  import { untrack } from "svelte";
  import type { LoanDetails, LoanProduct, FormErrors } from "#lib/types";
  import { formatCurrency, formatLoanPurpose } from "#lib/utils/format";
  import { calculateMonthlyPayment } from "#lib/utils/calculations";
  import { Slider } from "#lib/components/ui/slider/index.js";
  import * as Select from "#lib/components/ui/select/index.js";

  interface Props {
    initialData: LoanDetails;
    products: LoanProduct[];
    onNext: (data: LoanDetails) => void;
    onBack: () => void;
  }

  let { initialData, products, onNext, onBack }: Props = $props();

  let loanType = $state(untrack(() => initialData.loanType || "personal_loan"));
  let loanTerm = $state(untrack(() => initialData.loanTerm || 24));
  let loanPurpose = $state(untrack(() => initialData.loanPurpose || ""));
  let errors = $state<FormErrors>({});

  const selectedProduct = $derived(
    products.find((p) => p.id === loanType) ?? products[0],
  );

  let requestedAmount = $state<number>(
    untrack(
      () =>
        initialData.requestedAmount ??
        Math.round(
          ((products.find(
            (p) => p.id === (initialData.loanType || "personal_loan"),
          )?.maxAmount ?? 300000) *
            0.15) /
            1000,
        ) * 1000,
    ),
  );

  $effect(() => {
    const product = selectedProduct;
    if (!product) return;

    if (requestedAmount < product.minAmount)
      requestedAmount = product.minAmount;
    if (requestedAmount > product.maxAmount)
      requestedAmount = product.maxAmount;

    if (loanTerm < product.minTerm) loanTerm = product.minTerm;
    if (loanTerm > product.maxTerm) loanTerm = product.maxTerm;

    if (loanPurpose && !product.purposes.includes(loanPurpose)) {
      loanPurpose = "";
    }
  });

  const estimatedPayment = $derived(
    (() => {
      if (!requestedAmount || !selectedProduct) return null;
      const midRate =
        (selectedProduct.interestRateRange.min +
          selectedProduct.interestRateRange.max) /
        2;
      return calculateMonthlyPayment(requestedAmount, midRate, loanTerm);
    })(),
  );

  const estimatedTotal = $derived(
    estimatedPayment ? estimatedPayment * loanTerm : null,
  );

  const amountStep = $derived(
    selectedProduct?.maxAmount > 200000 ? 5000 : 1000,
  );

  function validate(): boolean {
    const e: FormErrors = {};

    if (!selectedProduct) {
      e.loanType = "Please select a loan type";
    } else {
      if (!requestedAmount || requestedAmount < selectedProduct.minAmount) {
        e.requestedAmount = `Minimum loan amount is ${formatCurrency(selectedProduct.minAmount)}`;
      } else if (requestedAmount > selectedProduct.maxAmount) {
        e.requestedAmount = `Maximum loan amount is ${formatCurrency(selectedProduct.maxAmount)}`;
      }

      if (
        loanTerm < selectedProduct.minTerm ||
        loanTerm > selectedProduct.maxTerm
      ) {
        e.loanTerm = `Term must be between ${selectedProduct.minTerm} and ${selectedProduct.maxTerm} months`;
      }
    }

    if (!loanPurpose) {
      e.loanPurpose = "Please select the purpose of your loan";
    }

    errors = e;
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) {
      onNext({ requestedAmount, loanTerm, loanPurpose, loanType });
    }
  }
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-2xl font-bold text-slate-800">Loan Details</h2>
  </div>

  <fieldset class="space-y-2">
    <legend class="text-sm font-medium text-slate-700">
      Loan Type <span class="text-danger-500" aria-hidden="true">*</span>
    </legend>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {#each products as product}
        <label
          class="relative flex cursor-pointer rounded-xl border-2 p-4 transition-all duration-150
						{loanType === product.id
            ? 'border-primary bg-primary/50'
            : 'border-slate-200 hover:border-slate-300 bg-white'}"
        >
          <input
            type="radio"
            name="loanType"
            value={product.id}
            bind:group={loanType}
            class="sr-only"
          />
          <div class="flex-1 min-w-0">
            <p
              class="font-semibold {loanType === product.id
                ? 'text-accent'
                : 'text-slate-800'}"
            >
              {product.name}
            </p>
            <p class="mt-0.5 text-xs text-slate-500 truncate">
              {product.description}
            </p>
            <p
              class="mt-1.5 text-xs font-medium {loanType === product.id
                ? 'text-accent'
                : 'text-slate-400'}"
            >
              {product.interestRateRange.min}% – {product.interestRateRange
                .max}% p.a.
            </p>
          </div>
          {#if loanType === product.id}
            <div
              class="absolute right-3 top-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary"
            >
              <svg
                class="h-3 w-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          {/if}
        </label>
      {/each}
    </div>
  </fieldset>

  {#if selectedProduct}
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label
          for="loan-amount-slider"
          class="text-sm font-medium text-slate-700"
        >
          Loan Amount <span class="text-danger-500" aria-hidden="true">*</span>
        </label>
        <span class="text-sm font-bold text-primary">
          {requestedAmount ? formatCurrency(requestedAmount) : "—"}
        </span>
      </div>
      <Slider
        id="loan-amount-slider"
        min={selectedProduct.minAmount}
        max={selectedProduct.maxAmount}
        step={amountStep}
        value={[requestedAmount ?? selectedProduct.minAmount]}
        onValueChange={(vals : any) => (requestedAmount = vals[0])}
        aria-label="Loan amount slider"
        class="w-full"
      />
      <div class="flex justify-between text-xs text-slate-400">
        <span>{formatCurrency(selectedProduct.minAmount)}</span>
        <span>{formatCurrency(selectedProduct.maxAmount)}</span>
      </div>

      {#if errors.requestedAmount}
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
          {errors.requestedAmount}
        </p>
      {/if}
    </div>

    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label
          for="loan-term-slider"
          class="text-sm font-medium text-slate-700"
        >
          Repayment Period <span class="text-danger-500" aria-hidden="true"
            >*</span
          >
        </label>
        <span class="text-sm font-bold text-primary">{loanTerm} months</span>
      </div>
      <Slider
        id="loan-term-slider"
        min={selectedProduct.minTerm}
        max={selectedProduct.maxTerm}
        step={6}
        value={[loanTerm]}
        onValueChange={(vals : any) => (loanTerm = vals[0])}
        aria-label="Loan term slider"
        class="w-full"
      />
      <div class="flex justify-between text-xs text-slate-400">
        <span>{selectedProduct.minTerm} months</span>
        <span>{selectedProduct.maxTerm} months</span>
      </div>
      {#if errors.loanTerm}
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
          {errors.loanTerm}
        </p>
      {/if}
    </div>

    <div class="space-y-1.5">
      <label
        for="loan-purpose"
        class="block text-sm font-medium text-slate-700"
      >
        Loan Purpose <span class="text-danger-500" aria-hidden="true">*</span>
      </label>
      <Select.Root
        type="single"
        value={loanPurpose}
        onValueChange={(v : any) => (loanPurpose = v ?? '')}
      >
        <Select.Trigger
          id="loan-purpose"
          class="w-full"
          aria-invalid={!!errors.loanPurpose}
          aria-describedby={errors.loanPurpose ? "loan-purpose-error" : undefined}
        >
          <Select.Value placeholder="Select a purpose" />
        </Select.Trigger>
        <Select.Content>
          {#each selectedProduct.purposes as purpose}
            <Select.Item value={purpose} label={formatLoanPurpose(purpose)} />
          {/each}
        </Select.Content>
      </Select.Root>
      {#if errors.loanPurpose}
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
          {errors.loanPurpose}
        </p>
      {/if}
    </div>

    {#if estimatedPayment && requestedAmount}
      <div
        class="rounded-xl p-5"
        aria-live="polite"
        aria-label="Estimated repayment preview"
      >
        <p
          class="mb-4 text-xs font-semibold flex flex-row justify-center tracking-widest text-accent"
        >
          Estimated Repayment Preview
        </p>
        <div class="grid grid-cols-3 gap-3 text-center">
          <div>
            <p class="text-xs text-slate-500">Monthly</p>
            <p class="mt-1 text-xl font-bold text-secondary">
              {formatCurrency(estimatedPayment)}
            </p>
          </div>
          <div>
            <p class="text-xs text-slate-500">Total</p>
            <p class="mt-1 text-xl font-bold text-secondary">
              {estimatedTotal ? formatCurrency(estimatedTotal) : "—"}
            </p>
          </div>
          <div>
            <p class="text-xs text-slate-500">Rate Range</p>
            <p class="mt-1 text-xl font-bold text-secondary">
              {selectedProduct.interestRateRange.min}–{selectedProduct
                .interestRateRange.max}%
            </p>
          </div>
        </div>
      </div>
    {/if}
  {/if}

  <div class="flex items-center justify-between pt-6">
    <button
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
    </button>
    <button
      onclick={handleNext}
      class="inline-flex items-center gap-2 rounded-xl bg-success-500 px-8 py-3 text-sm font-semibold text-white shadow-sm
				hover:bg-success-600 active:scale-[0.98] transition-all duration-150
				focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2"
    >
      Check Eligibility
    </button>
  </div>
</div>
