"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Briefcase,
  Flame,
  Sparkles,
  ArrowRight,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Cpu,
  Layers,
  Palette,
  DollarSign,
  ShieldCheck,
  Award,
  ChevronRight,
  Code,
  Smartphone,
  LineChart,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

interface Job {
  id: string;
  title: string;
  companyName?: string;
  department: string;
  location: string;
  type: string;
  minSalary?: number;
  maxSalary?: number;
  requiredSkills: string;
  experienceLevel: string;
  isHot?: boolean;
  deadline?: string;
  createdAt: string;
}

export default function Home() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");

  const [hotJobs, setHotJobs] = useState<Job[]>([]);
  const [departmentsList, setDepartmentsList] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<{ totalApplications: number; activeJobs: number } | null>(null);

  useEffect(() => {
    // Fetch departments
    fetch("/api/jobs/departments")
      .then((r) => r.json())
      .then((d) => setDepartmentsList(d.departments || []))
      .catch(() => {});

    // Fetch jobs for Hot Jobs showcase
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => {
        const allJobs = d.jobs || [];
        setHotJobs(allJobs.slice(0, 6));
      })
      .catch(() => {});

    // Fetch live market metrics
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => setMetrics(d.metrics))
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("search", keyword.trim());
    if (department) params.set("department", department);
    router.push(`/jobs?${params.toString()}`);
  };

  const categories = [
    { name: "Software & Technology", count: "12 Vacancies", icon: Code, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
    { name: "Cloud & Infrastructure", count: "8 Vacancies", icon: Cpu, color: "text-sky-600 bg-sky-50 border-sky-200" },
    { name: "Banking & Finance", count: "6 Vacancies", icon: DollarSign, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { name: "Design & Creative", count: "5 Vacancies", icon: Palette, color: "text-purple-600 bg-purple-50 border-purple-200" },
    { name: "Data & AI", count: "7 Vacancies", icon: LineChart, color: "text-violet-600 bg-violet-50 border-violet-200" },
    { name: "Human Resources", count: "4 Vacancies", icon: Users, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { name: "Mobile Engineering", count: "6 Vacancies", icon: Smartphone, color: "text-teal-600 bg-teal-50 border-teal-200" },
    { name: "Marketing & Growth", count: "5 Vacancies", icon: TrendingUp, color: "text-rose-600 bg-rose-50 border-rose-200" },
  ];

  const featuredEmployers = [
    { name: "Apex Tech Global", sector: "Software & Enterprise IT", vacancies: 4, location: "Auckland / Dhaka" },
    { name: "CloudScale Pacific", sector: "DevOps & Cloud Systems", vacancies: 3, location: "Remote Global" },
    { name: "Horizon Digital", sector: "FinTech & Product Design", vacancies: 2, location: "Wellington" },
    { name: "Prime Standard Bank", sector: "Banking & Financial Services", vacancies: 3, location: "Christchurch" },
    { name: "BrainWave Analytics", sector: "Artificial Intelligence", vacancies: 2, location: "Auckland" },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Bdjobs-style Hero Search Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl p-8 sm:p-12 lg:p-16 border border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur text-xs font-semibold text-indigo-300 shadow-sm">
            <Flame className="h-4 w-4 text-rose-400" />
            <span>Over 2,450+ Professional Vacancies Live Right Now</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Find the Perfect Career Fit with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">Intelligent Job Matching</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
            Search thousands of verified vacancies from top employers across New Zealand, Bangladesh, and remote teams. Track your application journey with full transparency.
          </p>

          {/* Bdjobs Iconic Main Search Box */}
          <form
            onSubmit={handleSearch}
            className="bg-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-white/20 text-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3"
          >
            {/* Keyword / Skill Input */}
            <div className="md:col-span-5 relative flex items-center">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Job title, skill (e.g. React, DevOps, Analyst)..."
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
              />
            </div>

            {/* Functional Category Dropdown */}
            <div className="md:col-span-4 relative flex items-center">
              <Briefcase className="h-4 w-4 text-slate-400 absolute left-3 pointer-events-none" />
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium bg-white"
              >
                <option value="">All Functional Areas / Industries</option>
                {departmentsList.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Action Button */}
            <div className="md:col-span-3">
              <button
                type="submit"
                className="w-full h-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <Search className="h-4 w-4" />
                <span>Search Jobs</span>
              </button>
            </div>
          </form>

          {/* Trending Searches Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300 pt-1">
            <span className="font-semibold text-slate-400">Popular Searches:</span>
            {["React Developer", "Full Stack", "DevOps", "UI/UX Designer", "Data Scientist", "Finance", "HR Lead"].map((term) => (
              <button
                key={term}
                onClick={() => {
                  setKeyword(term);
                  router.push(`/jobs?search=${encodeURIComponent(term)}`);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs border border-white/10 transition-colors cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Live Market Stats Counter (Bdjobs Home Signature) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                {metrics ? `${metrics.activeJobs}+` : "8+"}
              </p>
              <p className="text-xs font-semibold text-slate-500">Live Active Positions</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">120+</p>
              <p className="text-xs font-semibold text-slate-500">Partner Employers</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                {metrics ? `${metrics.totalApplications * 40}+` : "2,500+"}
              </p>
              <p className="text-xs font-semibold text-slate-500">Talent Resumes Pool</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">98.4%</p>
              <p className="text-xs font-semibold text-slate-500">Recruiter Response Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Functional Category (Bdjobs 8-Card Directory) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Browse Vacancies by Functional Category
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore specialized job openings categorized across key commercial and technical sectors
            </p>
          </div>
          <Link
            href="/jobs"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Explore All Sectors</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={`/jobs?department=${encodeURIComponent(cat.name)}`}
                className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-4 cursor-pointer"
              >
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${cat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-600 truncate transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] font-medium text-slate-400 block mt-0.5">
                    {cat.count}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Hot Jobs / Featured Vacancies Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-rose-500" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Hot Jobs &amp; Urgent Vacancies
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hand-picked verified opportunities from top organizations with active interview pipelines
            </p>
          </div>
          <Link
            href="/jobs?type=Full-Time"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Hot Jobs</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {hotJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all p-6 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                      {(job.companyName || "Apex").charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-slate-500">{job.companyName || "Apex Tech Global"}</p>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                    </div>
                  </div>
                  {job.isHot && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1 shrink-0">
                      <Flame className="h-3 w-3" />
                      <span>HOT</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {job.type} &bull; {job.experienceLevel}
                  </span>
                </div>

                {job.minSalary && job.maxSalary && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    <span>${(job.minSalary / 1000).toFixed(0)}k - ${(job.maxSalary / 1000).toFixed(0)}k NZD</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.requiredSkills.split(",").slice(0, 3).map((skill) => (
                    <span
                      key={skill.trim()}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  Deadline: {job.deadline || "Open until filled"}
                </span>
                <Link
                  href={`/apply/${job.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all hover:scale-[1.02] flex items-center gap-1 cursor-pointer"
                >
                  <span>Apply Now</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Employers Carousel / Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Top Companies Actively Hiring
          </h2>
          <p className="text-xs text-slate-500">
            Leading enterprises and high-growth innovators partnering with HirePulse
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {featuredEmployers.map((emp) => (
            <div
              key={emp.name}
              className="bg-white p-5 rounded-2xl border border-slate-200 text-center space-y-2 hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-700 font-black text-lg flex items-center justify-center mx-auto border border-indigo-100">
                {emp.name.charAt(0)}
              </div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{emp.name}</h3>
              <p className="text-[11px] text-slate-400 truncate">{emp.sector}</p>
              <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                {emp.vacancies} Open Roles
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Dual Value Proposition: For Job Seekers vs For Employers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* For Candidates */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-11 w-11 rounded-2xl bg-white/10 text-indigo-300 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-extrabold tracking-tight">For Job Seekers</h3>
              <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
                Supercharge your career search. Build your profile, let our AI evaluate your resume fit against active job descriptions, and get direct visibility from verified recruitment teams.
              </p>

              <ul className="space-y-2 text-xs text-indigo-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Real-time AI Match Index and custom interview prep questions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Transparent stage-by-stage hiring progress tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Direct apply with zero friction or external hurdles</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-indigo-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Create Candidate Account
              </Link>
              <Link
                href="/jobs"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors"
              >
                Explore Vacancies
              </Link>
            </div>
          </div>

          {/* For Employers */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-6 flex flex-col justify-between border border-slate-800">
            <div className="space-y-4">
              <div className="h-11 w-11 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-extrabold tracking-tight">For Employers &amp; HR Teams</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Streamline high-volume recruitment without the chaos. Publish vacancies in minutes, screen candidates automatically with dual-mode AI, and collaborate with interviewer scorecards.
              </p>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Automated resume parsing and semantic competency scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>State-machine governed candidate lifecycle with compliance audit logs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Structured interviewer review sheets and composite candidate ranks</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
              >
                Launch Recruiter ATS
              </Link>
              <Link
                href="/jobs"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors"
              >
                Post a Job Vacancy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
