import React from "react";

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-5 bg-slate-200 rounded w-1/3"></div>
        <div className="h-6 bg-slate-200 rounded-full w-20"></div>
      </div>
      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-slate-100 rounded w-full"></div>
        <div className="h-3 bg-slate-100 rounded w-5/6"></div>
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-5 bg-slate-100 rounded w-16"></div>
        <div className="h-5 bg-slate-100 rounded w-16"></div>
        <div className="h-5 bg-slate-100 rounded w-16"></div>
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-100 border-b border-slate-200"></div>
      <div className="divide-y divide-slate-100 p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/6"></div>
            <div className="h-4 bg-slate-200 rounded w-1/6"></div>
            <div className="h-6 bg-slate-200 rounded-full w-24"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
