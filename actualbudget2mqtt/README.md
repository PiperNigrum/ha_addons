
# ActualBudget2MQTT (Home Assistant Add-on)

Publishes **Actual Budget** categories to **MQTT** incl. **Home Assistant MQTT Discovery**. 

## Features
- Connects to Actual Server via `@actual-app/api` (with optional E2E file password)
- Periodic sync (via `api.sync()`) and changes-only publishing
- MQTT LWT/availability (device-wide)
- **MQTT Discovery**: one device, many sensors (one per category)
- Graceful shutdown, month rollover support

## Install (as custom repository)
1. Push this repo to GitHub/GitLab and copy the repository URL.
2. In Home Assistant: *Settings → Add-ons → Add-on Store → ⋮ → Repositories* → add your repo URL.
3. Install the add-on **ActualBudget2MQTT** and configure options.

## Configuration (options.json)
See `config.json` for all options and defaults. Sensitive values can be placed in Home Assistant `secrets.yaml`.

## Notes
- **Amounts** are integers in minor units (e.g. 12030 = 120.30€). Index JS converts via a value_template on the HA side.
- If your Actual budget file is **encrypted**, supply `actual_budget_password` (or leave empty to reuse `actual_password`).

