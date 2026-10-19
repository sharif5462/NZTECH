# Resume Matching & Candidate Evaluation Engine
> Technical Specification & Architectural Design

## 1. Overview & Objective

Manual resume screening in technical recruitment often creates operational bottlenecks and introduces subjective bias. The **HirePulse Resume Evaluation Engine** provides automated, objective qualification analysis by comparing incoming candidate profiles against structured job requisitions.

The engine evaluates technical skill overlap, seniority alignment, and vocabulary depth, generating a normalized fit score (0–100%) and targeted interview questions for hiring managers.

---

## 2. Architecture: Dual-Engine Topology

To maintain continuous availability without hard dependencies on third-party API quotas or network latency, the service utilizes a **two-tier evaluation architecture**:

1. **Deterministic Heuristic Engine (Default / Local)**:
   - High-throughput, zero-latency NLP pipeline executing entirely on the Node.js runtime.
   - Operates offline with zero external network overhead.
   - Evaluates token frequencies, canonical synonym trees, experience thresholds, and domain density.

2. **Generative Semantic Engine (Optional / Cloud)**:
   - Automatically engaged when a Gemini or OpenAI API key is supplied via environment configuration (`GEMINI_API_KEY`).
   - Generates nuanced qualitative summaries and dynamic architectural questions tailored to candidate career transitions.

---

## 3. Heuristic Scoring Algorithm & Formulation

The deterministic engine processes candidate profile text and structured inputs through four pipeline stages:

### A. Tokenization & Canonical Term Mapping
Raw resume text is normalized by stripping punctuation, standardizing casing, and passing terms through a technical synonym registry to resolve syntactic variations:

| Canonical Skill | Recognized Variations |
| :--- | :--- |
| **React** | `ReactJS`, `React.js`, `Next.js` |
| **Node.js** | `Node`, `Express`, `ExpressJS`, `NestJS` |
| **PostgreSQL** | `Postgres`, `PSQL`, `SQL`, `Relational DB` |
| **TypeScript** | `TS`, `Typed JavaScript` |
| **Docker** | `Containers`, `Containerization`, `Docker Compose` |
| **Kubernetes** | `K8s`, `Container Orchestration` |
| **Cloud Infrastructure**| `AWS`, `Azure`, `GCP`, `Cloud Computing` |

### B. Mathematical Weighting Breakdown

$$\text{Total Score} = \text{Skill Score} (50\%) + \text{Seniority Score} (25\%) + \text{Density Score} (25\%)$$

#### 1. Skill Overlap Ratio (50% Weight)
Measures the proportion of mandatory job skills satisfied by the candidate's verified proficiencies:

$$\text{SkillRatio} = \frac{|\text{MatchedSkills}|}{|\text{RequiredSkills}|} \times 50$$

#### 2. Seniority & Experience Benchmark (25% Weight)
Normalizes candidate professional years against target role tiers (`Junior = 2`, `Mid = 3`, `Senior = 5`, `Lead = 7`):

$$\text{ExpScore} = \min\left(\frac{\text{CandidateYears}}{\text{TargetBenchmarkYears}}, 1.2\right) \times 25$$

#### 3. Domain Density & Depth (25% Weight)
Measures vocabulary depth across the candidate's work chronology:

$$\text{DensityScore} = \min\left(15 + \frac{\text{TotalTokens}}{80} \times 10, 25\right)$$

---

## 4. Output Contract

The service outputs a structured evaluation payload consumed by the frontend and stored in the database:

```typescript
interface EvaluationResult {
  score: number;                   // Normalized integer between 0 and 100
  matchLevel: "HIGH_MATCH" | "MODERATE_MATCH" | "LOW_MATCH";
  summary: string;                 // Qualitative profile synthesis
  matchedSkills: string[];         // Identified matching competencies
  missingSkills: string[];         // Gaps against required qualifications
  recommendedQuestions: string[];  // Contextual technical & behavioral questions
}
```

---

## 5. Engineering Safeguards & Mitigations

* **Countering Keyword Stuffing**: Pure keyword parsing can be manipulated. In HirePulse, the AI resume score represents only **30%** of the composite decision metric. Final hiring decisions require **45%** technical coding performance and **25%** peer culture interview feedback.
* **Semantic Ambiguity**: Standardized synonym dictionaries eliminate false negatives caused by formatting differences (e.g., `Node` vs `Node.js`).
* **Deterministic Execution**: All heuristic calculations execute in <10ms and are validated by automated unit tests in `tests/aiMatcher.test.ts`.
