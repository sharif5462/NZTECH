"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  ArrowRight,
  Sparkles,
  Briefcase,
  AlertCircle,
  FileText,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import ScoreGauge from "@/components/ScoreGauge";
import { SkeletonTable } from "@/components/SkeletonLoader";
import { parseApiResponse } from "@/lib/apiHelper";

interface Application {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  experienceYears: number;
  status: string;
  aiScore?: number;
  compositeScore?: number;
  createdAt: string;
  job: {
    id: string;
    title: string;
    department: string;
  };
  _count: { reviews: number };
}

function ApplicationsContent() {
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("jobId") || "";

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [jobId, setJobId] = useState(initialJobId);
  const [sort, setSort] = useState("latest");

  useEffect(() => {
    fetchApplications();
  }, [search, status, jobId, sort]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (jobId) params.set("jobId", jobId);
      if (sort) params.set("sort", sort);

      const res = await fetch(`/api/applications?${params.toString()}`);
      const { ok, data, error: apiError } = await parseApiResponse(res);
      if (!ok) throw new Error(apiError || "Failed to load applications");
      setApplications(data.applications || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Candidate Pipeline</h1>
          <p className="text-xs text-slate-500">
            Review submissions, trigger AI matching, schedule interviews, and manage offer stages
          </p>
        </div>

        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-sm transition-colors self-start sm:self-auto"
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>Browse Positions</span>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates or keywords..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">All Pipeline Stages</option>
          <option value="APPLIED">Applied</option>
          <option value="SCREENING">Screening</option>
          <option value="AI_ANALYZED">AI Analyzed</option>
          <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
          <option value="OFFER_EXTENDED">Offer Extended</option>
          <option value="HIRED">Hired</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="latest">Sort: Latest Submissions</option>
          <option value="score_desc">Sort: Highest Composite Score</option>
          <option value="ai_score_desc">Sort: Highest AI Match Score</option>
          <option value="experience_desc">Sort: Most Experience Years</option>
        </select>

        {jobId && (
          <button
            onClick={() => setJobId("")}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 flex items-center justify-center gap-1"
          >
            <span>Clear Position Filter</span>
          </button>
        )}
      </div>

      {/* Candidates Table */}
      {loading ? (
        <SkeletonTable />
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
          <p className="text-xs text-slate-600">{error}</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">No applications match your criteria</h3>
          <p className="text-xs text-slate-400 mt-1">Try resetting filters or submitting a new application.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">Applied Position</th>
                  <th className="py-3.5 px-4">Experience</th>
                  <th className="py-3.5 px-4">Pipeline Status</th>
                  <th className="py-3.5 px-4">AI Resume Match</th>
                  <th className="py-3.5 px-4">Composite Score</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div>
                        <Link
                          href={`/applications/${app.id}`}
                          className="font-bold text-slate-900 group-hover:text-indigo-600 hover:underline block"
                        >
                          {app.candidateName}
                        </Link>
                        <span className="text-[11px] text-slate-400">{app.candidateEmail}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700 block">{app.job?.title || "Position"}</span>
                      <span className="text-[11px] text-slate-400">{app.job?.department || "General"}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {app.experienceYears} yrs
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4">
                      {app.aiScore ? (
                        <div className="flex items-center gap-1.5 font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded max-w-fit">
                          <Sparkles className="h-3 w-3" />
                          <span>{app.aiScore}%</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Unanalyzed</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <ScoreGauge score={app.compositeScore} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/applications/${app.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 font-semibold transition-all"
                      >
                        <span>Review</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<SkeletonTable />}>
      <ApplicationsContent />
    </Suspense>
  );
}
