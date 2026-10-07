<script lang="ts">
  import { untrack } from "svelte";
  import type { PersonalInfo, FormErrors } from "#lib/types";
  import { Input } from "#lib/components/ui/input/index.js";
  import { Button } from "#lib/components/ui/button/index.js";
  import * as Select from "#lib/components/ui/select/index.js";

  interface Props {
    initialData: PersonalInfo;
    onNext: (data: PersonalInfo) => void;
  }

  let { initialData, onNext }: Props = $props();

  let age = $state<number | null>(untrack(() => initialData.age));
  let employmentStatus = $state(untrack(() => initialData.employmentStatus));
  let employmentDuration = $state<number | null>(
    untrack(() => initialData.employmentDuration),
  );
  let errors = $state<FormErrors>({});

  const employmentOptions = [
    { value: "employed", label: "Employed" },
    { value: "self_employed", label: "Self-Employed" },
    { value: "unemployed", label: "Unemployed" },
    { value: "retired", label: "Retired" },
  ];

  const needsDuration = $derived(
    employmentStatus === "employed" || employmentStatus === "self_employed",
  );

  function validate(): boolean {
    const e: FormErrors = {};

    const ageNum = Number(age);
    if (!age || isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
      e.age = "Age must be between 18 and 65 years";
    }

    if (!employmentStatus) {
      e.employmentStatus = "Please select your employment status";
    }

    if (needsDuration) {
      const dur = Number(employmentDuration);
      if (employmentDuration === null || isNaN(dur) || dur < 3) {
        e.employmentDuration = "Minimum 3 months employment history required";
      }
    }

    errors = e;
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) {
      onNext({ age, employmentStatus, employmentDuration });
    }
  }

  $effect(() => {
    if (!needsDuration && errors.employmentDuration) {
      const { employmentDuration: _removed, ...rest } = errors;
      errors = rest;
    }
  });
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-2xl font-bold text-slate-800">Personal Details</h2>
  </div>

  <div class="space-y-1.5">
    <label for="age" class="block text-sm font-medium text-slate-700">
      Your Age <span class="text-danger-500" aria-hidden="true">*</span>
    </label>
    <div class="relative">
      <Input
        id="age"
        type="number"
        min="18"
        max="65"
        bind:value={age}
        placeholder="e.g. 35 years"
        aria-required="true"
        aria-describedby={errors.age ? "age-error" : undefined}
        class="block w-full rounded-xl border px-4 py-3 text-slate-800 placeholder-slate-400 transition-shadow
					focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent
					{errors.age
          ? 'border-danger-400 bg-danger-50'
          : 'border-slate-200 bg-white hover:border-slate-300'}"
      />
    </div>
    {#if errors.age}
      <p
        id="age-error"
        role="alert"
        class="flex items-center gap-1.5 text-sm text-danger-600"
      >
        {errors.age}
      </p>
    {/if}
  </div>

  <div class="space-y-1.5">
    <label
      for="employment-status"
      class="block text-sm font-medium text-slate-700"
    >
      Employment Status <span class="text-danger-500" aria-hidden="true">*</span
      >
    </label>
    <Select.Root
      type="single"
      value={employmentStatus}
      onValueChange={(v: any) => (employmentStatus = v ?? "")}
    >
      <Select.Trigger
        id="employment-status"
        class="w-full"
        aria-required="true"
        aria-invalid={!!errors.employmentStatus}
        aria-describedby={errors.employmentStatus
          ? "emp-status-error"
          : undefined}
      >
        <Select.Value placeholder="Select your status" />
      </Select.Trigger>
      <Select.Content>
        {#each employmentOptions as opt}
          <Select.Item value={opt.value} label={opt.label} />
        {/each}
      </Select.Content>
    </Select.Root>
    {#if errors.employmentStatus}
      <p
        id="emp-status-error"
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
        {errors.employmentStatus}
      </p>
    {/if}
  </div>

  {#if needsDuration}
    <div class="space-y-1.5">
      <label
        for="employment-duration"
        class="block text-sm font-medium text-slate-700"
      >
        Time at Current Job <span class="text-danger-500" aria-hidden="true"
          >*</span
        >
      </label>
      <div class="relative">
        <input
          id="employment-duration"
          type="number"
          min="0"
          bind:value={employmentDuration}
          placeholder="e.g. 24 months"
          aria-required="true"
          aria-describedby="emp-duration-hint{errors.employmentDuration
            ? ' emp-duration-error'
            : ''}"
          class="block w-full rounded-xl border px-4 py-3 text-slate-800 placeholder-slate-400 transition-shadow
						focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent
						{errors.employmentDuration
            ? 'border-danger-400 bg-danger-50'
            : 'border-slate-200 bg-white hover:border-slate-300'}"
        />
      </div>

      {#if errors.employmentDuration}
        <p
          id="emp-duration-error"
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
          {errors.employmentDuration}
        </p>
      {/if}
    </div>
  {/if}

  <div class="flex justify-end pt-6">
    <Button onclick={handleNext} size='lg'>Continue</Button>
  </div>
</div>
