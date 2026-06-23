# Kinsta `env push` resolution-progress feedback design

## Goal

Make `iroots kinsta env push` clearly show activity while it resolves site/environment data, so users do not see a silent pause during network calls.

## Scope

- Add visible staged progress labels only in the resolution path (when full IDs are not already supplied).
- Use oclif `ux.action` spinner-style feedback with detailed step labels.
- Keep existing push execution feedback (`Pushing environment ...`) unchanged.

Out of scope:

- Behaviour changes in full-ID mode.
- Refactoring other commands into a shared progress abstraction.
- Changing push payload defaults or API interaction logic.

## Architecture and components

Update `src/commands/kinsta/env/push.ts` only:

1. Wrap each relevant resolution stage with `ux.action.start(...)`/`ux.action.stop(...)`.
2. Keep stage boundaries explicit, so one stage is always stopped before the next starts.
3. Reuse existing error flow (`this.error(...)`) so failures remain actionable and unchanged in meaning.

## Data flow

When resolution is needed:

1. Start `Fetching sites for company...` before `getAllSites(...)`, then stop after sites are available.
2. Start `Fetching environments for selected site...` before `getSiteEnvironments(...)` when environments are not already available, then stop after retrieval.
3. Start `Resolving source environment...`, stop once source is selected.
4. Start `Resolving target environment...`, stop once target is selected.
5. Continue with existing push action label and `pushEnvironment(...)` call.

When all IDs are provided (`--site_id`, `--source_env_id`, `--target_env_id`), skip the new resolution-stage labels entirely.

## Error handling

- Progress labels are informational only and must not swallow or rewrite errors.
- If a resolution stage fails, stop the active stage and propagate the original error message through existing command handling.
- Skipped stages must not emit placeholder output.

## Testing

Add or update tests to verify:

1. Resolution path emits the new staged labels in the expected order.
2. Full-ID mode emits no new pre-resolution labels.
3. Existing push action label and push payload behaviour are unchanged.

## Success criteria

- Running `iroots kinsta env push` in interactive/friendly-name mode shows immediate visible progress during fetch/resolve stages.
- Running `iroots kinsta env push` in full-ID mode behaves as before, with no extra pre-resolution chatter.
