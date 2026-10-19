"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Building2,
  Users,
  Briefcase,
  Headphones,
  Award,
} from "lucide-react";

export default function Footer() {
  const [subscribedEmail, setSubscribedEmail] = useState("");
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribedEmail) {
      setSubscribeSuccess(true);
      setTimeout(() => setSubscribeSuccess(false), 4000);
      setSubscribedEmail("");
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800">
      {/* Newsletter & Job Alert Bar */}
      <div className="border-b border-slate-800 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-400 font-bold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>Instant Job Alerts &amp; Career Insights</span>
              </div>
              <p className="text-slate-400 text-xs max-w-xl">
                Subscribe to receive tailored job recommendations matching your skills, interview tips, and salary trends directly in your inbox.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto max-w-md gap-2">
              <div className="relative flex-1 min-w-[240px]">
                <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={subscribedEmail}
                  onChange={(e) => setSubscribedEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/30 whitespace-nowrap cursor-pointer shrink-0"
              >
                Subscribe Free
              </button>
            </form>
          </div>

          {subscribeSuccess && (
            <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Thank you for subscribing! Your customized career alerts are active.</span>
            </div>
          )}
        </div>
      </div>

      {/* Main 4-Column Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & About */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-lg text-white tracking-tight">HirePulse</span>
                <span className="text-[10px] text-indigo-400 font-semibold block leading-none">
                  Smart Recruitment &amp; Career Portal
                </span>
              </div>
            </Link>

            <p className="text-slate-400 leading-relaxed pr-4 text-xs">
              Empowering top talent and visionary employers. Delivering precision AI candidate matching, structured hiring workflows, and direct access to high-impact career opportunities across Bangladesh, New Zealand, and global markets.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Verified Employers</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
                <Award className="h-3.5 w-3.5 text-indigo-400" />
                <span>AI-Matched Pipelines</span>
              </div>
            </div>
          </div>

          {/* Job Seekers Directory */}
          <div className="space-y-3">
            <p className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-indigo-400" />
              <span>For Job Seekers</span>
            </p>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/jobs" className="hover:text-white transition-colors">
                  Browse All Vacancies
                </Link>
              </li>
              <li>
                <Link href="/jobs?type=Full-Time" className="hover:text-white transition-colors">
                  Hot Tech Jobs
                </Link>
              </li>
              <li>
                <Link href="/jobs?type=Remote" className="hover:text-white transition-colors">
                  Remote &amp; Global Opportunities
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Create Candidate Profile
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Track Applied Applications
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-white transition-colors">
                  Salary Benchmark Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Employers Directory */}
          <div className="space-y-3">
            <p className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>For Employers</span>
            </p>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/jobs" className="hover:text-white transition-colors">
                  Post a New Vacancy
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Recruiter ATS Dashboard
                </Link>
              </li>
              <li>
                <Link href="/applications" className="hover:text-white transition-colors">
                  Candidate Pipeline Funnel
                </Link>
              </li>
              <li>
                <Link href="/applications" className="hover:text-white transition-colors">
                  AI Resume Match Radar
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Team Interview Scorecards
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Hiring Compliance Audit Logs
                </Link>
              </li>
            </ul>
          </div>

          {/* Regional Support & Helplines */}
          <div className="space-y-3">
            <p className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Headphones className="h-3.5 w-3.5 text-sky-400" />
              <span>Helpline &amp; Support</span>
            </p>
            <ul className="space-y-2.5 text-slate-400 text-xs">
              <li className="flex items-start gap-2">
                <Phone className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-medium block">24/7 Helpline Hotline:</span>
                  <span className="text-indigo-300 font-semibold text-sm">01300672974</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-medium block">Candidate Support:</span>
                  <span>support@hirepulse.nz</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-medium block">Corporate Offices:</span>
                  <span>Queen St, Auckland Central, NZ</span>
                  <span className="block">Gulshan-1, Dhaka 1212, BD</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Legal & Compliance */}
      <div className="border-t border-slate-800 bg-slate-950 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>
            &copy; 2026 HirePulse Recruitment Platform &bull; Professional Talent Ecosystem. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/jobs" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
            <span>&bull;</span>
            <Link href="/jobs" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link href="/jobs" className="hover:text-slate-300 transition-colors">
              Equal Opportunity Employer
            </Link>
            <span>&bull;</span>
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">
              Recruiter ATS
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
