import React from "react";
import { ApplicationStatus } from "@/types";

interface StatusBadgeProps {
  status: ApplicationStatus | string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-semibold",
    lg: "px-3 py-1.5 text-sm font-semibold",
  };

  const getStatusConfig = (st: string) => {
    switch (st) {
      case "APPLIED":
        return {
          label: "Applied",
          classes: "bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-500/20",
          dotColor: "bg-sky-500",
        };
      case "SCREENING":
        return {
          label: "Screening",
          classes: "bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/20",
          dotColor: "bg-purple-500",
        };
      case "AI_ANALYZED":
        return {
          label: "AI Analyzed",
          classes: "bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-500/20",
          dotColor: "bg-indigo-500",
        };
      case "INTERVIEW_SCHEDULED":
        return {
          label: "Interview Scheduled",
          classes: "bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-500/20",
          dotColor: "bg-amber-500",
        };
      case "OFFER_EXTENDED":
        return {
          label: "Offer Extended",
          classes: "bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-500/20",
          dotColor: "bg-emerald-500",
        };
      case "HIRED":
        return {
          label: "Hired",
          classes: "bg-teal-50 text-teal-800 border-teal-200 ring-1 ring-teal-500/20",
          dotColor: "bg-teal-500",
        };
      case "REJECTED":
        return {
          label: "Rejected",
          classes: "bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20",
          dotColor: "bg-rose-500",
        };
      case "ACTIVE":
        return {
          label: "Active",
          classes: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20",
          dotColor: "bg-emerald-500",
        };
      case "DRAFT":
        return {
          label: "Draft",
          classes: "bg-slate-100 text-slate-700 border-slate-200 ring-1 ring-slate-500/20",
          dotColor: "bg-slate-400",
        };
      case "CLOSED":
        return {
          label: "Closed",
          classes: "bg-gray-100 text-gray-700 border-gray-200 ring-1 ring-gray-500/20",
          dotColor: "bg-gray-400",
        };
      default:
        return {
          label: st,
          classes: "bg-slate-100 text-slate-700 border-slate-200 ring-1 ring-slate-500/20",
          dotColor: "bg-slate-400",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.classes} ${sizeClasses[size]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}
export default StatusBadge;
