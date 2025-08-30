![Test Standards Banner](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiMwMzE2M2YiLz4KICAgICAgPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDc1MmVhIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuNCIvPgogICAgICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxLjUiIGZpbGw9IiMwNzUyZWEiIG9wYWNpdHk9IjAuNiIvPgogICAgPC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPgogIDx0ZXh0IHg9IjQwMCIgeT0iMzUiIGZvbnQtZmFtaWx5PSJBcmlhbCBCbGFjayIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlRlc3QgU3RhbmRhcmRzPC90ZXh0PgogIDx0ZXh0IHg9IjQwMCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzA3NTJlYSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SGVhZGVycyBFbmZvcmNlbWVudDwvdGV4dD4KICA8dGV4dCB4PSI0MDAiIHk9Ijc1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC43KSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+mnO+4jyBRdWFsaXR5IEFzc3VyYW5jZSBQb2xpY2llczwvdGV4dD4KPC9zdmc+)

# Test Headers Enforcement

## Purpose
Ensure every TypeScript test is easy to navigate: each file starts with a contextual header comment and has a top-level suite (`describe/context/suite`).

## Scope
- In: `**/*.(test|spec).ts(x)`, plus any `.ts(x)` under `**/test/**` or `**/__tests__/**`.
- Out: non-TS tests, snapshots/fixtures, generated folders (`out/`, `dist/`, `coverage`, `node_modules`).

## Detection Rules
- Missing suite: no top-level `describe|context|suite(` found.
- Missing header: no leading block comment describing the test.
- Idempotent: existing suites/headers are preserved; imports/comments at top remain first.

## Header and Suite Spec
Example at top of each test file:

```ts
/*
 Test: src/foo/bar.test.ts
 Target: src/foo/bar.ts
 Purpose: Validates bar() edge cases
 Env: node
*/

describe('src/foo/bar.test.ts', () => {
  // ...existing test code...
});
```

- Header values use repo-relative paths; `Target` is inferred by stripping `.test|.spec` where possible.

## How to Run
- Dry run (list files that would change):
  `node scripts/ensure-test-headers.mjs`
- Apply changes in place:
  `node scripts/ensure-test-headers.mjs --write`

The script preserves imports and reference directives at the top of each file.

## CI (Optional)
Add a check to fail if updates are needed:
- Run dry, assert zero changes; or add an npm script like `"test:headers": "node scripts/ensure-test-headers.mjs && git diff --exit-code"` and execute it in CI.

## Notes
- Avoid brittle snapshots; prefer explicit assertions.
- Don’t wrap when a top-level suite already exists.
