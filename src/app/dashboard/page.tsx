"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import ScoreGauge from "@/components/ScoreGauge";
import { SkeletonCard, SkeletonTable } from "@/components/SkeletonLoader";

interface AnalyticsData {
  metrics: {
    totalApplications: number;
    activeJobs: number;
    avgAiScore: number;
    pipelineBreakdown: Record<string, number>;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    fromStatus?: string;
    toStatus?: string;
    details?: string;
    createdAt: string;
    actor?: { name: string; role: string };
    application?: { candidateName: string };
  }>;
  topCandidates: Array<{
    id: string;
    candidateName: string;
    candidateEmail: string;
    status: string;
    aiScore?: number;
    compositeScore?: number;
    job?: { title: string };
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed to load dashboard metrics");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonTable />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Unable to load dashboard</h3>
        <p className="text-xs text-slate-500 mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { metrics, recentActivity, topCandidates } = data;

  const pipelineStages = [
    { key: "APPLIED", label: "Applied", color: "bg-sky-500" },
    { key: "SCREENING", label: "Screening", color: "bg-purple-500" },
    { key: "AI_ANALYZED", label: "AI Analyzed", color: "bg-indigo-500" },
    { key: "INTERVIEW_SCHEDULED", label: "Interview", color: "bg-amber-500" },
    { key: "OFFER_EXTENDED", label: "Offer", color: "bg-emerald-500" },
    { key: "HIRED", label: "Hired", color: "bg-teal-500" },
    { key: "REJECTED", label: "Rejected", color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recruitment Dashboard</h1>
          <p className="text-xs text-slate-500">
            Real-time pipeline analytics, AI screening performance, and candidate status tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>Manage Jobs</span>
          </Link>
          <Link
            href="/applications"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Candidate Pipeline</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Candidates</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.totalApplications}</p>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>Active submissions</span>
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Positions</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.activeJobs}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Open for applications</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Briefcase className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average AI Score</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.avgAiScore}%</p>
            <p className="text-[11px] text-indigo-600 font-medium mt-1">NLP resume fit index</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Offers &amp; Hires</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {(metrics.pipelineBreakdown["OFFER_EXTENDED"] || 0) +
                (metrics.pipelineBreakdown["HIRED"] || 0)}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Shortlisted / Extended</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Recruitment Status Pipeline Funnel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Application Pipeline Stages</h2>
            <p className="text-xs text-slate-500">Live distribution of candidates across workflow stages</p>
          </div>
          <span className="text-xs font-medium text-slate-400">
            Total Pipeline: {metrics.totalApplications}
          </span>
        </div>

        {/* Funnel Progress Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          {pipelineStages.map((st) => {
            const count = metrics.pipelineBreakdown[st.key] || 0;
            const pct =
              metrics.totalApplications > 0
                ? Math.round((count / metrics.totalApplications) * 100)
                : 0;
            return (
              <div
                key={st.key}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-600">{st.label}</span>
                  <span className="font-mono text-xs font-bold text-slate-900">{count}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${st.color} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">{pct}% of total</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Top Ranked Candidates & Live Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Top Candidates */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Top Evaluated Candidates</h2>
              <p className="text-xs text-slate-500">Ranked by calculated composite score (AI + Interview)</p>
            </div>
            <Link
              href="/applications"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {topCandidates.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No candidate reviews yet</p>
            ) : (
              topCandidates.map((c) => (
                <div
                  key={c.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/applications/${c.id}`}
                      className="font-semibold text-sm text-slate-900 hover:text-indigo-600 hover:underline block truncate"
                    >
                      {c.candidateName}
                    </Link>
                    <p className="text-xs text-slate-500 truncate">{c.job?.title || "Position"}</p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <StatusBadge status={c.status} size="sm" />
                    <ScoreGauge score={c.compositeScore} label="Composite" size="sm" />
                    <Link
                      href={`/applications/${c.id}`}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 transition-colors"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Real-time Audit Trail */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Workflow Audit Log</h2>
          </div>
          <p className="text-xs text-slate-500">Compliance &amp; state change history</p>

          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No activity logged</p>
            ) : (
              recentActivity.map((log) => (
                <div key={log.id} className="text-xs border-l-2 border-indigo-200 pl-3 py-1 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-700">
                      {log.actor?.name || "System Automated"}
                    </span>
                    <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-600 leading-tight">
                    {log.details || `Transitioned candidate to ${log.toStatus}`}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
