import { describe, it, expect } from "vitest";
import { analyzeCandidateLocally } from "@/lib/aiMatcher";

describe("AI Resume Matcher & NLP Heuristics", () => {
  it("matches candidate with high skill overlap and appropriate seniority", () => {
    const result = analyzeCandidateLocally({
      jobTitle: "Senior Full Stack Developer",
      department: "Core Engineering",
      experienceLevel: "Senior",
      requiredSkills: "TypeScript, React, Node.js, PostgreSQL, Docker",
      jobDescription: "Looking for an engineer to architect robust web applications.",
      candidateName: "Jordan Blake",
      experienceYears: 6.0,
      resumeText:
        "Senior developer with 6 years working extensively with TypeScript, ReactJS, Node.js, Postgres database, and Docker containerization.",
    });

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.matchLevel).toBe("HIGH_MATCH");
    expect(result.matchedSkills.length).toBeGreaterThanOrEqual(4);
    expect(result.recommendedQuestions.length).toBeGreaterThan(0);
  });

  it("identifies skill gaps when candidate lacks essential technologies", () => {
    const result = analyzeCandidateLocally({
      jobTitle: "Senior Cloud Architect",
      department: "Infrastructure",
      experienceLevel: "Senior",
      requiredSkills: "Kubernetes, Golang, AWS, Terraform",
      jobDescription: "Distributed systems architect.",
      candidateName: "Junior Web Dev",
      experienceYears: 1.5,
      resumeText: "Experienced with HTML, CSS, JavaScript, and PHP.",
    });

    expect(result.score).toBeLessThan(60);
    expect(result.matchLevel).toBe("LOW_MATCH");
    expect(result.missingSkills).toContain("Kubernetes");
    expect(result.missingSkills).toContain("Golang");
    expect(result.recommendedQuestions.some((q) => q.includes("Kubernetes"))).toBe(true);
  });
});
