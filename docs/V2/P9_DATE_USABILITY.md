# Easy V2 — P9-S5 Occurrence-Date Usability Verification

**Status:** `DONE / INTEGRATED`  
**Date:** 2026-08-19  
**Scope:** bounded verification of transaction-entry occurrence-date usability only

## 1. Direct evidence reconstructed

The direct operator evidence retained from P9-S4 identified one separate date-usability signal: routine transaction entry presented today's date by default, and the operator was unsure whether that behavior still existed.

This signal did not request a new date model. D-014/P3 remain authoritative: `occurredAt` is financial/business time, while `createdAt` is registration time and reversal timestamps are audit time.

## 2. Current workflow inspected

`TransactionForm.tsx` currently:

- initializes `Data da ocorrência` from the browser's current local date;
- renders the field in the primary three-column transaction block beside reseller and transaction type;
- uses a directly editable `input[type="date"]` before save;
- validates the selected date before submission;
- converts the selected date into `occurredAt`;
- displays the helper text `Data financeira da movimentação. O momento de registro é salvo automaticamente.`

`TransactionsPage.tsx` embeds this same `TransactionForm` as the normal new-movement workflow.

Existing P3 tests already prove that an operator-selected `occurredAt` is persisted independently from the generated `createdAt` registration timestamp.

## 3. Verification result

No evidence-backed runtime usability gap was found.

The directly reported/default behavior still exists, but it is already paired with the required affordances:

1. today-local default is present;
2. the field is visibly labeled `Data da ocorrência` in the main entry block;
3. the date is editable before save;
4. helper text explicitly explains financial occurrence versus automatic registration time;
5. persistence remains independent under D-014/P3.

Therefore P9-S5 does **not** authorize or require a UI/runtime change. Changing the default, adding another date concept or redesigning P3 semantics would exceed the evidence.

## 4. Focused regression proof

`TransactionForm.occurrence.test.tsx` now explicitly proves:

- the occurrence-date input initializes to the current local date;
- the explanatory financial-vs-registration helper is present;
- the field can be changed before submission;
- the existing persistence test continues to prove the selected financial date is stored independently from `createdAt`.

No production source file was changed by P9-S5.

## 5. Validation and integration proof

- PR #56 D-019 run **`32287018048`**, job **`96178850066`**.
- Validated PR merge ref **`9459285920cfbd784a652e9db97cf40741977edf`**, combining head `fef66eb8da6602f0804d0c78eb3d6c30feaf2cac` with base `716fc3b9ec77bada5ca44d992a6760a276e38cfa`.
- ESLint: **0 errors / 82 warnings**.
- Vitest: **52 files / 217 tests PASS**.
- Playwright: **17/17 PASS**.
- Production build: **PASS**.
- PR #56 squash-integrated into `develop` as **`88c70a20071bd97ef3a08285128756e2ce484a74`**.
- Validated merge ref and integrated squash share exact tree **`97a78d3e4d78a54ad117440c160920343513ba9f`**.

Existing React/test-harness/lint/dependency/Actions/chunk warnings remain non-blocking under D-019 because the complete gate passed objectively.

## 6. Phase result

P9-S5 is complete. Because P9-S1 through P9-S5 are now complete, P9 is complete.

P10 remains `NOT_STARTED`. No controlled beta, production migration, cutover or stable-branch publication was started by this verification slice.
