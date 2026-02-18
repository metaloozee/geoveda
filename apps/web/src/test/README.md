# Web test patterns

- Prefer a lean suite: focus on a few high-value component/integration tests.
- Prioritize tests around data display and form submission/validation behavior.
- Prefer mocking network/data hooks (`useQuery`, Convex hooks, auth hooks) at the module boundary.
- Keep tests colocated as `*.test.ts` / `*.test.tsx` next to the source file.
