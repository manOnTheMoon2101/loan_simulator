<script lang="ts">
  import type { PageData } from "./$types";
  import type {
    PersonalInfo,
    FinancialInfo,
    LoanDetails,
    EligibilityResponse,
    RateCalculationResponse,
  } from "#lib/types";

  import StepIndicator from "#lib/components/StepIndicator.svelte";
  import PersonalInfoStep from "#lib/components/PersonalInfoStep.svelte";
  import FinancialInfoStep from "#lib/components/FinancialInfoStep.svelte";
  import LoanDetailsStep from "#lib/components/LoanDetailsStep.svelte";
  import ResultsPanel from "#lib/components/ResultsPanel.svelte";
  import { Card, CardContent } from "#lib/components/ui/card/index.js";
	import { Input } from "#lib/components/ui/input/index.js";


  let { data }: { data: PageData } = $props();

  const products = $derived(data.products);

  let currentStep = $state<number>(1);
  let isLoading = $state<boolean>(false);
  let apiError = $state<string | null>(null);

  let personalInfo = $state<PersonalInfo>({
    age: null,
    employmentStatus: "",
    employmentDuration: null,
  });

  let financialInfo = $state<FinancialInfo>({
    monthlyIncome: null,
    monthlyExpenses: null,
    existingDebt: null,
    creditScore: null,
  });

  let loanDetails = $state<LoanDetails>({
    requestedAmount: null,
    loanTerm: 24,
    loanPurpose: "",
    loanType: "personal_loan",
  });

  let eligibilityResults = $state<EligibilityResponse | null>(null);
  let rateResults = $state<RateCalculationResponse | null>(null);

  const steps = [
    { label: "Personal", sublabel: "Your details" },
    { label: "Financial", sublabel: "Your finances" },
    { label: "Loan", sublabel: "Loan details" },
    { label: "Results", sublabel: "Your results" },
  ];

  function scrollToTop() {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handlePersonalNext(info: PersonalInfo) {
    personalInfo = info;
    currentStep = 2;
    scrollToTop();
  }

  function handleFinancialNext(info: FinancialInfo) {
    financialInfo = info;
    currentStep = 3;
    scrollToTop();
  }

  async function handleLoanNext(info: LoanDetails) {
    loanDetails = info;
    await checkEligibility();
  }

  function handleBack() {
    currentStep = Math.max(1, currentStep - 1);
    scrollToTop();
  }

  function handleRecalculate() {
    eligibilityResults = null;
    rateResults = null;
    apiError = null;
    currentStep = 1;
    scrollToTop();
  }

  async function checkEligibility() {
    isLoading = true;
    apiError = null;

    try {
      const [eligibilityRes, rateRes] = await Promise.all([
        fetch("/api/loans/eligibility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personalInfo: {
              age: personalInfo.age!,
              employmentStatus: personalInfo.employmentStatus,
              employmentDuration: personalInfo.employmentDuration ?? 0,
            },
            financialInfo: {
              monthlyIncome: financialInfo.monthlyIncome!,
              monthlyExpenses: financialInfo.monthlyExpenses!,
              existingDebt: financialInfo.existingDebt ?? 0,
              ...(financialInfo.creditScore
                ? { creditScore: financialInfo.creditScore }
                : {}),
            },
            loanDetails: {
              requestedAmount: loanDetails.requestedAmount!,
              loanTerm: loanDetails.loanTerm,
              loanPurpose: loanDetails.loanPurpose,
            },
          }),
        }),
        fetch("/api/loans/calculate-rate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            loanAmount: loanDetails.requestedAmount!,
            loanTerm: loanDetails.loanTerm,
            loanType: loanDetails.loanType,
            ...(financialInfo.creditScore
              ? { creditScore: financialInfo.creditScore }
              : {}),
          }),
        }),
      ]);

      if (!eligibilityRes.ok || !rateRes.ok) {
        throw new Error("API error");
      }

      eligibilityResults = await eligibilityRes.json();
      rateResults = await rateRes.json();
      currentStep = 4;
      scrollToTop();
    } catch {
      apiError = "Unable to check eligibility. Please try again.";
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="flex min-h-screen flex-col">
  <main class="mx-auto w-full max-w-5xl flex-1 flex flex-col justify-center px-4 py-8 sm:px-6">
    <Card>
      {#if isLoading}
        <CardContent
          class="flex flex-col items-center justify-center text-center"
          aria-live="polite"
          aria-busy="true"
        >
          loading...
        </CardContent>
      {:else if apiError}
        <CardContent class="px-8 py-16 text-center">
          <h2 class="mt-4 text-lg font-bold text-slate-800">
            Something went wrong
          </h2>
          <p class="mt-2 text-sm text-slate-500">{apiError}</p>
          <button
            onclick={() => {
              apiError = null;
              currentStep = 3;
            }}
            class="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white
							hover:bg-brand-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-700 focus:ring-offset-2"
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
            Try Again
          </button>
        </CardContent>
      {:else if currentStep === 1}
        <CardContent class="p-6 sm:p-8">
          <PersonalInfoStep
            initialData={personalInfo}
            onNext={handlePersonalNext}
          />
        </CardContent>
      {:else if currentStep === 2}
        <CardContent class="p-6 sm:p-8">
          <FinancialInfoStep
            initialData={financialInfo}
            onNext={handleFinancialNext}
            onBack={handleBack}
          />
        </CardContent>
      {:else if currentStep === 3}
        <CardContent class="p-6 sm:p-8">
          <LoanDetailsStep
            initialData={loanDetails}
            {products}
            onNext={handleLoanNext}
            onBack={handleBack}
          />
        </CardContent>
      {:else if currentStep === 4 && eligibilityResults && rateResults}
        <CardContent class="p-6 sm:p-8">
          <ResultsPanel
            eligibility={eligibilityResults}
            rateData={rateResults}
            onRecalculate={handleRecalculate}
          />
        </CardContent>
      {/if}
    </Card>
    <StepIndicator {steps} {currentStep} />
  </main>
</div>
