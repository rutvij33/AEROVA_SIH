# SIH26056 hackathon-readiness pass

- [x] Remove unfinished Track your flight UI from the judging dashboard.
- [x] Restrict the route and airline scope to defensible India-focused coverage.
- [x] Add a clear SIH26056 solution narrative to the landing page.
- [x] Add methodology, route basket, lead-time windows, CPI framing, and validation-gate pages.
- [x] Add machine-readable API documentation and CSV export from real observations.
- [x] Add cleaning, anomaly, data-quality, and source-transparency explanations without fabricating values.
- [x] Preserve Duffel test-data labeling and avoid claiming live official CPI data.
- [x] Add or update Vitest coverage for index, cleaning, route coverage, and validation gating.
- [x] Verify homepage, dashboard, methodology, API, desktop, and mobile flows.
- [x] Save a final checkpoint and provide an honest hackathon score out of 10.

# Live India flight map

- [x] Confirm OpenSky-compatible state-vector fields and India bounding box behavior.
- [x] Store the provided flight API key as a server-only secret.
- [x] Add a server-side live-flight states procedure with sanitized aircraft fields.
- [x] Add an interactive India map with aircraft markers, selected-flight details, legend, and refresh status.
- [x] Add loading, empty, rate-limit, and error states without fake aircraft positions.
- [x] Add Vitest coverage for state-vector normalization and sensitive-field omission.
- [x] Verify desktop/mobile map behavior and save the updated checkpoint.

## Aviationstack implementation

- [x] Confirm Aviationstack flight-tracking fields and free-plan limits from official documentation.
- [x] Store the Aviationstack access key as a server-only secret named `AVIATIONSTACK_API_KEY`.
- [x] Add a typed server-side Aviationstack proxy for current India flight data and optional flight-number lookup.
- [x] Normalize only real Aviationstack aircraft positions; never create fallback markers.
- [x] Add map markers, callsign/flight number, airline, origin, destination, altitude, speed, and last-seen details.
- [x] Add explicit provider attribution and free-plan/rate-limit states.
- [x] Add tests for normalization and missing-coordinate filtering, then verify desktop/mobile and checkpoint the release.

## Flight map hardening

- [x] Replace SVG-internal HTML buttons with valid interactive marker rendering using an accessible overlay or SVG groups.
- [x] Add explicit Aviationstack rate-limit and provider-plan-limit detection/handling.
- [x] Re-verify desktop/mobile map behavior after hardening and save a checkpoint that includes the changes.

## Commercial aircraft background

- [x] Replace the fighter-jet landing background with a landing commercial passenger aircraft.
- [x] Preserve the existing AEROVA layout, typography, navigation, and editorial treatment.
- [x] Verify desktop/mobile presentation and save a checkpoint.

## Two independently published versions

- [ ] Preserve AEROVA 1 as the commercial passenger-aircraft version.
- [ ] Prepare AEROVA 2 as a separate site copy using the earlier fighter-plane version.
- [ ] Publish and label the two independent website links as AEROVA 1 and AEROVA 2.

## Separate AEROVA 2 project

- [ ] Initialize a separate AEROVA 2 project workspace without changing AEROVA 1.
- [ ] Recreate the AEROVA experience with the fighter-plane background only.
- [ ] Verify AEROVA 2 and hand over a user-publishable checkpoint.
