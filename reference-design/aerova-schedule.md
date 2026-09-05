# AEROVA scheduled collection

The project-level Heartbeat `aerova-daily-airfare-snapshot` was created for daily execution at `03:00 UTC`.

- Task UID: `hrqWpdZ76i96mXt5dXJp53`
- Callback: `/api/scheduled/captureAirfareSnapshot`
- Purpose: capture one idempotent Duffel airfare snapshot per day for stored index history.

The updated AEROVA site deployed successfully before schedule verification. The deployed callback responds with `403 cron-only` to unauthenticated requests, confirming the route is mounted; Heartbeat execution history is currently empty because the first run is scheduled for the next 03:00 UTC window.
