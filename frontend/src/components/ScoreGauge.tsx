import React from "react";
import { getScoreBadge } from "@/lib/scoreCalculator";

interface ScoreGaugeProps {
  score: number | null | undefined;
  label?: string;
  size?: "sm" | "md" | "lg";
  showTier?: boolean;
}

export function ScoreGauge({ score, label = "Match Score", size = "md", showTier = true }: ScoreGaugeProps) {
  if (score === null || score === undefined) {
    return (
      <span className="text-xs text-slate-400 italic">Pending Evaluation</span>
    );
  }

  const badge = getScoreBadge(score);

  const getScoreColor = (sc: number) => {
    if (sc >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (sc >= 70) return "text-blue-600 bg-blue-50 border-blue-200";
    if (sc >= 50) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const colorClasses = getScoreColor(score);

  if (size === "sm") {
    return (
      <div className="flex items-center gap-1.5">
        <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs border ${colorClasses}`}>
          {score}%
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className={`px-2.5 py-1 rounded-md font-mono font-bold text-sm border ${colorClasses}`}>
          {score}%
        </span>
        {label && <span className="text-xs text-slate-500 font-medium">{label}</span>}
      </div>
      {showTier && (
        <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border max-w-fit ${badge.colorClass}`}>
          {badge.label}
        </span>
      )}
    </div>
  );
}
export default ScoreGauge;
