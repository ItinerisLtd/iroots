# Kinsta `env push` interactive selection design

## Goal

Add the same style of site/environment selection UI used by `iroots kinsta env open` to `iroots kinsta env push`, so users can interactively choose site and source/target environments when IDs are not supplied.

## Scope

- Keep existing non-interactive automation support for ID flags.
- Add friendly name flags to `env push`:
  - `--site`
  - `--source_env`
  - `--target_env`
- Reuse shared matching/prompt behaviour between `env open` and `env push`.
- Keep push option flags (`push_db`, `push_files`, `push_files_option`, `file_list`, `search_and_replace`) as flag-driven only.

Out of scope:

- A new generic wizard framework.
- Prompting for push options when omitted.

## Architecture

Introduce a shared Kinsta selection helper module under `src/lib/` used by both commands:

- `env open` consumes helper functions without behaviour changes.
- `env push` uses helper functions for interactive and friendly-flag resolution.

This avoids copy/paste duplication and keeps command-specific logic focused on command behaviour.

## Components

1. Shared selector helper module
   - Normalisation utilities (trim + case-insensitive matching).
   - Site/environment resolver functions:
     - direct ID match
     - friendly-name exact match
     - disambiguation prompt when multiple matches exist
     - interactive prompt when no explicit match is available
   - Prompt formatters consistent with current `env open` UI.

2. `src/commands/kinsta/env/open.ts`
   - Replace local resolver/prompt helpers with imports from shared module.
   - Preserve existing CLI behaviour and output format.

3. `src/commands/kinsta/env/push.ts`
   - Add friendly flags (`site`, `source_env`, `target_env`).
   - Preserve ID flags (`site_id`, `source_env_id`, `target_env_id`) for automation.
   - Add hybrid resolution path:
     - Use IDs directly when complete ID set is present.
     - Otherwise resolve from friendly names and/or prompts.

## Data flow (`env push`)

1. Parse flags.
2. If all required IDs (`site_id`, `source_env_id`, `target_env_id`) are provided:
   - Use them directly.
3. Else:
   - Fetch sites (company + API key).
   - Resolve site by `--site` when provided; otherwise prompt.
   - Fetch environments for selected site.
   - Resolve source environment by `--source_env`/`--source_env_id`; prompt if unresolved.
   - Resolve target environment by `--target_env`/`--target_env_id`; prompt if unresolved.
4. Validate source and target IDs are different.
5. Build push payload from resolved IDs plus existing push option flags/defaults.
6. Execute `pushEnvironment` and report response message.

## Error handling

- Keep hard validation errors for partial ID sets.
- Friendly-name mismatch errors include the flag name and provided value.
- Multi-match conditions trigger a selection prompt, not silent selection.
- Empty site/environment results remain explicit errors.
- Same source and target environment is rejected with an actionable error.
- API errors continue to be surfaced by `lib/kinsta.ts` request handling.

## Testing

Add or update tests to cover:

1. `env push` with full ID flags (no prompts).
2. `env push` with friendly flags resolving uniquely.
3. `env push` interactive selection path when IDs are missing.
4. Validation failures:
   - partial IDs
   - friendly-name no match
   - source equals target
5. Payload sent to `pushEnvironment` includes resolved IDs and existing push option values.
6. Shared helper tests for matching and prompt selection behaviour.
7. `env open` regression coverage for unchanged user-facing behaviour after helper extraction.

## Success criteria

- Users can run `iroots kinsta env push` without ID flags and select site/source/target interactively.
- Users can still run `iroots kinsta env push` non-interactively with ID flags for scripts/CI.
- Matching and prompt behaviour is consistent between `env open` and `env push`.
- Existing push option defaults and API behaviour remain unchanged.
