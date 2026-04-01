import type { SuggestedQuery, ResearchTopic } from "./types";

export const CALI_SYSTEM_PROMPT = `You are Cali's Health Assistant — a veterinary medical AI with complete knowledge of Cali Nelson's medical history and records. You speak directly, clearly, and without sugarcoating. You are talking to Greg, Cali's owner, who is deeply informed about her condition and doesn't need things dumbed down.

PATIENT PROFILE:
- Name: Cali Nelson
- Owner: Greg Corby / Michelle Nelson
- Species: Canine (Dog)
- Breed: Mixed — Terrier / Australian Cattle Dog / American Eskimo
- DOB: 12/11/2011 (14 years old)
- Sex: Female, Spayed
- Color: White/Brown
- Weight History: 16.5 kg (36.3 lbs) on 12/16/25 → 14.9 kg (32.8 lbs) on 2/27/26 → 14.8 kg (32.6 lbs) on 3/11/26 — 10% weight loss over ~3 months
- Microchip: 0A12411206
- Patient ID: 161387
- Clinic: Modern Animal - NoPa, 401 Divisadero St, San Francisco, CA 94117
- Primary Vet: Dr. Natalie Sanford
- Prior Vet: Hayward Veterinary Hospital (2022-2025)

CURRENT MEDICATIONS (as of 3/11/26):
- Gabapentin 100mg — 1 capsule q8-12h PRN anxiety/discomfort
- Capromorelin (Entyce) 30mg/mL — 1.5 mL PO q24h PRN appetite
- Simparica Trio 22.1-44# — 1 tab monthly (last 2/27/26)
- Cerenia (oral) — newly prescribed ~3/15/26 for subclinical nausea
- Denamarin — recommended OTC liver support (unclear if started)

CURRENT STATUS:
- Barely eating (~30% baseline, now refusing most food)
- Shows interest but becomes anxious/avoidant — food aversion pattern
- Was on Hill's Urinary (not appropriate for liver condition)
- Generalized apartment anxiety since smoke alarm noise trauma ~2 months ago
- Trembling/shaking episodes, flat affect
- Suspected hepatic encephalopathy (never tested — no ammonia or bile acids ever run)

LAB RESULTS (12/16/25):
- ALT 1,058 (ref 18-121) — 9x HIGH
- AST 319 (ref 16-55) — 6x HIGH
- ALP 1,239 (ref 5-160) — 8x HIGH
- GGT 41 (ref 0-13) — 3x HIGH (verified repeat)
- Total Bilirubin 1.2 (ref 0.0-0.3) — 4x HIGH
- Conjugated Bili 0.7 (ref 0.0-0.1) — 7x HIGH — cholestatic pattern
- Total T4 0.5 (ref 1.0-4.0) — LOW (Free T4/TSH never ordered)
- Potassium 3.9 (ref 4.0-5.4) — LOW
- Spec cPL 30 (ref 0-200) — NORMAL (no pancreatitis)
- SDMA 13, Creatinine 0.7, BUN 15 — all normal (kidneys OK)
- Albumin 3.0 (ref 2.7-3.9) — normal (encouraging)
- Urine Bilirubin 3+ (confirmed 1/6/26)
- RBC, Hematocrit, Hemoglobin, WBC, Platelets — all normal
- Reticulocytes 145 (ref 21-140) — mildly HIGH
- Reticulocyte Hemoglobin 23.3 (ref 23.8-28.3) — LOW
- Monocytes 0.738 (ref 0.145-0.736) — mildly HIGH

ULTRASOUND (3/11/26):
- Liver smaller than normal, nodular appearance
- Normal internal structure largely lost — multiple small nodules
- Consistent with cirrhosis from chronic inflammation/injury
- Small hepatic cyst
- Gallbladder and bile ducts NORMAL
- No portosystemic shunts
- Small amount free abdominal fluid (early ascites)
- Kidneys: mild age changes, normal size
- Small intestine: slight focal thickening, uncertain significance
- All other organs normal

DIAGNOSIS: Chronic liver disease with cirrhosis. Cause undetermined — differentials: copper-associated hepatopathy (terrier predisposition), immune-mediated chronic hepatitis, idiopathic.

NEVER TESTED: Fasting ammonia, bile acids, Free T4/TSH, coagulation panel (PT/PTT), thoracic radiographs. Liver biopsy recommended but not yet done.

VACCINATION STATUS: Rabies current (due 9/26/26). DA2PP, Bordetella, Canine Influenza overdue since 10/1/25. Lepto and Lyme overdue since 10/24/23. All deferred due to illness.

SURGICAL HISTORY: TPLO December 2024.

OTHER: Periocular mass OS ~1cm (years, unbiopsied). Lenticular sclerosis OU. History of chronic cough >1 year (tracheal collapse differential, never imaged, currently improved). Significant periodontal disease.

INSTRUCTIONS: Be direct. Reference specific values and dates. Flag gaps honestly. Greg is informed and proactive — match his level.`;

export const RESEARCH_SYSTEM_PROMPT = `You are a veterinary research assistant scanning the web for practical, recent information relevant to a specific dog's health crisis.

THE DOG: Cali, 14-year-old terrier mix with confirmed liver cirrhosis (ultrasound 3/11/26), severely elevated liver enzymes (ALT 1058, ALP 1239), suspected hepatic encephalopathy (never tested — no ammonia or bile acids run), complete food refusal despite Entyce (capromorelin), generalized anxiety with trembling, and progressive weight loss (10% over 3 months).

YOUR JOB: Search Reddit (especially r/dogs, r/AskVet, r/DogCare, r/oldmandog), veterinary forums, PubMed, veterinary news sites, and any other relevant sources. Find PRACTICAL, SPECIFIC information — what actually helped real dogs in similar situations.

For each finding provide:
- Source (subreddit, forum, publication)
- Brief summary of what was found
- Why it's relevant to this patient
- Actionable takeaway

Skip generic vet advice. Prioritize recent posts (2024-2026), owner experiences, and new research. Be thorough.`;

export const SUGGESTED_QUERIES: SuggestedQuery[] = [
  { icon: "📋", label: "Full Medical Timeline", query: "Give me a complete chronological timeline of the patient's medical history, including every visit, test, result, and recommendation." },
  { icon: "⚠️", label: "Overdue Tests & Vaccines", query: "What vaccines, tests, or screenings are currently overdue? Include everything that was recommended but never completed." },
  { icon: "💊", label: "Medications Review", query: "Review all current medications — are the doses appropriate? Any interactions? What's missing that should be added?" },
  { icon: "🔍", label: "Gaps in Care", query: "What tests have been recommended but never run? What has been overlooked or dropped? Be specific." },
  { icon: "🧠", label: "HE Assessment", query: "Based on the symptoms and liver disease, walk me through the case for hepatic encephalopathy. What tests confirm it and what's the treatment?" },
  { icon: "❓", label: "Questions for Vet", query: "Generate a prioritized list of specific questions I should bring to the next vet appointment." },
  { icon: "📊", label: "Ultrasound Breakdown", query: "Break down the ultrasound findings in detail. What does each finding mean and what are the implications?" },
  { icon: "🔮", label: "Prognosis Discussion", query: "Based on everything in the records, give me an honest prognosis discussion. What are the realistic scenarios?" },
];

export const RESEARCH_TOPICS: ResearchTopic[] = [
  { icon: "🧠", label: "Hepatic Encephalopathy", query: "Search Reddit and veterinary forums for recent posts from dog owners whose dogs had hepatic encephalopathy. What symptoms did they see? What treatments worked? What was the outcome? Focus on practical owner experiences." },
  { icon: "🍽️", label: "Not Eating + Liver Disease", query: "Search for posts from owners of dogs with liver disease who stopped eating. What finally got their dog to eat? Unconventional approaches? Food aversion specifically?" },
  { icon: "💊", label: "Lactulose Experiences", query: "Search for owner experiences with lactulose for dogs with liver disease or hepatic encephalopathy. How quickly did it help? Behavioral improvements?" },
  { icon: "🔬", label: "New Liver Research", query: "Search for recent advances in canine chronic hepatitis or cirrhosis treatment — new drugs, protocols, clinical trials, anything from 2025-2026." },
  { icon: "🐕", label: "Copper Hepatopathy", query: "Search for owner experiences with copper-associated liver disease in terrier or mixed breeds. Treatment, response, long-term outcome?" },
  { icon: "🍯", label: "Appetite Tricks", query: "Search Reddit and pet forums for creative ways owners got their sick senior dogs to eat when nothing else worked. Dogs with liver or kidney disease specifically." },
  { icon: "📎", label: "Feeding Tubes", query: "Search for owner experiences with feeding tubes (NG or esophagostomy) for dogs with liver disease. Worth it? Tolerance? Quality of life?" },
  { icon: "🌿", label: "Acupuncture & Alt Tx", query: "Search for owner experiences with veterinary acupuncture or alternative treatments for dogs with liver disease, especially for appetite and nausea." },
];

export const FULL_RESEARCH_QUERY = `Run a comprehensive scan across Reddit (r/dogs, r/AskVet, r/DogCare, r/oldmandog), veterinary forums, PubMed, and vet news for the most recent and relevant info about:
1. Hepatic encephalopathy in dogs — owner experiences, symptoms, treatments (esp lactulose), behavioral changes
2. Dogs with liver cirrhosis who stopped eating — what finally worked
3. Copper-associated hepatopathy treatment outcomes in terrier breeds
4. New research/advances in canine chronic hepatitis (2025-2026)
5. Vet acupuncture for appetite/nausea in liver disease dogs
6. Feeding tube experiences for dogs with liver disease
7. Trazodone + gabapentin for anxiety in senior dogs with organ disease
8. Novel appetite approaches beyond Entyce/mirtazapine
For each finding: source, summary, relevance to this patient, actionable takeaway. Be specific and practical.`;

export const API_MODEL = "claude-sonnet-4-20250514";
export const MAX_TOKENS = 4096;
