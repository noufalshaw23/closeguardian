# CloseGuardian Verification

Use this file to track verification commands as the MVP grows.

## Scaffold Checks

```powershell
Get-ChildItem -Directory app,server,shared
Get-ChildItem README.md,AGENTS.md,.env.example,PLAN.md,PROGRESS.md,VERIFY.md,nuxt.config.ts
git status --short
```

## Future Project Checks

Once package scripts are added, use:

```powershell
npm run typecheck
npm run lint
npm run test
npm run dev
```

## Safety Checks

- Confirm `runtimeConfig` contains private server-side keys only.
- Confirm no OpenAI API key is committed.
- Confirm client code does not import server OpenAI services.
