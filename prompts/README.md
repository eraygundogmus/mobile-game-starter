# Prompts

The prompts behind the workflow in [`docs/WORKFLOW.md`](../docs/WORKFLOW.md), in order.
Copy one, replace the `<…>` parts, and paste it into Claude Code or Codex in the repo root.
Each file says when to use it, what it should produce and what to check before the next step.

| # | Step | File |
|---|---|---|
| 01 | Idea and plan (no code) | [01-plan.md](01-plan.md) |
| 02 | Design canon, glossary, formula sheet | [02-canon.md](02-canon.md) |
| 03 | Engine, tests, sim gates | [03-engine.md](03-engine.md) |
| 04 | Parallel systems with worktrees (optional) | [04-parallel-systems.md](04-parallel-systems.md) |
| 05 | Phone and web app | [05-app.md](05-app.md) |
| 06 | Visual identity and art prompts | [06-visual-identity.md](06-visual-identity.md) |
| 07 | Sound | [07-sound.md](07-sound.md) |
| 08 | Online (verified runs or live matches) | [08-online.md](08-online.md) |
| 09 | Store release | [09-release.md](09-release.md) |
| 10 | UI audit (any time) | [10-ui-audit.md](10-ui-audit.md) |

Tips:

1. One prompt, one step. Wait for the output and check it before the next prompt.
2. End coding prompts with "run npm run gate and paste the output".
3. When the agent and the canon disagree, ask it to change the canon first, then the code.
