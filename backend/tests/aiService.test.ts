import { describe, it, expect } from "vitest";
import { analyzeCandidateLocally } from "../src/services/aiService";

describe("Resume Matching Engine (aiService)", () => {
  it("should detect technical skills using canonical synonym mappings", () => {
    const analysis = analyzeCandidateLocally({
      jobTitle: "Senior Full Stack Engineer",
      department: "Engineering",
      experienceLevel: "Senior",
      requiredSkills: "React, Node.js, PostgreSQL, Docker",
      jobDescription: "Build distributed microservices with scalable UI architecture.",
      candidateName: "Sharif Developer",
      experienceYears: 6,
      resumeText: `
        Senior software engineer with 6 years of experience building web applications.
        Extensive experience with Next.js, Node, Postgres, Docker containers, and TypeScript.
        Architected cloud APIs and deployed on modern infrastructure.
      `,
    });

    expect(analysis.score).toBeGreaterThanOrEqual(75);
    expect(analysis.matchLevel).toBe("HIGH_MATCH");
    expect(analysis.matchedSkills).toContain("React");
    expect(analysis.matchedSkills).toContain("Node.js");
    expect(analysis.matchedSkills).toContain("PostgreSQL");
    expect(analysis.matchedSkills).toContain("Docker");
    expect(analysis.missingSkills.length).toBe(0);
    expect(analysis.recommendedQuestions.length).toBeGreaterThan(0);
  });

  it("should categorize low-alignment resumes as LOW_MATCH and identify missing skills", () => {
    const analysis = analyzeCandidateLocally({
      jobTitle: "DevOps Engineer",
      department: "Infrastructure",
      experienceLevel: "Senior",
      requiredSkills: "Kubernetes, Terraform, AWS, Docker",
      jobDescription: "Manage cloud clusters and automated CI/CD pipelines.",
      candidateName: "Junior Content Writer",
      experienceYears: 1,
      resumeText: "Experienced in digital copywriting, social media marketing, and blog curation.",
    });

    expect(analysis.score).toBeLessThan(55);
    expect(analysis.matchLevel).toBe("LOW_MATCH");
    expect(analysis.missingSkills).toContain("Kubernetes");
    expect(analysis.missingSkills).toContain("Terraform");
  });
});
