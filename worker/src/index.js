/**
 * BYOD Form Receiver — Cloudflare Worker
 *
 * Routes:
 *   GET  /forms/disease-case   → disease case submission form
 *   GET  /forms/ontology-gap   → ontology gap form
 *   GET  /forms/data-gap       → data / model gap form
 *   GET  /forms/form-feedback  → feedback on forms / propose new form
 *   POST /submit               → create GitHub Issue, return thank-you page
 *   GET  /                     → redirect to landing page
 *
 * Secrets required (wrangler secret put):
 *   GITHUB_TOKEN  — fine-grained PAT with Issues: Read & Write
 *
 * Vars (wrangler.toml):
 *   GITHUB_REPO   — e.g. "StaticFDP/ga4gh-rare-disease-trajectories"
 *   LANDING_PAGE  — e.g. "https://fdp.semscape.org/ga4gh-rare-disease-trajectories/"
 */

// ── Shared styles ────────────────────────────────────────────────────────────

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --brand: #1a6b5a; --brand-light: #e6f4f1; --brand-dark: #0f4c3a;
  --accent: #2563eb; --text: #1a1a2e; --muted: #6b7280;
  --border: #e5e7eb; --radius: 10px;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 15px; line-height: 1.6; color: var(--text);
  background: #f8fafc; padding-bottom: 64px;
}
a { color: var(--brand); }
.container { max-width: 720px; margin: 0 auto; padding: 0 20px; }
header {
  background: linear-gradient(135deg, var(--brand-dark) 0%, var(--brand) 60%, var(--accent) 100%);
  color: #fff; padding: 28px 20px 24px; margin-bottom: 36px;
}
header a.back {
  display: inline-block; font-size: 13px; opacity: .8; margin-bottom: 10px;
  color: rgba(255,255,255,.85); text-decoration: none;
}
header a.back:hover { opacity: 1; }
header h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
header p  { font-size: 14px; opacity: .85; }
.notice {
  background: var(--brand-light); border: 1px solid #a7d9ce;
  border-radius: var(--radius); padding: 11px 15px;
  font-size: 13px; color: var(--brand-dark); margin-bottom: 28px;
}
.section-title {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .07em; color: var(--muted);
  border-bottom: 1px solid var(--border); padding-bottom: 7px; margin-bottom: 18px;
}
.field { margin-bottom: 20px; }
label { display: block; font-weight: 600; font-size: 14px; margin-bottom: 3px; }
label .req { color: #dc2626; margin-left: 2px; }
.hint { font-size: 13px; color: var(--muted); margin-bottom: 6px; }
input[type=text], input[type=url], textarea, select {
  width: 100%; padding: 8px 11px;
  border: 1.5px solid var(--border); border-radius: 8px;
  font-size: 14px; font-family: inherit; background: #fff;
  transition: border-color .15s;
}
input:focus, textarea:focus, select:focus {
  outline: none; border-color: var(--brand);
  box-shadow: 0 0 0 3px rgba(26,107,90,.1);
}
textarea { resize: vertical; min-height: 90px; }
.cb-group { display: flex; flex-direction: column; gap: 7px; }
.cb-group label {
  font-weight: 400; display: flex; align-items: flex-start;
  gap: 8px; cursor: pointer;
}
.cb-group input[type=checkbox] {
  margin-top: 3px; flex-shrink: 0; width: 15px; height: 15px;
  accent-color: var(--brand);
}
.cb-subhead {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .06em; color: var(--muted);
  margin-top: 12px; margin-bottom: 4px;
}
.id-hint {
  font-size: 12px; color: var(--muted); background: #f1f5f9;
  border: 1px solid var(--border); border-radius: 6px;
  padding: 8px 11px; margin-bottom: 6px; font-family: monospace;
  line-height: 1.8;
}
.btn-submit {
  display: block; width: 100%; padding: 13px;
  background: var(--brand); color: #fff; border: none;
  border-radius: 8px; font-size: 15px; font-weight: 700;
  cursor: pointer; margin-top: 32px;
  transition: filter .15s, transform .1s;
}
.btn-submit:hover { filter: brightness(.92); transform: translateY(-1px); }
.honeypot { display: none !important; }
.thankyou { text-align: center; padding: 72px 20px; }
.thankyou .icon { font-size: 56px; margin-bottom: 16px; }
.thankyou h1 { font-size: 26px; font-weight: 800; margin-bottom: 10px; }
.thankyou p { color: var(--muted); margin-bottom: 6px; font-size: 15px; }
.thankyou a.btn-back {
  display: inline-block; margin-top: 24px; padding: 11px 22px;
  background: var(--brand); color: #fff; border-radius: 8px;
  font-weight: 600; font-size: 14px; text-decoration: none;
}
.error-box {
  background: #fef2f2; border: 1px solid #fca5a5;
  border-radius: var(--radius); padding: 16px; margin-top: 24px;
  font-size: 14px; color: #991b1b;
}
`;

// ── HTML page shell ──────────────────────────────────────────────────────────

function page(title, subtitle, body, landingPage) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} · Bring Your Own Disease · GA4GH 2026</title>
  <style>${CSS}</style>
</head>
<body>
<header>
  <div class="container">
    <a class="back" href="${landingPage}">← Back to session page</a>
    <h1>${title}</h1>
    ${subtitle ? `<p>${subtitle}</p>` : ''}
  </div>
</header>
<div class="container">${body}</div>
</body>
</html>`;
}

// ── Shared field fragments ───────────────────────────────────────────────────

const DISEASE_ID_FIELD = `
<div class="field">
  <label>Disease identifiers <span style="font-weight:400;color:var(--muted)">(any ontology, any combination)</span></label>
  <div class="id-hint">
    ORPHA:803 &nbsp;·&nbsp; OMIM:105400 &nbsp;·&nbsp; ICD-11:8B60 &nbsp;·&nbsp;
    ICD-10:G12.2 &nbsp;·&nbsp; SNOMED:37340000 &nbsp;·&nbsp; GARD:0005765 &nbsp;·&nbsp;
    MONDO:0004976 &nbsp;·&nbsp; NANDO:1200263
  </div>
  <textarea name="disease_ids" rows="3"
    placeholder="One identifier per line, e.g.&#10;ORPHA:803&#10;OMIM:105400&#10;ICD-10:G12.2"></textarea>
</div>`;

const CONTRIBUTOR_FIELD = `
<div class="field">
  <label>Your name / affiliation <span style="font-weight:400;color:var(--muted)">(optional)</span></label>
  <input type="text" name="contributor" placeholder="e.g. Ada Hamosh, Johns Hopkins">
</div>`;

const HONEYPOT = `<div class="honeypot"><input type="text" name="h_confirm" tabindex="-1" autocomplete="off"></div>`;

// ── Form: disease case ───────────────────────────────────────────────────────

function formDiseaseCase(landingPage) {
  const body = `
<div class="notice">
  Fill in as much as you can — partial entries are welcome. No GitHub account needed.
</div>

<form method="POST" action="/submit">
  ${HONEYPOT}
  <input type="hidden" name="form_type" value="disease-case">

  <div class="section-title">Disease identity</div>

  <div class="field">
    <label>Disease name <span class="req">*</span></label>
    <input type="text" name="disease_name" required placeholder="e.g. Amyotrophic Lateral Sclerosis">
  </div>
  ${DISEASE_ID_FIELD}
  <div class="field">
    <label>Registry or data source</label>
    <input type="text" name="registry" placeholder="e.g. ALS TDI Registry, PhenoDB, IAMRARE, RD-Connect…">
  </div>
  <div class="field">
    <label>Registry URL</label>
    <input type="url" name="registry_url" placeholder="https://…">
  </div>

  <div class="section-title" style="margin-top:28px">Clinical narrative</div>

  <div class="field">
    <label>Disease narrative — plain language <span class="req">*</span></label>
    <div class="hint">Describe the typical patient journey. No patient-identifying information.</div>
    <textarea name="narrative" rows="6" required
      placeholder="Onset: …&#10;Diagnostic odyssey: …&#10;Key clinical milestones: …&#10;Current management: …"></textarea>
  </div>
  <div class="field">
    <label>Key timeline events <span style="font-weight:400;color:var(--muted)">(one per line)</span></label>
    <textarea name="timeline_events" rows="4"
      placeholder="age:40y — first symptom&#10;onset+8mo — definitive diagnosis"></textarea>
  </div>

  <div class="section-title" style="margin-top:28px">Data types collected</div>
  <div class="field">
    <div class="cb-group">
      ${[
        'Structured phenotype terms (HPO)',
        'Clinical narrative / free text',
        'Genetic / genomic data',
        'Lab results / biomarkers',
        'Patient-reported outcomes (PROs)',
        'Imaging',
        'Functional assessments',
        'Family history / pedigree',
        'Treatment / medication history',
        'Disease progression / longitudinal follow-up',
        'Environmental / exposure history',
        'Facial / dysmorphology features',
        'Other',
      ].map(o => `<label><input type="checkbox" name="data_types" value="${o}"> ${o}</label>`).join('\n      ')}
    </div>
  </div>

  <div class="section-title" style="margin-top:28px">Phenotype &amp; gaps</div>

  <div class="field">
    <label>HPO phenotype terms <span style="font-weight:400;color:var(--muted)">(if known)</span></label>
    <div class="hint">One per line — look up at <a href="https://hpo.jax.org/" target="_blank">hpo.jax.org</a></div>
    <textarea name="hpo_terms" rows="3" placeholder="HP:0002360 — Sleep disturbance&#10;HP:0003473 — Fatigable weakness"></textarea>
  </div>
  <div class="field">
    <label>What clinical nuance is LOST when encoding this case in structured terms alone?</label>
    <textarea name="narrative_gaps" rows="3"
      placeholder="e.g. Rate of progression, caregiver burden, diagnostic odyssey experience…"></textarea>
  </div>
  <div class="field">
    <label>What information SHOULD be collected but currently is NOT?</label>
    <textarea name="missing_data" rows="3"
      placeholder="e.g. Time from first symptom to first specialist visit is rarely recorded…"></textarea>
  </div>

  <div class="section-title" style="margin-top:28px">About you</div>
  ${CONTRIBUTOR_FIELD}

  <button type="submit" class="btn-submit">Submit disease case →</button>
</form>`;
  return page('Submit a disease case', 'Rare disease narrative, timeline, ontology identifiers', body, landingPage);
}

// ── Form: ontology gap ───────────────────────────────────────────────────────

function formOntologyGap(landingPage) {
  const ontologies = [
    'Orphanet (ORDO) — rare disease classification',
    'OMIM — Mendelian / genetic disease',
    'GARD — NIH rare disease catalogue',
    'HPO (Human Phenotype Ontology)',
    'ECTO (Environmental Conditions and Treatments)',
    'ICD-11 — WHO clinical classification (current)',
    'ICD-10 — WHO clinical classification (legacy)',
    'SNOMED CT — clinical terminology',
    'Mondo — cross-ontology harmonisation',
    'NANDO — neurological & neuromuscular diseases',
    'MeSH — NLM indexing vocabulary',
    'DOID — Disease Ontology',
    'Other / multiple not listed',
  ];
  const gapTypes = [
    'Missing term — concept does not exist in any relevant ontology',
    'Term too broad — no sufficiently specific term',
    'Term too narrow — existing term is over-specified',
    'Wrong axis — concept modelled under incorrect parent',
    'Modifier missing — no qualifier for severity / laterality / progression',
    'Temporal dimension missing — cannot express change over time',
    'Cross-ontology misalignment — same concept modelled inconsistently',
    'Rare disease not represented — disease in ORDO but absent elsewhere',
    'PRO / patient-reported concept out of scope',
    'Caregiver / family impact not modelled',
    'Other',
  ];
  const body = `
<div class="notice">
  Flag concepts that cannot be adequately expressed using current ontology terms.
  No GitHub account needed.
</div>

<form method="POST" action="/submit">
  ${HONEYPOT}
  <input type="hidden" name="form_type" value="ontology-gap">

  <div class="section-title">Disease context</div>
  <div class="field">
    <label>Disease name <span style="font-weight:400;color:var(--muted)">(if disease-specific)</span></label>
    <input type="text" name="disease_name" placeholder="e.g. ALS, Stargardt — or leave blank for cross-disease gap">
  </div>
  ${DISEASE_ID_FIELD}

  <div class="section-title" style="margin-top:28px">Which ontology has the gap? <span class="req">*</span></div>
  <div class="field">
    <div class="cb-group">
      ${ontologies.map(o => `<label><input type="checkbox" name="ontology" value="${o}"> ${o}</label>`).join('\n      ')}
    </div>
  </div>

  <div class="field">
    <label>Is this a cross-ontology gap?</label>
    <div class="cb-group">
      <label><input type="checkbox" name="cross_ontology" value="yes">
        Yes — the concept exists in one ontology but is missing or misaligned in another
      </label>
    </div>
  </div>
  <div class="field">
    <label>Cross-ontology detail <span style="font-weight:400;color:var(--muted)">(if applicable)</span></label>
    <textarea name="cross_ontology_detail" rows="3"
      placeholder="Has it: ORPHA:803 (well-defined)&#10;Missing: ICD-11 — no equivalent code"></textarea>
  </div>

  <div class="section-title" style="margin-top:28px">Describing the gap</div>

  <div class="field">
    <label>Clinical concept that cannot be adequately expressed <span class="req">*</span></label>
    <textarea name="concept" rows="4" required
      placeholder="I am trying to represent: …&#10;Closest existing term: ORPHA:XXXX / HP:XXXX (label)&#10;Why it is insufficient: …"></textarea>
  </div>
  <div class="field">
    <label>Type of gap</label>
    <select name="gap_type">
      <option value="">— select —</option>
      ${gapTypes.map(t => `<option>${t}</option>`).join('\n      ')}
    </select>
  </div>
  <div class="field">
    <label>Concrete clinical examples</label>
    <textarea name="concrete_examples" rows="3"
      placeholder="e.g. A patient with ALS whose weakness progresses distally to proximally — no HPO term for progression direction…"></textarea>
  </div>
  <div class="field">
    <label>Proposed solution <span style="font-weight:400;color:var(--muted)">(optional)</span></label>
    <textarea name="proposed_solution" rows="3"
      placeholder="Suggested new term: …&#10;Suggested parent: HP:XXXXXXX&#10;Definition: …"></textarea>
  </div>

  <div class="field">
    <label>Priority</label>
    <select name="priority">
      <option value="">— select —</option>
      <option>Critical — blocks meaningful data sharing or patient identification</option>
      <option>High — significant clinical information lost in encoding</option>
      <option>Medium — workarounds exist but introduce ambiguity</option>
      <option>Low — minor nuance lost</option>
    </select>
  </div>

  <div class="section-title" style="margin-top:28px">About you</div>
  ${CONTRIBUTOR_FIELD}

  <button type="submit" class="btn-submit">Submit ontology gap →</button>
</form>`;
  return page('Report an ontology gap', 'Missing or misaligned terms across ORDO, HPO, ICD, SNOMED, Mondo and others', body, landingPage);
}

// ── Form: data / model gap ───────────────────────────────────────────────────

function formDataGap(landingPage) {
  const standards = {
    'Exchange formats & data models': [
      'Phenopackets (GA4GH)',
      'FHIR (HL7) — core resources',
      'FHIR — Genomics Reporting IG',
      'OMOP CDM',
      'openEHR',
    ],
    'International rare disease platforms': [
      'RD-Connect / GPAP',
      'EUPID (European Platform for Rare Disease Registries)',
      'EPIRARE',
      'ERDRI (European Rare Disease Registry Infrastructure)',
      'ERN (European Reference Network) registry',
    ],
    'National & disease-specific registries': [
      'IAMRARE (Global Genes / NORD)',
      'RARE-X patient registry',
      'ALS TDI Registry',
      'PhenoDB',
      'DECIPHER',
      'NORD Patient Registry',
    ],
    'Ontology-adjacent data models': [
      'Orphanet data model (ORDO / clinical entity structure)',
      'GA4GH Variant Representation Specification (VRS)',
      'GA4GH Pedigree Standard',
    ],
  };
  const categories = {
    'Temporal / longitudinal': [
      'Longitudinal / trajectory data — change over time',
      'Disease progression rate or slope',
      'Age of onset / diagnostic delay',
      'Time from symptom to diagnosis (diagnostic odyssey duration)',
    ],
    'Patient experience': [
      'Patient-reported outcomes (PROs) not linkable to clinical terms',
      'Quality of life / functional status / disability',
      'Caregiver or family impact',
      'Patient-reported diagnostic odyssey narrative',
    ],
    'Clinical data elements': [
      'Diagnostic uncertainty or evolving diagnosis',
      'Treatment response / lack of response',
      'Off-label or compassionate use therapies',
      'Imaging findings not mapped to structured terms',
      'Biomarker / lab result without standard code',
    ],
    'Structural / interoperability': [
      'Cross-registry linkage — same patient in multiple registries',
      'Cross-border data harmonisation',
      'Rare disease not representable in ICD-10 (too granular)',
      'Social determinants of health',
      'Environmental / exposure history',
      'Genetic variant — phenotype correlation not capturable',
    ],
    'Rare disease specific': [
      'Ultra-rare disease — model too coarse (<10 known cases)',
      'Natural history data missing (disease too rare)',
      'No validated outcome measure exists for this disease',
    ],
  };

  const renderGroup = (groups) => Object.entries(groups).map(([heading, items]) => `
    <div class="cb-subhead">${heading}</div>
    ${items.map(i => `<label><input type="checkbox" name="${heading.toLowerCase().replace(/\W+/g,'_')}_items" value="${i}"> ${i}</label>`).join('\n    ')}
  `).join('');

  const body = `
<div class="notice">
  Flag structural or coverage gaps in data models, registries, or standards.
  For missing <em>ontology terms</em> use the ontology gap form. No GitHub account needed.
</div>

<form method="POST" action="/submit">
  ${HONEYPOT}
  <input type="hidden" name="form_type" value="data-gap">

  <div class="section-title">Disease context</div>
  <div class="field">
    <label>Disease name <span style="font-weight:400;color:var(--muted)">(if disease-specific)</span></label>
    <input type="text" name="disease_name" placeholder="e.g. ALS, Stargardt — or leave blank for cross-disease gap">
  </div>
  ${DISEASE_ID_FIELD}

  <div class="section-title" style="margin-top:28px">Affected standard or system <span class="req">*</span></div>
  <div class="field">
    <div class="cb-group">
      ${renderGroup(standards)}
      <div class="cb-subhead">Other</div>
      <label><input type="checkbox" name="standard_other_items" value="Other / multiple not listed"> Other / multiple not listed</label>
    </div>
  </div>

  <div class="section-title" style="margin-top:28px">Describing the gap</div>

  <div class="field">
    <label>What cannot be captured and why? <span class="req">*</span></label>
    <textarea name="gap_description" rows="5" required
      placeholder="I am trying to represent: …&#10;The current model handles this by: …&#10;What is lost: …"></textarea>
  </div>

  <div class="section-title" style="margin-top:28px">Category of gap</div>
  <div class="field">
    <div class="cb-group">
      ${renderGroup(categories)}
      <div class="cb-subhead">Other</div>
      <label><input type="checkbox" name="other_items" value="Other"> Other</label>
    </div>
  </div>

  <div class="field">
    <label>Proposed solution or workaround <span style="font-weight:400;color:var(--muted)">(optional)</span></label>
    <textarea name="proposed_solution" rows="3"
      placeholder="e.g. Add a Measurement element with LOINC code for ALSFRS-R total score…"></textarea>
  </div>
  <div class="field">
    <label>Priority</label>
    <select name="priority">
      <option value="">— select —</option>
      <option>Critical — blocks meaningful data sharing or cross-registry linkage</option>
      <option>High — significant information loss; no good workaround</option>
      <option>Medium — workarounds exist but introduce ambiguity</option>
      <option>Low — minor nuance lost; workarounds adequate</option>
    </select>
  </div>
  <div class="field">
    <label>Evidence or prior discussion <span style="font-weight:400;color:var(--muted)">(optional)</span></label>
    <textarea name="evidence" rows="2"
      placeholder="Links to papers, GitHub issues, working group outputs…"></textarea>
  </div>

  <div class="section-title" style="margin-top:28px">About you</div>
  ${CONTRIBUTOR_FIELD}

  <button type="submit" class="btn-submit">Submit data gap →</button>
</form>`;
  return page('Report a data / model gap', 'Gaps in Phenopackets, FHIR, OMOP, rare disease registries, and exchange standards', body, landingPage);
}

// ── Form: form feedback ──────────────────────────────────────────────────────

function formFeedback(landingPage) {
  const body = `
<div class="notice">
  These forms are a living instrument. Tell us what is missing, wrong, or confusing —
  or propose an entirely new form. No GitHub account needed.
</div>

<form method="POST" action="/submit">
  ${HONEYPOT}
  <input type="hidden" name="form_type" value="form-feedback">

  <div class="section-title">Which form does this apply to? <span class="req">*</span></div>
  <div class="field">
    <div class="cb-group">
      ${[
        '01 — Submit a disease case',
        '02 — Report an ontology gap',
        '03 — Report a data / model gap',
        'All forms (applies across the board)',
        'None — I am proposing a new form',
      ].map(o => `<label><input type="checkbox" name="target_form" value="${o}"> ${o}</label>`).join('\n      ')}
    </div>
  </div>

  <div class="section-title" style="margin-top:28px">Type of feedback <span class="req">*</span></div>
  <div class="field">
    <div class="cb-group">
      ${[
        'Missing field — something important cannot be captured at all',
        'Field is incomplete — options or scope are too narrow',
        'Field is wrong — incorrect framing, label, or assumption',
        'Field is confusing — wording unclear',
        'Ontology or standard missing from a list',
        'Too many fields — form is overwhelming',
        'Proposing a new form entirely',
        'Other',
      ].map(o => `<label><input type="checkbox" name="feedback_type" value="${o}"> ${o}</label>`).join('\n      ')}
    </div>
  </div>

  <div class="section-title" style="margin-top:28px">Your perspective</div>
  <div class="field">
    <div class="cb-group">
      ${[
        'Clinician / physician', 'Clinical geneticist', 'Genetic counsellor',
        'Nurse / allied health professional', 'Patient or family member / carer',
        'Patient advocacy organisation', 'Rare disease registry manager',
        'Biomedical informatician / data engineer', 'Ontologist / terminology expert',
        'Researcher / scientist', 'Bioinformatician / computational biologist',
        'Software developer / data architect', 'Other',
      ].map(o => `<label><input type="checkbox" name="perspective" value="${o}"> ${o}</label>`).join('\n      ')}
    </div>
  </div>

  <div class="section-title" style="margin-top:28px">Your feedback</div>

  <div class="field">
    <label>What is missing, wrong, or confusing? <span class="req">*</span></label>
    <textarea name="what_is_wrong" rows="5" required
      placeholder="The disease case form has no field for:&#10;  - Whether the disease has a known genetic cause&#10;  - Estimated global prevalence&#10;…"></textarea>
  </div>
  <div class="field">
    <label>Proposed fix or new field(s) <span style="font-weight:400;color:var(--muted)">(optional)</span></label>
    <textarea name="proposed_fix" rows="4"
      placeholder="Add field: 'Genetic basis'&#10;Type: dropdown&#10;Options: Monogenic, Polygenic, Chromosomal, Mitochondrial, Unknown…"></textarea>
  </div>

  <div class="section-title" style="margin-top:28px">Proposing a new form? (optional)</div>
  <div class="field">
    <label>Working title for the new form</label>
    <input type="text" name="new_form_title"
      placeholder="e.g. Submit a natural history study · Flag a missing patient registry">
  </div>
  <div class="field">
    <label>What aspect of rare disease would it capture?</label>
    <textarea name="new_form_purpose" rows="4"
      placeholder="Who: …&#10;Purpose: …&#10;Key fields it would need: …"></textarea>
  </div>

  <div class="section-title" style="margin-top:28px">About you</div>
  ${CONTRIBUTOR_FIELD}

  <button type="submit" class="btn-submit">Submit feedback →</button>
</form>`;
  return page('Feedback on these forms', 'Missing fields, wrong framing, or a proposal for an entirely new form', body, landingPage);
}

// ── Issue body builders ──────────────────────────────────────────────────────

function multiVal(fd, name) {
  return fd.getAll(name).filter(Boolean);
}

function section(heading, value) {
  if (!value || (Array.isArray(value) && value.length === 0)) return '';
  const content = Array.isArray(value) ? value.map(v => `- ${v}`).join('\n') : value;
  return `\n### ${heading}\n${content}\n`;
}

function buildIssueDiseaseCase(fd) {
  const title = `[CASE] ${fd.get('disease_name') || 'Unnamed disease'}`;
  const body = [
    section('Disease name', fd.get('disease_name')),
    section('Disease identifiers', fd.get('disease_ids')),
    section('Registry or data source', fd.get('registry')),
    section('Registry URL', fd.get('registry_url')),
    section('Disease narrative', fd.get('narrative')),
    section('Key timeline events', fd.get('timeline_events')),
    section('Data types collected', multiVal(fd, 'data_types')),
    section('HPO phenotype terms', fd.get('hpo_terms')),
    section('Clinical nuance lost in structured encoding', fd.get('narrative_gaps')),
    section('Information that should be collected but is not', fd.get('missing_data')),
    section('Contributor', fd.get('contributor')),
    '\n---\n_Submitted via BYOD web form (no GitHub account required)_',
  ].join('');
  return { title, body, labels: ['disease-case', 'needs-mapping'] };
}

function buildIssueOntologyGap(fd) {
  const disease = fd.get('disease_name') || 'unspecified';
  const title = `[GAP-ONTOLOGY] ${disease}`;
  // Collect all checkbox groups
  const ontology = multiVal(fd, 'ontology');
  const crossOntology = fd.get('cross_ontology') === 'yes';
  const body = [
    section('Disease name', fd.get('disease_name')),
    section('Disease identifiers', fd.get('disease_ids')),
    section('Ontology / terminology with the gap', ontology),
    crossOntology ? section('Cross-ontology gap', 'Yes — concept exists in one ontology but missing or misaligned in another') : '',
    crossOntology ? section('Cross-ontology detail', fd.get('cross_ontology_detail')) : '',
    section('Clinical concept that cannot be expressed', fd.get('concept')),
    section('Type of gap', fd.get('gap_type')),
    section('Concrete clinical examples', fd.get('concrete_examples')),
    section('Proposed solution', fd.get('proposed_solution')),
    section('Priority', fd.get('priority')),
    section('Contributor', fd.get('contributor')),
    '\n---\n_Submitted via BYOD web form (no GitHub account required)_',
  ].join('');
  return { title, body, labels: ['ontology-gap'] };
}

function buildIssueDataGap(fd) {
  const disease = fd.get('disease_name') || 'unspecified';
  const title = `[GAP-DATA] ${disease}`;
  // Collect all standard/category checkbox groups (dynamic names)
  const allKeys = [...fd.keys()];
  const standardKeys = allKeys.filter(k => k.endsWith('_items') && !k.startsWith('other'));
  const categoryKeys = allKeys.filter(k => k.endsWith('_items') && k.startsWith('other') === false && standardKeys.includes(k) === false);
  const allStandards = standardKeys.flatMap(k => multiVal(fd, k));
  const allCategories = [...new Set(allKeys
    .filter(k => k.includes('_items'))
    .filter(k => !standardKeys.includes(k))
    .flatMap(k => multiVal(fd, k))
  )];

  const body = [
    section('Disease name', fd.get('disease_name')),
    section('Disease identifiers', fd.get('disease_ids')),
    section('Affected standards / systems', allStandards.length ? allStandards : multiVal(fd, 'standard_other_items')),
    section('What cannot be captured and why', fd.get('gap_description')),
    section('Category of gap', allCategories.length ? allCategories : multiVal(fd, 'other_items')),
    section('Proposed solution', fd.get('proposed_solution')),
    section('Priority', fd.get('priority')),
    section('Evidence / prior discussion', fd.get('evidence')),
    section('Contributor', fd.get('contributor')),
    '\n---\n_Submitted via BYOD web form (no GitHub account required)_',
  ].join('');
  return { title, body, labels: ['data-gap'] };
}

function buildIssueFormFeedback(fd) {
  const title = `[FORM] ${fd.get('new_form_title') || 'Form feedback'}`;
  const body = [
    section('Target form(s)', multiVal(fd, 'target_form')),
    section('Type of feedback', multiVal(fd, 'feedback_type')),
    section('Perspective', multiVal(fd, 'perspective')),
    section('What is missing, wrong, or confusing', fd.get('what_is_wrong')),
    section('Proposed fix', fd.get('proposed_fix')),
    section('New form — working title', fd.get('new_form_title')),
    section('New form — purpose', fd.get('new_form_purpose')),
    section('Contributor', fd.get('contributor')),
    '\n---\n_Submitted via BYOD web form (no GitHub account required)_',
  ].join('');
  return { title, body, labels: ['form-feedback', 'meta'] };
}

// ── Submit handler ───────────────────────────────────────────────────────────

async function handleSubmit(request, env) {
  const landingPage = env.LANDING_PAGE || '/';

  let fd;
  try {
    fd = await request.formData();
  } catch {
    return htmlResponse(errorPage('Could not read form data.', landingPage));
  }

  // Honeypot — silent drop if filled (bot)
  if (fd.get('h_confirm')) {
    return htmlResponse(thankyouPage(null, landingPage));
  }

  const formType = fd.get('form_type');
  let issue;
  if      (formType === 'disease-case')  issue = buildIssueDiseaseCase(fd);
  else if (formType === 'ontology-gap')  issue = buildIssueOntologyGap(fd);
  else if (formType === 'data-gap')      issue = buildIssueDataGap(fd);
  else if (formType === 'form-feedback') issue = buildIssueFormFeedback(fd);
  else return htmlResponse(errorPage('Unknown form type.', landingPage));

  if (!env.GITHUB_TOKEN) {
    return htmlResponse(errorPage('Server is not configured (missing GITHUB_TOKEN secret).', landingPage));
  }

  const resp = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO}/issues`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'byod-form-receiver/1.0',
      },
      body: JSON.stringify(issue),
    }
  );

  if (!resp.ok) {
    const msg = await resp.text();
    console.error('GitHub API error', resp.status, msg);
    return htmlResponse(errorPage(`GitHub API returned ${resp.status}. Please try again or contact a session organiser.`, landingPage));
  }

  const created = await resp.json();
  return htmlResponse(thankyouPage(created.html_url, landingPage));
}

// ── Thank-you & error pages ──────────────────────────────────────────────────

function thankyouPage(issueUrl, landingPage) {
  const issueLink = issueUrl
    ? `<p>Your submission is publicly visible at:<br>
       <a href="${issueUrl}" target="_blank" rel="noopener">${issueUrl}</a></p>`
    : '';
  return `<!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Submitted — Bring Your Own Disease</title>
    <style>${CSS}</style></head><body>
    <div class="thankyou">
      <div class="icon">✅</div>
      <h1>Thank you!</h1>
      <p>Your contribution has been received and added to the session repository.</p>
      ${issueLink}
      <p style="margin-top:12px;font-size:13px;color:var(--muted)">
        The session team will review and convert it to FAIR data.
      </p>
      <a class="btn-back" href="${landingPage}">← Back to session page</a>
    </div>
  </body></html>`;
}

function errorPage(msg, landingPage) {
  return `<!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Error — Bring Your Own Disease</title>
    <style>${CSS}</style></head><body>
    <div class="thankyou">
      <div class="icon">⚠️</div>
      <h1>Something went wrong</h1>
      <div class="error-box">${msg}</div>
      <a class="btn-back" href="${landingPage}">← Back to session page</a>
    </div>
  </body></html>`;
}

function htmlResponse(html, status = 200) {
  return new Response(html, { status, headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}

// ── Router ───────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const landing = env.LANDING_PAGE || '/';

    if (request.method === 'POST' && path === '/submit') {
      return handleSubmit(request, env);
    }

    if (request.method === 'GET') {
      if (path === '/forms/disease-case')  return htmlResponse(formDiseaseCase(landing));
      if (path === '/forms/ontology-gap')  return htmlResponse(formOntologyGap(landing));
      if (path === '/forms/data-gap')      return htmlResponse(formDataGap(landing));
      if (path === '/forms/form-feedback') return htmlResponse(formFeedback(landing));
      if (path === '/' || path === '')     return Response.redirect(landing, 302);
    }

    return new Response('Not found', { status: 404 });
  },
};
