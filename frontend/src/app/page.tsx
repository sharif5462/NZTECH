"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  GitBranch,
  Database,
  CheckCircle2,
  Users,
} from "lucide-react";

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Home() {
  const [dbUsers, setDbUsers] = useState<UserAccount[]>([]);
  const [metrics, setMetrics] = useState<{ totalApplications: number; activeJobs: number } | null>(null);

  useEffect(() => {
    fetch("/api/auth/users")
      .then((r) => r.json())
      .then((d) => setDbUsers(d.users || []))
      .catch(() => {});

    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => setMetrics(d.metrics))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-12 max-w-5xl mx-auto py-6">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-sm">
          <Sparkles className="h-4 w-4" />
          <span>Next-Gen Talent Acquisition &bull; Intelligent Hiring Pipeline</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Intelligent ATS &amp; Candidate Evaluation Pipeline
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
          Streamline candidate screening, evaluate resumes with AI-assisted insights, track candidate stages through a governed workflow pipeline, and collaborate seamlessly across your hiring team.
        </p>

        {metrics && (
          <div className="inline-flex items-center gap-6 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs text-slate-600">
            <span>
              <strong className="text-indigo-600 font-bold">{metrics.activeJobs}</strong> Active Positions
            </span>
            <span className="h-3 w-px bg-slate-200" />
            <span>
              <strong className="text-emerald-600 font-bold">{metrics.totalApplications}</strong> Candidates in Pipeline
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <span>Launch Recruiter Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 shadow-sm transition-colors"
          >
            <span>Browse Job Positions</span>
          </Link>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Cpu className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Dual-Mode AI Engine</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Deterministic Local NLP keyword &amp; vector scoring with zero latency, plus optional generative LLM reasoning for deep qualification analysis and tailored interview question generation.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <GitBranch className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Status State Machine</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Rigorous business workflow: APPLIED &rarr; SCREENING &rarr; AI_ANALYZED &rarr; INTERVIEW_SCHEDULED &rarr; OFFER &rarr; HIRED/REJECTED with full audit logging and compliance checks.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Database className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">PostgreSQL &amp; pgAdmin 4</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Production-grade PostgreSQL 18 with relational foreign keys, cascade deletes, composite score formulas, and registered in pgAdmin 4 for real-time inspection.
          </p>
        </div>
      </div>

      {/* Demo Credentials Box Loaded Dynamically from Database */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="h-6 w-6 text-indigo-400" />
          <h2 className="text-lg font-bold">Registered Database Accounts ({dbUsers.length} in PostgreSQL)</h2>
        </div>
        <p className="text-xs text-slate-300 mb-6">
          All accounts below are retrieved directly from the PostgreSQL <code>users</code> table. Password for seeded accounts is <code>Password123!</code>:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
          {dbUsers.map((u) => (
            <div key={u.id} className="bg-white/10 rounded-xl p-4 border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block mb-1">
                  {u.role}
                </span>
                <p className="font-bold text-white truncate">{u.name}</p>
                <p className="text-slate-300 truncate">{u.email}</p>
              </div>
              <p className="text-slate-400 text-[10px] mt-2">Password123!</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
