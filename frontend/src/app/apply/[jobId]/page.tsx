"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  UploadCloud,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experienceLevel: string;
  minSalary?: number;
  maxSalary?: number;
  currency: string;
  description: string;
  requiredSkills: string;
}

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    portfolioUrl: "",
    githubUrl: "",
    linkedinUrl: "",
    experienceYears: 4,
    resumeText: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/jobs/${jobId}`);
      if (!res.ok) throw new Error("Job position not found");
      const json = await res.json();
      setJob(json.job);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreFillSample = (seniority: "senior" | "junior") => {
    if (seniority === "senior") {
      setFormData({
        candidateName: "Elena Rostova",
        candidateEmail: "elena.rostova@techdev.nz",
        candidatePhone: "+64 21 773 9922",
        portfolioUrl: "https://elenarostova.dev",
        githubUrl: "https://github.com/elena-rostova",
        linkedinUrl: "https://linkedin.com/in/elena-rostova",
        experienceYears: 6.0,
        resumeText: `Elena Rostova - Senior Full Stack Software Engineer
6 years of professional software development experience specializing in TypeScript, React, Next.js, and Node.js.
Deep experience with PostgreSQL database schema optimization, indexing, and connection pooling.
Architected containerized microservices deployed via Docker and Kubernetes on AWS.
Led Agile development teams and automated end-to-end CI/CD release pipelines.
Key Tech: TypeScript, React, Node.js, PostgreSQL, Docker, Next.js, REST APIs, Redis, Jest, Vitest.`,
      });
    } else {
      setFormData({
        candidateName: "Sam Taylor",
        candidateEmail: "sam.taylor@uni.nz",
        candidatePhone: "+64 22 991 3344",
        portfolioUrl: "https://samtaylor.io",
        githubUrl: "https://github.com/samtaylor-dev",
        linkedinUrl: "",
        experienceYears: 1.5,
        resumeText: `Sam Taylor - Junior Developer
Recent Computer Science graduate with 1.5 years experience building web applications.
Familiar with JavaScript, React, HTML5, and CSS3. Basic exposure to Node.js and MongoDB.
Eager to learn modern cloud stacks and PostgreSQL.`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          ...formData,
          experienceYears: Number(formData.experienceYears),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setSubmitSuccess("Application submitted successfully!");
      setTimeout(() => {
        router.push(`/applications/${data.application.id}`);
      }, 1200);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading position details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-800">Position Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">{error}</p>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Jobs</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Positions</span>
      </Link>

      {/* Job Summary Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
            <p className="text-xs text-indigo-600 font-medium">{job.department}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            Open for Applications
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {job.type} &bull; {job.experienceLevel}
          </span>
          {job.minSalary && job.maxSalary && (
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <DollarSign className="h-3.5 w-3.5 text-slate-400" />
              {job.minSalary.toLocaleString()} - {job.maxSalary.toLocaleString()} {job.currency}
            </span>
          )}
        </div>

        <div className="pt-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Target Requirements
          </p>
          <div className="flex flex-wrap gap-1.5">
            {job.requiredSkills.split(",").map((s) => (
              <span
                key={s.trim()}
                className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium"
              >
                {s.trim()}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Submit Candidate Application</h2>
            <p className="text-xs text-slate-500">
              Fill in your details and resume. The AI engine will evaluate your qualifications.
            </p>
          </div>

          {/* Sample profile quick-fill for testing */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Sample Resume:</span>
            <button
              type="button"
              onClick={() => handlePreFillSample("senior")}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              Strong Fit (90%+)
            </button>
            <button
              type="button"
              onClick={() => handlePreFillSample("junior")}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              Junior Fit (~50%)
            </button>
          </div>
        </div>

        {submitError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {submitSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{submitSuccess} Redirecting to candidate review...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.candidateName}
                onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                placeholder="Elena Rostova"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.candidateEmail}
                onChange={(e) => setFormData({ ...formData, candidateEmail: e.target.value })}
                placeholder="elena.rostova@techdev.nz"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.candidatePhone}
                onChange={(e) => setFormData({ ...formData, candidatePhone: e.target.value })}
                placeholder="+64 21 000 0000"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Verified Years of Experience *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                required
                value={formData.experienceYears}
                onChange={(e) =>
                  setFormData({ ...formData, experienceYears: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Portfolio Website</label>
              <input
                type="url"
                value={formData.portfolioUrl}
                onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">GitHub Profile</label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">LinkedIn Profile</label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Resume Content / Work Experience Summary *
            </label>
            <textarea
              required
              rows={8}
              value={formData.resumeText}
              onChange={(e) => setFormData({ ...formData, resumeText: e.target.value })}
              placeholder="Paste complete resume, career chronology, tech skills, and key accomplishments here..."
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Link
              href="/jobs"
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {submitting ? (
                <span>Submitting Application...</span>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
