<script lang="ts">
  interface StepDef {
    label: string;
    sublabel: string;
  }

  interface Props {
    steps: StepDef[];
    currentStep: number;
  }

  let { steps, currentStep }: Props = $props();
</script>

<div aria-label="Form progress" class="mt-16">
  <ol class="flex items-start justify-center">
    {#each steps as step, i}
      {@const stepNum = i + 1}
      {@const isCompleted = stepNum < currentStep}
      {@const isActive = stepNum === currentStep}

      <li class="flex items-center">
        <div class="flex flex-col items-center">
          <div
            class="relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300
							{isCompleted
              ? 'bg-accent text-white shadow-md'
              : isActive
                ? 'bg-primary text-white shadow-md ring-4 ring-primary/20'
                : 'border-2 border-slate-200 bg-slate-100 text-slate-400 opacity-20'}"
            aria-current={isActive ? "step" : undefined}
          >
            {#if isCompleted}
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            {:else}
              <span aria-hidden="true">{stepNum}</span>
            {/if}
          </div>

          <span
            class="mt-2 max-w-18 text-center text-xs font-semibold leading-tight
							{isActive ? 'text-primary' : isCompleted ? 'text-accent' : 'text-slate-400'}"
          >
            {step.label}
          </span>
          <span
            class="mt-0.5 hidden max-w-18 text-center text-[10px] leading-tight text-slate-400 sm:block"
          >
            {step.sublabel}
          </span>
        </div>

        {#if i < steps.length - 1}
          <div
            class="mx-1 mb-8 h-0.5 w-8 shrink-0 transition-all duration-300 sm:w-14
							{stepNum < currentStep ? 'bg-accent' : 'bg-primary/20'}"
          ></div>
        {/if}
      </li>
    {/each}
  </ol>
</div>
