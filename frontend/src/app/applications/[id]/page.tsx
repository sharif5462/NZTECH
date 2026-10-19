"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Mail,
  Phone,
  Briefcase,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Award,
  Send,
  MessageSquare,
  X,
  FileText,
  RotateCcw,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import ScoreGauge from "@/components/ScoreGauge";
import { ApplicationStatus } from "@/types";
import { getStageProgressPercentage } from "@/lib/workflow";
import { parseApiResponse } from "@/lib/apiHelper";

interface ApplicationDetail {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  experienceYears: number;
  resumeText: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  stageChangedAt: string;
  aiScore?: number;
  aiMatchLevel?: string;
  aiSummary?: string;
  aiMatchedSkills?: string;
  aiMissingSkills?: string;
  aiRecommendedQuestions?: string;
  aiEvaluatedAt?: string;
  compositeScore?: number;
  createdAt: string;
  job: {
    id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    experienceLevel: string;
    requiredSkills: string;
    description: string;
  };
  reviews: Array<{
    id: string;
    stage: string;
    technicalScore: number;
    communicationScore: number;
    cultureScore: number;
    overallScore: number;
    recommendation: string;
    comments: string;
    createdAt: string;
    reviewer: { id: string; name: string; role: string };
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    fromStatus?: string;
    toStatus?: string;
    details?: string;
    createdAt: string;
    actor?: { name: string; role: string };
  }>;
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Analysis Trigger
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Status Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<ApplicationStatus>("SCREENING");
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    stage: "TECHNICAL",
    technicalScore: 8,
    communicationScore: 8,
    cultureScore: 8,
    recommendation: "YES",
    comments: "",
  });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/applications/${id}`);
      const { ok, data, error: apiError } = await parseApiResponse(res);
      if (!ok) throw new Error(apiError || "Application not found");
      setApplication(data.application);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Run AI Resume Matching
  const handleRunAiEvaluation = async () => {
    setAiLoading(true);
    setAiMessage(null);
    try {
      const res = await fetch(`/api/applications/${id}/ai-match`, {
        method: "POST",
      });
      const { ok, error: apiError } = await parseApiResponse(res);
      if (!ok) throw new Error(apiError || "AI evaluation failed");
      setAiMessage("AI Analysis completed successfully!");
      await fetchApplication();
      setTimeout(() => setAiMessage(null), 3000);
    } catch (err: any) {
      alert(`AI Error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Status Transition submit
  const handleStatusTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusLoading(true);
    setStatusError(null);

    try {
      const res = await fetch(`/api/applications/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          rejectionReason: targetStatus === "REJECTED" ? rejectionReason : undefined,
          note: statusNote,
        }),
      });

      const { ok, error: apiError } = await parseApiResponse(res);
      if (!ok) throw new Error(apiError || "Status update failed");

      setStatusModalOpen(false);
      setRejectionReason("");
      setStatusNote("");
      await fetchApplication();
    } catch (err: any) {
      setStatusError(err.message);
    } finally {
      setStatusLoading(false);
    }
  };

  // Review Submit
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: id,
          ...reviewForm,
          technicalScore: Number(reviewForm.technicalScore),
          communicationScore: Number(reviewForm.communicationScore),
          cultureScore: Number(reviewForm.cultureScore),
        }),
      });

      const { ok, error: apiError } = await parseApiResponse(res);
      if (!ok) throw new Error(apiError || "Failed to submit review");

      setReviewModalOpen(false);
      setReviewForm({
        stage: "TECHNICAL",
        technicalScore: 8,
        communicationScore: 8,
        cultureScore: 8,
        recommendation: "YES",
        comments: "",
      });
      await fetchApplication();
    } catch (err: any) {
      setReviewError(err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center">
        <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading candidate evaluation...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-800">Application Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">{error}</p>
        <Link
          href="/applications"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Applications</span>
        </Link>
      </div>
    );
  }

  const parseSkillList = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return val.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const matchedSkills: string[] = parseSkillList(application.aiMatchedSkills || (application as any).matchedSkills);
  const missingSkills: string[] = parseSkillList(application.aiMissingSkills || (application as any).missingSkills);
  const recommendedQuestions: string[] = parseSkillList(
    application.aiRecommendedQuestions || (application as any).suggestedQuestions
  );

  const reviews = application.reviews || [];
  const auditLogs = application.auditLogs || [];
  const job = application.job || {
    id: (application as any).jobId || "",
    title: (application as any).jobTitle || "Engineering Position",
    department: (application as any).jobDepartment || "Core Engineering",
    location: "Auckland, New Zealand",
    type: "Full-time",
    experienceLevel: "Mid-Level",
    requiredSkills: "TypeScript, React, Node.js",
    description: "",
  };

  const progress = getStageProgressPercentage(application.status);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Pipeline</span>
        </Link>
        <span className="text-[11px] text-slate-400">
          Application ID: <span className="font-mono text-slate-600">{application.id.slice(0, 12)}</span>
        </span>
      </div>

      {/* Candidate Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-600/30">
              {application.candidateName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {application.candidateName}
                </h1>
                <StatusBadge status={application.status} size="md" />
              </div>

              <p className="text-sm text-indigo-600 font-semibold mt-0.5">
                Applied for {job.title} &bull; {job.department}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {application.candidateEmail}
                </span>
                {application.candidatePhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {application.candidatePhone}
                  </span>
                )}
                <span className="flex items-center gap-1 font-mono font-medium text-slate-700">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {application.experienceYears} Years Verified Exp
                </span>
              </div>
            </div>
          </div>

          {/* Quick External Links */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {application.portfolioUrl && (
              <a
                href={application.portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:border-indigo-300 flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Portfolio</span>
              </a>
            )}
            {application.githubUrl && (
              <a
                href={application.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:border-indigo-300 flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                <span>GitHub</span>
              </a>
            )}
            {application.linkedinUrl && (
              <a
                href={application.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:border-indigo-300 flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                <span>LinkedIn</span>
              </a>
            )}
          </div>
        </div>

        {/* Workflow State Machine Controls Bar */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Workflow Lifecycle Progress</span>
            <span className="font-mono text-slate-500 font-semibold">{progress}% Completed</span>
          </div>

          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                application.status === "REJECTED" ? "bg-rose-500" : "bg-indigo-600"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Action Buttons for Stage Transitions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setTargetStatus(
                    application.status === "APPLIED"
                      ? "SCREENING"
                      : application.status === "SCREENING"
                      ? "AI_ANALYZED"
                      : application.status === "AI_ANALYZED"
                      ? "INTERVIEW_SCHEDULED"
                      : application.status === "INTERVIEW_SCHEDULED"
                      ? "OFFER_EXTENDED"
                      : application.status === "OFFER_EXTENDED"
                      ? "HIRED"
                      : "SCREENING"
                  );
                  setStatusModalOpen(true);
                }}
                disabled={application.status === "HIRED"}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-40 flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Transition Stage</span>
              </button>

              {application.status !== "REJECTED" && (
                <button
                  onClick={() => {
                    setTargetStatus("REJECTED");
                    setStatusModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-semibold text-xs transition-colors"
                >
                  Reject Candidate
                </button>
              )}

              {application.status === "REJECTED" && (
                <button
                  onClick={() => {
                    setTargetStatus("SCREENING");
                    setStatusModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reopen Application (Admin)</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setReviewModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Award className="h-3.5 w-3.5" />
              <span>Record Interview Score</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: AI Evaluation & Composite Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Evaluation Module */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">AI Resume Matching Engine</h2>
                  <p className="text-xs text-slate-500">
                    Dual-mode Local NLP heuristics + Generative LLM evaluation
                  </p>
                </div>
              </div>

              <button
                onClick={handleRunAiEvaluation}
                disabled={aiLoading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all hover:scale-[1.02] disabled:opacity-50 self-start sm:self-auto"
              >
                <Sparkles className={`h-3.5 w-3.5 ${aiLoading ? "animate-spin" : ""}`} />
                <span>{aiLoading ? "Analyzing Qualifications..." : "Run AI Analysis"}</span>
              </button>
            </div>

            {aiMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{aiMessage}</span>
              </div>
            )}

            {application.aiScore !== null && application.aiScore !== undefined ? (
              <div className="space-y-4">
                {/* Score breakdown banner */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <ScoreGauge score={application.aiScore} label="AI Fit Rating" size="lg" />
                  </div>
                  <div className="text-left sm:text-right text-xs text-slate-500">
                    <p className="font-semibold text-slate-700">Seniority Alignment</p>
                    <p>{application.experienceYears} Years Candidate vs {job.experienceLevel} Tier</p>
                  </div>
                </div>

                {/* AI Executive Summary */}
                {application.aiSummary && (
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Executive Summary
                    </h3>
                    <p className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 leading-relaxed">
                      {application.aiSummary}
                    </p>
                  </div>
                )}

                {/* Skills Matched and Missing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-2">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Matched Skills ({matchedSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedSkills.length === 0 ? (
                        <span className="text-xs text-slate-400">None detected</span>
                      ) : (
                        matchedSkills.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-800 text-[11px] font-semibold shadow-2xs"
                          >
                            {s}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/40 space-y-2">
                    <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                      Missing / Gap Skills ({missingSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {missingSkills.length === 0 ? (
                        <span className="text-xs text-emerald-600 font-medium">All required skills matched!</span>
                      ) : (
                        missingSkills.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-md bg-white border border-rose-200 text-rose-800 text-[11px] font-semibold shadow-2xs"
                          >
                            {s}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Tailored Interview Questions */}
                {recommendedQuestions.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
                      Recommended Interview Questions (Generated by AI)
                    </h3>
                    <div className="space-y-2">
                      {recommendedQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-indigo-50/40 border border-indigo-100 text-xs text-slate-800 leading-relaxed"
                        >
                          <span className="font-bold text-indigo-700 mr-1.5">Q{idx + 1}:</span>
                          {q}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <Sparkles className="h-8 w-8 text-indigo-300 mx-auto" />
                <p className="text-xs text-slate-500">
                  This candidate has not been analyzed yet. Click &quot;Run AI Analysis&quot; above to generate match scores and tailored questions.
                </p>
              </div>
            )}
          </div>

          {/* Full Resume Text Viewer */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-900">Submitted Resume Text</h2>
            </div>
            <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {application.resumeText}
            </pre>
          </div>
        </div>

        {/* Right Col: Composite Score & Interview Reviews & Audit Trail */}
        <div className="space-y-6">
          {/* Composite Score Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Weighted Composite Score</h2>
            <ScoreGauge score={application.compositeScore} label="Overall Rating" size="lg" />

            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between text-slate-600">
                <span>AI Resume Fit (30%)</span>
                <span className="font-mono font-semibold">{application.aiScore ?? 0}%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Technical Interview (45%)</span>
                <span className="font-mono font-semibold">
                  {reviews.length > 0
                    ? `${(
                        (reviews.reduce((acc, r) => acc + (r.technicalScore || 0), 0) /
                          reviews.length) *
                        10
                      ).toFixed(0)}%`
                    : "Pending"}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Culture &amp; Soft Skills (25%)</span>
                <span className="font-mono font-semibold">
                  {reviews.length > 0
                    ? `${(
                        (reviews.reduce(
                          (acc, r) => acc + ((r.communicationScore || 0) + (r.cultureScore || 0)) / 2,
                          0
                        ) /
                          reviews.length) *
                        10
                      ).toFixed(0)}%`
                    : "Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Recorded Interview Reviews */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Interviewer Reviews ({reviews.length})
              </h2>
              <button
                onClick={() => setReviewModalOpen(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                + Add
              </button>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No interview reviews recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => {
                  const reviewerName = rev.reviewer?.name || (rev as any).reviewerName || "Alex Rivera";
                  const overall = rev.overallScore ?? (((rev.technicalScore || 0) + (rev.communicationScore || 0) + (rev.cultureScore || 0)) / 3).toFixed(1);
                  return (
                    <div key={rev.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{reviewerName}</span>
                        <span className="font-mono font-bold text-indigo-600">{overall}/10</span>
                      </div>

                      <div className="grid grid-cols-3 gap-1 text-[11px] font-mono text-slate-600">
                        <span>Tech: {rev.technicalScore}/10</span>
                        <span>Comm: {rev.communicationScore}/10</span>
                        <span>Cult: {rev.cultureScore}/10</span>
                      </div>

                      <p className="text-slate-600 italic">&quot;{rev.comments}&quot;</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Real-time Audit Trail */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Application Audit Trail</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No audit activity logged.</p>
              ) : (
                auditLogs.map((log) => {
                  const actorName = log.actor?.name || (log as any).actorName || "Recruiter";
                  const dateStr = log.createdAt || (log as any).timestamp;
                  const formattedTime = dateStr
                    ? new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : "Recent";
                  return (
                    <div key={log.id} className="text-xs border-l-2 border-indigo-200 pl-3 py-1 space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-700">{actorName}</span>
                        <span suppressHydrationWarning>{formattedTime}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-tight">
                        {log.details || `Transitioned candidate to ${log.toStatus}`}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Status Transition */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Transition Application Status</h3>
              <button
                onClick={() => setStatusModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {statusError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{statusError}</span>
              </div>
            )}

            <form onSubmit={handleStatusTransition} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">New Stage</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as ApplicationStatus)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="SCREENING">SCREENING</option>
                  <option value="AI_ANALYZED">AI_ANALYZED</option>
                  <option value="INTERVIEW_SCHEDULED">INTERVIEW_SCHEDULED</option>
                  <option value="OFFER_EXTENDED">OFFER_EXTENDED</option>
                  <option value="HIRED">HIRED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              {targetStatus === "REJECTED" && (
                <div>
                  <label className="text-xs font-semibold text-rose-700 block mb-1">
                    Compliance Rejection Reason * (Required)
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Document specific reason for rejection..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Internal Note (Optional)</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Cleared technical interview with Liam"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusLoading}
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50"
                >
                  {statusLoading ? "Updating..." : "Confirm Transition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Interview Review */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Record Interview Evaluation</h3>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {reviewError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Interview Stage</label>
                  <select
                    value={reviewForm.stage}
                    onChange={(e) => setReviewForm({ ...reviewForm, stage: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="SCREENING">Screening</option>
                    <option value="TECHNICAL">Technical Live Coding</option>
                    <option value="CULTURE_FIT">Culture &amp; Team Fit</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Recommendation</label>
                  <select
                    value={reviewForm.recommendation}
                    onChange={(e) => setReviewForm({ ...reviewForm, recommendation: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="STRONG_YES">Strong Yes (Top Tier)</option>
                    <option value="YES">Yes (Hire)</option>
                    <option value="HOLD">Hold (Review Others)</option>
                    <option value="NO">No (Do Not Hire)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Technical (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={reviewForm.technicalScore}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, technicalScore: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Communication (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={reviewForm.communicationScore}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, communicationScore: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Culture (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={reviewForm.cultureScore}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, cultureScore: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Interviewer Qualitative Notes *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewForm.comments}
                  onChange={(e) => setReviewForm({ ...reviewForm, comments: e.target.value })}
                  placeholder="Detail architecture problem solving, code cleanliness, and collaboration style..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm disabled:opacity-50"
                >
                  {reviewLoading ? "Saving..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
