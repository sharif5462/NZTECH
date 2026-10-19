import { AIAnalysisResult } from "@/types";

export interface CandidateAnalysisInput {
  jobTitle: string;
  department: string;
  experienceLevel: string;
  requiredSkills: string;
  jobDescription: string;
  candidateName: string;
  experienceYears: number;
  resumeText: string;
}

// Common tech synonyms and normalization
const SYNONYM_MAP: Record<string, string[]> = {
  javascript: ["js", "es6", "ecmascript"],
  typescript: ["ts"],
  react: ["reactjs", "react.js", "nextjs", "next.js"],
  vue: ["vuejs", "vue.js", "nuxt"],
  angular: ["angularjs"],
  node: ["nodejs", "node.js", "express", "expressjs"],
  python: ["django", "fastapi", "flask"],
  csharp: ["c#", ".net", "dotnet", "asp.net"],
  golang: ["go", "golang"],
  postgresql: ["postgres", "psql", "sql"],
  mongodb: ["mongo", "nosql"],
  docker: ["container", "containers", "containerization"],
  kubernetes: ["k8s", "orchestration"],
  aws: ["amazon web services", "cloud", "ec2", "s3", "lambda"],
  azure: ["microsoft azure"],
  gcp: ["google cloud"],
  ci_cd: ["cicd", "github actions", "gitlab ci", "jenkins"],
  graphql: ["apollo"],
  rest: ["restful", "apis", "api"],
};

/**
 * Normalizes text to lowercase and strips non-alphanumeric punctuation
 */
function cleanText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9#+.]/g, " ");
}

/**
 * Checks if a skill is present in text either directly or through known synonyms
 */
function isSkillPresent(skill: string, normalizedText: string): boolean {
  const cleanSkill = skill.trim().toLowerCase();
  if (!cleanSkill) return false;

  // Direct word boundary match
  const directRegex = new RegExp(`\\b${cleanSkill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  if (directRegex.test(normalizedText)) {
    return true;
  }

  // Synonym check
  for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
    if (cleanSkill === key || synonyms.includes(cleanSkill)) {
      if (new RegExp(`\\b${key}\\b`, "i").test(normalizedText)) return true;
      for (const syn of synonyms) {
        if (new RegExp(`\\b${syn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(normalizedText)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Generates tailored interview questions targeting missing skills and candidate background
 */
function generateQuestions(
  missingSkills: string[],
  matchedSkills: string[],
  jobTitle: string,
  expYears: number
): string[] {
  const questions: string[] = [];

  // Question targeting highest priority missing skill
  if (missingSkills.length > 0) {
    questions.push(
      `We noticed ${missingSkills.slice(0, 2).join(" & ")} is required for this ${jobTitle} role. How quickly have you adapted to similar technologies in past projects?`
    );
    if (missingSkills.length > 2) {
      questions.push(
        `Can you share an experience where you had to quickly ramp up on ${missingSkills[2]} or an equivalent stack under tight project deadlines?`
      );
    }
  }

  // Question targeting primary matched skill
  if (matchedSkills.length > 0) {
    questions.push(
      `You listed significant experience with ${matchedSkills[0]}. What is the most architecturally complex challenge you've resolved using ${matchedSkills[0]}?`
    );
  }

  // Architecture & system design question based on experience
  if (expYears >= 5) {
    questions.push(
      "How do you design high-availability backend services to ensure graceful degradation and fault tolerance during peak traffic?"
    );
  } else {
    questions.push(
      "Walk us through how you trace and debug a silent failure or race condition across asynchronous API calls."
    );
  }

  return questions;
}

/**
 * Local deterministic NLP Heuristic Matching Engine
 */
export function analyzeCandidateLocally(input: CandidateAnalysisInput): AIAnalysisResult {
  const rawSkills = input.requiredSkills
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const normalizedResume = cleanText(input.resumeText);

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of rawSkills) {
    if (isSkillPresent(skill, normalizedResume)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  // 1. Skill Match Percentage (50% of total score)
  const skillRatio = rawSkills.length > 0 ? matchedSkills.length / rawSkills.length : 1;
  const skillScore = skillRatio * 50;

  // 2. Experience Level Evaluation (25% of total score)
  let expectedYears = 2;
  if (input.experienceLevel.toLowerCase().includes("senior")) expectedYears = 5;
  else if (input.experienceLevel.toLowerCase().includes("lead")) expectedYears = 7;
  else if (input.experienceLevel.toLowerCase().includes("mid")) expectedYears = 3;

  const expRatio = Math.min(input.experienceYears / Math.max(expectedYears, 1), 1.2);
  const expScore = Math.min(expRatio * 25, 25);

  // 3. Keyword / Depth Density (25% of total score)
  const resumeWordCount = input.resumeText.split(/\s+/).filter(Boolean).length;
  const densityScore =
    resumeWordCount >= 15
      ? Math.min(15 + (resumeWordCount / 80) * 10, 25)
      : (resumeWordCount / 15) * 15;

  const rawTotal = Math.round(skillScore + expScore + densityScore);
  const finalScore = Math.max(15, Math.min(98, rawTotal)); // Clamped between 15% and 98%

  let matchLevel: "HIGH_MATCH" | "MODERATE_MATCH" | "LOW_MATCH" = "MODERATE_MATCH";
  if (finalScore >= 78) matchLevel = "HIGH_MATCH";
  else if (finalScore < 55) matchLevel = "LOW_MATCH";

  const expSummary =
    input.experienceYears >= expectedYears
      ? `Meets the expected seniority benchmark with ${input.experienceYears} verified years of experience.`
      : `Currently has ${input.experienceYears} years, which is below the target ${expectedYears} years for a ${input.experienceLevel} tier.`;

  const summary = `${input.candidateName} demonstrates a ${matchLevel.toLowerCase().replace("_", " ")} for the ${
    input.jobTitle
  } position. The candidate matched ${matchedSkills.length} out of ${
    rawSkills.length
  } key technical requirements. ${expSummary}`;

  const recommendedQuestions = generateQuestions(
    missingSkills,
    matchedSkills,
    input.jobTitle,
    input.experienceYears
  );

  return {
    score: finalScore,
    matchLevel,
    summary,
    matchedSkills,
    missingSkills,
    recommendedQuestions,
    experienceEvaluation: expSummary,
  };
}

/**
 * Evaluates candidate using Gemini LLM if key is configured, otherwise falls back to local NLP
 */
export async function analyzeCandidateWithAI(
  input: CandidateAnalysisInput
): Promise<AIAnalysisResult> {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    // Graceful offline fallback
    return analyzeCandidateLocally(input);
  }

  try {
    const prompt = `You are an expert technical recruiter and talent evaluation engine for software engineering.
Analyze the candidate's resume against the specified job requirements.

Job Title: ${input.jobTitle}
Department: ${input.department}
Seniority: ${input.experienceLevel}
Required Skills: ${input.requiredSkills}
Job Description: ${input.jobDescription}

Candidate Profile:
Name: ${input.candidateName}
Years of Experience: ${input.experienceYears}
Resume Content:
${input.resumeText.slice(0, 3000)}

Respond ONLY with valid JSON in this exact structure:
{
  "score": <number between 0 and 100>,
  "matchLevel": <"HIGH_MATCH" | "MODERATE_MATCH" | "LOW_MATCH">,
  "summary": <string: 2-3 concise sentences evaluating candidate fit>,
  "matchedSkills": [<strings>],
  "missingSkills": [<strings>],
  "recommendedQuestions": [<3 to 4 tailored technical and behavioral interview questions>],
  "experienceEvaluation": <string: analysis of experience level>
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    if (!res.ok) {
      console.warn("Gemini API call failed, falling back to local NLP engine");
      return analyzeCandidateLocally(input);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return analyzeCandidateLocally(input);
    }

    const parsed = JSON.parse(candidateText) as AIAnalysisResult;
    return {
      score: Math.max(0, Math.min(100, Math.round(parsed.score))),
      matchLevel: parsed.matchLevel || "MODERATE_MATCH",
      summary: parsed.summary || "Candidate evaluation generated.",
      matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
      recommendedQuestions: Array.isArray(parsed.recommendedQuestions)
        ? parsed.recommendedQuestions
        : [],
      experienceEvaluation: parsed.experienceEvaluation || "Experience evaluated.",
    };
  } catch (err) {
    console.error("Error in AI analysis service:", err);
    return analyzeCandidateLocally(input);
  }
}
