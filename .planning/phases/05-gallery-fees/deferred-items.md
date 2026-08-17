# Deferred items, phase 05

Out-of-scope discoveries made while executing this phase. Nothing here is fixed by the plan
that found it: each one is either older than the plan or touches surfaces the plan does not own.

## D-05-05-A: every required panel field renders TWO asterisks

**Found by:** plan 05-05, task 2, while checking the new Cennik labels against Contract 10.
**Scope:** pre-existing, repository wide, older than phase 05.

`src/lib/components/FormField.svelte:112-116` appends `<span aria-hidden="true"> *</span>`
whenever the `wymagane` prop is set, and every label in `src/lib/content/panel.ts` ALSO ends in
a literal ` *` (a convention `tests/admin-copy.unit.ts:306-312` actively asserts). Every editor
screen therefore renders the marker twice. Observed on the live preview:

```
"Wprowadzenie **\n(pole wymagane)"          <- /admin/o-nas, shipped since 04.1
"Stawka z uchwały (zł) **\n(pole wymagane)" <- /admin/cennik, the same convention
```

The accessible name is unaffected (`(pole wymagane)` is the announced half and occurs once),
so this is cosmetic, not a WCAG failure, and axe is clean on every panel screen.

**Not fixed here, deliberately.** The three available fixes each land outside plan 05-05:

1. drop the literal ` *` from the copy module. That contradicts `05-UI-SPEC` Contract 10,
   whose label column spells `Stawka z uchwały (zł) *`, and turns
   `tests/admin-copy.unit.ts:306-312` red for every screen in the panel;
2. drop the `wymagane` prop at the call sites. That silently removes `required` and
   `aria-required` from every required control in the panel, which is a real regression;
3. change `FormField.svelte` to stop appending the visible marker. That is the right fix, and
   it is a change to a component EVERY form on the public site also uses (`ZgloszenieForm`,
   the kontakt form), so it needs its own plan and its own regression run.

The new Cennik screen deliberately follows the existing convention rather than diverging from
it: one screen spelled differently from the other seven would be a worse defect than the one
being deferred.
