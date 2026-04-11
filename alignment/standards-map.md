# Standards Alignment Map

What parts of a rare disease clinical narrative fit into existing standards — and what does not?

This document is a living map, updated during and after the session.

## Coverage overview

| Narrative element | HPO | Phenopackets | Mondo | ECTO | Phenopackets element | Notes |
|-------------------|-----|-------------|-------|------|---------------------|-------|
| Presenting symptom | ✅ | ✅ | — | — | `PhenotypicFeature` | |
| Age of onset | ✅ (modifier) | ✅ | — | — | `PhenotypicFeature.onset` | |
| Disease diagnosis | — | ✅ | ✅ | — | `Disease` | |
| Symptom severity | ✅ (modifier) | partial | — | — | `PhenotypicFeature.severity` | HPO modifiers are coarse |
| Symptom progression / trajectory | ❌ | ❌ | — | — | — | Major gap |
| Lab / biomarker value | — | ✅ | — | — | `Measurement` | Requires LOINC/ontology term |
| Treatment / drug | — | ✅ | — | ✅ | `MedicalAction` | |
| Environmental exposure | — | partial | — | ✅ | `MedicalAction.treatment` | ECTO rarely used in practice |
| Genetic variant | — | ✅ | — | — | `Interpretation` | |
| Family history | partial | partial | — | — | `Pedigree` | Limited depth |
| Patient-reported severity | ❌ | partial | — | — | `Measurement` (if scored) | Raw PRO items not mappable |
| Diagnostic uncertainty | ❌ | ❌ | — | — | — | Major gap |
| Rate of decline | ❌ | ❌ | — | — | — | Major gap |
| Caregiver impact | ❌ | ❌ | — | — | — | Out of scope for all standards |
| Functional status (ADLs) | partial | partial | — | — | `Measurement` | Instrument-dependent |
| Imaging finding | partial | partial | — | — | `Measurement` / `File` | No structured radiology terms |
| Negative finding (tested, absent) | ✅ | ✅ | — | — | `PhenotypicFeature.excluded=true` | Well-handled |

**Legend:** ✅ = well covered · partial = covered but with loss · ❌ = not covered · — = not applicable

## Phenopackets schema elements — quick reference

```
Phenopacket
├── Individual          (subject demographics)
├── PhenotypicFeature[] (HPO terms + onset + modifiers)
├── Disease[]           (Mondo terms + onset)
├── Measurement[]       (quantitative values — labs, scores)
├── MedicalAction[]     (treatments, procedures)
│   ├── Treatment       (drug, regimen)
│   ├── RadiationTherapy
│   └── TherapeuticRegimen
├── Interpretation      (genomic diagnosis)
├── Biosample[]         (tissue samples)
├── File[]              (VCF, DICOM, etc.)
└── MetaData            (ontology versions used)
```

## What a structured rare disease narrative needs that doesn't exist yet

*(fill in during the working session)*

1.
2.
3.
