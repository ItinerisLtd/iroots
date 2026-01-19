# Copilot Instructions

## Workflow Requirements

- After every code change, you **must** run `npm run lint` and fix any lint errors.
- After linting, you **must** run `npm run build` to ensure the application builds successfully.
- Only commit and push changes after both lint and build pass without errors.

## Commit Workflow

1. Make your code changes.
2. Run `npm run lint` and fix all reported issues.
3. Run `npm run build` and ensure there are no build errors.
4. Stage your changes with `git add`.
5. Commit your changes with a clear, conventional commit message.
6. Push your changes to the repository.

## Additional Notes

- Do not skip linting or building, even for small changes.
- If you amend a commit after fixing lint/build errors, force push to update the remote branch.
- These steps help maintain code quality and repository stability.
