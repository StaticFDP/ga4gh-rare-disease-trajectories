# Contributing

## During the live session (April 16)

**Fastest path:** Use a GitHub Issue template — no git knowledge required.  
**Intermediate:** Edit files directly in the GitHub web UI.  
**Full path:** Fork → edit → pull request.

## Adding a disease case

1. Copy the entire `cases/_template/` folder.
2. Rename it to a short identifier for your disease or registry (e.g. `cases/als-tdi/`).
3. Fill in all three files:
   - `narrative.md` — the clinical story in plain language
   - `timeline.yaml` — key events in chronological order
   - `phenotype-map.yaml` — HPO/Mondo term mappings and identified gaps
4. Add FDP dataset metadata to `metadata/fdp/catalog.yaml`.
5. Open a pull request or commit directly if you have write access.

## Reporting gaps

Edit `gaps/ontology-gaps.md` or `gaps/data-model-gaps.md` directly, or open a GitHub Issue.

## Conventions

- Use CURIE notation for ontology terms: `HP:0001250`, `MONDO:0007739`
- Use ISO 8601 for dates: `2024-03`, `2023`
- Mark unknown values as `null`, not blank
- Mark "not collected" as `"not_collected"` — this is different from unknown
- Use `"narrative"` for free-text fields; keep structured fields machine-readable

## Metadata completeness levels

We use a tiered system so partial contributions are still valuable:

| Level | Minimum required |
|-------|-----------------|
| Bronze | Disease name (Mondo ID) + narrative paragraph |
| Silver | + timeline (≥3 events) + at least 5 HPO terms |
| Gold | + complete phenotype-map.yaml + FDP metadata block |
