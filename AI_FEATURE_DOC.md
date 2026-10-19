# AI / ML Feature Documentation: Smart Candidate Resume Matcher
> **Technical Specification: AI / ML Resume Analysis & Evaluation Engine**

---

## 1. Feature Overview & Purpose

Screening hundreds of technical resumes is often slow, subjective, and prone to human fatigue. 
The **Smart Candidate Resume Matcher** in HirePulse automatically extracts key technical proficiencies, evaluates experience seniority alignment, calculates a normalized match score (0-100%), detects specific technology skill gaps, and synthesizes tailored interview questions for hiring managers.

To guarantee **100% offline reliability for seamless local evaluation and zero-latency execution** while maintaining cutting-edge LLM capabilities, HirePulse features a **Dual-Mode AI Architecture**:
1. **Local Deterministic NLP Heuristic Matcher**: Zero-latency, fully offline rule & vector matching engine that requires no external API keys or network connection.
2. **Generative LLM Reasoning Engine (Google Gemini / OpenAI)**: Automatically activated if an API key is provided in `.env`, producing qualitative semantic evaluations.

---

## 2. Technical Specification

### A. Inputs
| Input Field | Data Type | Description |
| :--- | :--- | :--- |
| `jobTitle` | String | Target role title (e.g., "Senior Full Stack Developer"). |
| `department` | String | Organizational squad (e.g., "Core Engineering"). |
| `experienceLevel` | String | Target seniority tier ("Junior", "Mid-Level", "Senior", "Lead"). |
| `requiredSkills` | String | Comma-delimited list of primary requirements. |
| `jobDescription` | String | Full text of role responsibilities and qualifications. |
| `candidateName` | String | Candidate full name. |
| `experienceYears` | Float | Verified professional experience in years. |
| `resumeText` | String | Raw extracted resume text or portfolio summary. |

### B. Processing Logic & Algorithm (Local Engine)
The local engine operates in four stages:

1. **Text Normalization & Tokenization**:
   - Strips non-alphanumeric characters, converts to lowercase, and extracts word boundaries.
   - Applies an industry-standard technical **Synonym Dictionary**:
     - `React` &harr; `ReactJS`, `React.js`, `Next.js`
     - `Node` &harr; `Node.js`, `Express`, `ExpressJS`
     - `PostgreSQL` &harr; `Postgres`, `PSQL`, `SQL`
     - `TypeScript` &harr; `TS`
     - `Docker` &harr; `Containers`, `Containerization`
     - `Kubernetes` &harr; `K8s`

2. **Skill Overlap Scoring (50% Weight)**:
   $$\text{SkillRatio} = \frac{|\text{MatchedSkills}|}{|\text{RequiredSkills}|} \times 50$$

3. **Seniority & Experience Benchmark (25% Weight)**:
   - Target benchmark years: `Junior = 2`, `Mid = 3`, `Senior = 5`, `Lead = 7`.
   $$\text{ExpRatio} = \min\left(\frac{\text{CandidateYears}}{\text{TargetYears}}, 1.2\right) \times 25$$

4. **Depth & Density Analysis (25% Weight)**:
   - Evaluates technical vocabulary density across work chronology:
   $$\text{DensityScore} = \min\left(15 + \frac{\text{WordCount}}{80} \times 10, 25\right)$$

5. **Tailored Question Synthesis**:
   - Inspects the missing skills array (`missingSkills`) and candidate seniority.
   - Generates targeted behavioral questions probing how the candidate adapts to the missing stacks under tight deadlines.

### C. Outputs
| Output Field | Data Type | Sample Output |
| :--- | :--- | :--- |
| `score` | Integer (0-100) | `92` |
| `matchLevel` | Enum | `"HIGH_MATCH"` (&ge;78), `"MODERATE_MATCH"` (55-77), `"LOW_MATCH"` (<55) |
| `summary` | String | "Jordan Blake demonstrates a high match for Senior Full Stack Developer. Matched 6 of 6 skills..." |
| `matchedSkills` | Array&lt;String&gt; | `["TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "Next.js"]` |
| `missingSkills` | Array&lt;String&gt; | `[]` |
| `recommendedQuestions` | Array&lt;String&gt; | 3 customized architectural and behavioral questions. |

---

## 3. Known Limitations & Edge Cases

1. **Susceptibility to Keyword Stuffing**:
   - In pure heuristic mode, a candidate who lists an exhaustive glossary of keywords without context could achieve a high skill score.
   - *Mitigation in HirePulse*: The composite score balances AI resume match at only **30%**, with **45%** reserved for live technical coding interviews and **25%** for human culture reviews.

2. **Semantic Nuance & False Negatives**:
   - Candidates describing equivalent experience using non-standard phrasing may be flagged as missing skills.
   - *Mitigation*: Synonym mapping dictionary covers modern web frameworks and tools.

3. **Context Length**:
   - Extremely lengthy resumes are truncated at 3,000 characters when sent to the LLM endpoint to prevent token exhaustion.

---

## 4. Evaluation & Verification Methodology

The AI matching algorithm was validated using automated tests in `tests/aiMatcher.test.ts`:
- **Strong Senior Profile**: Tested against a 6.5-year engineer with complete stack coverage &rarr; Verified output score &ge; 80% (`HIGH_MATCH`).
- **Junior Gap Profile**: Tested against a 1-year developer missing cloud and distributed architecture skills &rarr; Verified output score &le; 60% (`LOW_MATCH`) with missing skills correctly identified and flagged in interview questions.
- **Unit Test Execution**: Runs deterministically in ~5ms as part of `npm test`.
