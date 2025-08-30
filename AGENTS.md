# Repository Guidelines

## Project Structure & Module Organization
- `src/`: TypeScript source for the VS Code extension (entry: `src/extension.ts`).
- `media/`: Webview assets (CSS/JS/images) used by UI.
- `out/`: Compiled JavaScript output (generated; do not edit).
- `test/` or `src/test/`: Extension integration/unit tests.
- `.vscode/`: Dev setup (`launch.json`, `tasks.json`).
- Root configs: `package.json`, `tsconfig.json`, ESLint/Prettier configs, `README.md`.

## Build, Test, and Development Commands
- `npm install`: Install dependencies.
- `npm run compile`: Type-check and build to `out/`.
- `npm run watch`: Incremental build on file changes.
- `npm test`: Run tests in the VS Code test runner.
- `npm run lint` / `npm run format`: Lint and auto-format the codebase.
- `npx vsce package`: Create a `.vsix` package (requires `vsce`).

Example: run the extension in the debugger via VS Code “Run and Debug” using the `Extension` launch config.

## Coding Style & Naming Conventions
- Language: TypeScript, 2-space indent, semicolons on, single quotes.
- Lint/format: ESLint + Prettier; fix issues with `npm run lint -- --fix` and `npm run format`.
- Names: `camelCase` for vars/functions, `PascalCase` for classes, `kebab-case` for filenames; activation files like `extension.ts` follow VS Code norms.
- Imports: Prefer absolute from `src/` alias if configured; otherwise relative, no deep `../..` chains.

## Testing Guidelines
- Framework: `@vscode/test-electron` (and/or Jest) for activation/integration tests.
- Location: co-locate as `*.test.ts` under `src/` or place in `src/test/`.
- Run: `npm test`; add `-- --runInBand` for deterministic CI runs if using Jest.
- Coverage: aim for meaningful coverage of activation paths, commands, and webview logic; avoid snapshot brittleness.

## Commit & Pull Request Guidelines
- Commits: Conventional Commits style (e.g., `feat: add glow preview panel`, `fix: handle empty workspace`).
- PRs: concise description, linked issue (`Closes #123`), screenshots/GIFs for UI changes, and test notes.
- Checks: ensure `npm run compile`, `npm test`, and `npm run lint` pass locally.

## Security & Configuration Tips
- Never commit secrets; use environment variables and `.env` in local only.
- Validate untrusted input from workspaces; sanitize paths and URIs.
- Keep dependencies current; run `npm audit` and address high-severity issues.
