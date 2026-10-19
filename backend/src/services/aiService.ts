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

export interface AIAnalysisResult {
  score: number;
  matchLevel: "HIGH_MATCH" | "MODERATE_MATCH" | "LOW_MATCH";
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  recommendedQuestions: string[];
}

const SYNONYM_MAP: Record<string, string[]> = {
  javascript: ["js", "es6", "ecmascript"],
  typescript: ["ts"],
  react: ["reactjs", "react.js", "nextjs", "next.js"],
  node: ["nodejs", "node.js", "express"],
  postgresql: ["postgres", "psql", "sql"],
  docker: ["container", "containers"],
  kubernetes: ["k8s"],
  aws: ["cloud", "s3", "ec2"],
  rest: ["restful", "api", "apis"],
};

function cleanText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9#+.]/g, " ");
}

function isSkillPresent(skill: string, normalizedText: string): boolean {
  const clean = skill.trim().toLowerCase();
  if (!clean) return false;

  const directRegex = new RegExp(`\\b${clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  if (directRegex.test(normalizedText)) return true;

  for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
    if (clean === key || synonyms.includes(clean)) {
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

export function analyzeCandidateLocally(input: CandidateAnalysisInput): AIAnalysisResult {
  const rawSkills = input.requiredSkills
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const normalized = cleanText(input.resumeText);

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const s of rawSkills) {
    if (isSkillPresent(s, normalized)) matchedSkills.push(s);
    else missingSkills.push(s);
  }

  const skillRatio = rawSkills.length > 0 ? matchedSkills.length / rawSkills.length : 1;
  const skillScore = skillRatio * 50;

  let expectedYears = 2;
  if (input.experienceLevel.toLowerCase().includes("senior")) expectedYears = 5;
  else if (input.experienceLevel.toLowerCase().includes("lead")) expectedYears = 7;
  else if (input.experienceLevel.toLowerCase().includes("mid")) expectedYears = 3;

  const expRatio = Math.min(input.experienceYears / Math.max(expectedYears, 1), 1.2);
  const expScore = Math.min(expRatio * 25, 25);

  const resumeWordCount = input.resumeText.split(/\s+/).filter(Boolean).length;
  const densityScore = resumeWordCount >= 15 ? Math.min(15 + (resumeWordCount / 80) * 10, 25) : 10;

  const finalScore = Math.max(15, Math.min(98, Math.round(skillScore + expScore + densityScore)));

  let matchLevel: "HIGH_MATCH" | "MODERATE_MATCH" | "LOW_MATCH" = "MODERATE_MATCH";
  if (finalScore >= 78) matchLevel = "HIGH_MATCH";
  else if (finalScore < 55) matchLevel = "LOW_MATCH";

  const summary = `${input.candidateName} demonstrates a ${matchLevel.toLowerCase().replace("_", " ")} for ${input.jobTitle}. Matched ${matchedSkills.length}/${rawSkills.length} required skills.`;

  const recommendedQuestions: string[] = [];
  if (missingSkills.length > 0) {
    recommendedQuestions.push(`How quickly have you adapted to ${missingSkills[0]} in past projects?`);
  }
  if (matchedSkills.length > 0) {
    recommendedQuestions.push(`What is the most complex architecture challenge you resolved using ${matchedSkills[0]}?`);
  }
  recommendedQuestions.push("Walk us through how you trace and debug performance bottlenecks in high-concurrency APIs.");

  return {
    score: finalScore,
    matchLevel,
    summary,
    matchedSkills,
    missingSkills,
    recommendedQuestions,
  };
}
