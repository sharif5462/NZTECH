"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  Users,
  LayoutDashboard,
  Sparkles,
  LogOut,
  UserCheck,
  ChevronDown,
  Flame,
  PlusCircle,
  Phone,
  Building2,
  Search,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [dbUsers, setDbUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchDbUsers();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchDbUsers = async () => {
    try {
      const res = await fetch("/api/auth/users");
      if (res.ok) {
        const data = await res.json();
        setDbUsers(data.users || []);
      }
    } catch {
      setDbUsers([]);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  const handleQuickSwitch = async (email: string) => {
    setSwitching(true);
    setDropdownOpen(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "Password123!" }),
      });
      if (res.ok) {
        await fetchUser();
        router.refresh();
      }
    } catch (err) {
      console.error("Switch failed", err);
    } finally {
      setSwitching(false);
    }
  };

  const navLinks = [
    { href: "/jobs", label: "Find Jobs", icon: Search },
    { href: "/jobs?type=Full-Time", label: "Hot Jobs", icon: Flame, badge: "Hot" },
    { href: "/dashboard", label: "Recruiter ATS", icon: LayoutDashboard },
    { href: "/applications", label: "Candidate Pipeline", icon: Users },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "RECRUITER":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case "REVIEWER":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      {/* Bdjobs-style Top Helpline & Notice Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <Phone className="h-3 w-3 text-indigo-400" />
              <span>Career Hotline:</span>
              <strong className="text-slate-200 font-semibold">01300672974</strong>
            </span>
            <span className="hidden sm:inline text-slate-600">&bull;</span>
            <span className="hidden sm:inline text-slate-400">
              24/7 Candidate Advisory &amp; Employer Support
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Building2 className="h-3 w-3" />
              <span>Employer ATS Zone</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25 group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl text-slate-900 tracking-tight">HirePulse</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Jobs &amp; ATS
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium -mt-0.5">
                  Premier Career &amp; Recruitment Ecosystem
                </span>
              </div>
            </Link>

            {/* Navigation links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== "/jobs?type=Full-Time" && pathname?.startsWith(`${link.href}/`));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 shadow-2xs font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-rose-500 text-white animate-pulse">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Bdjobs-style Post a Job Button */}
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Post a Vacancy</span>
            </Link>

            {loading ? (
              <div className="h-8 w-24 bg-slate-100 rounded-xl animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    fetchDbUsers();
                  }}
                  className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-semibold text-slate-900 leading-tight">
                      {user.name.split(" ")[0]}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border max-w-fit ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {/* Account Switcher Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-[11px] font-medium text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/70 max-h-56 overflow-y-auto">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 mb-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Available Demo Accounts ({dbUsers.length}):</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {dbUsers.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => handleQuickSwitch(u.email)}
                            disabled={switching || user.email === u.email}
                            className={`text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer ${
                              user.email === u.email
                                ? "bg-indigo-100 text-indigo-900 font-bold"
                                : "hover:bg-white text-slate-700 border border-transparent hover:border-slate-200 hover:shadow-2xs"
                            }`}
                          >
                            <div className="truncate pr-2">
                              <p className="truncate leading-tight font-medium">{u.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${getRoleBadgeColor(u.role)}`}>
                              {u.role}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                      >
                        <LayoutDashboard className="h-3.5 w-3.5 text-slate-400" />
                        Recruiter ATS Dashboard
                      </Link>
                      <Link
                        href="/applications"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                      >
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        Candidate Applications
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
export default Navbar;
