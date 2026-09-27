# Preview performance budget

- Keep first interaction free of AI/model initialization.
- Defer non-critical Preview modules until browser idle time.
- Load AI Agent only after the user selects 3–5 rows or explicitly requests an AI feature.
- Keep Supabase/Auth flow unchanged.
- Keep all vocabulary data browser-local; no new telemetry or machine/file access.
- Prefer event-driven refreshes over frequent polling.
