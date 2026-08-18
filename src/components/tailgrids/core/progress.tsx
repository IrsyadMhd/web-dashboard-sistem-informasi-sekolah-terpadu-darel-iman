"use client";

import { cn } from "@/lib/utils";

interface ProgressProps {
  progress: number;
  withLabel?: boolean;
  className?: string;
  colorScheme?: "emerald" | "blue" | "violet" | "amber" | "rose" | "indigo" | "slate";
}

const colorMap = {
  emerald: "bg-[#0E5C44] dark:bg-[#3FBF75]",
  blue: "bg-sky-500 dark:bg-sky-400",
  violet: "bg-violet-500 dark:bg-violet-400",
  amber: "bg-amber-500 dark:bg-amber-400",
  rose: "bg-rose-500 dark:bg-rose-400",
  indigo: "bg-indigo-500 dark:bg-indigo-400",
  slate: "bg-slate-500 dark:bg-slate-400",
};

const bgMap = {
  emerald: "bg-[#0E5C44]/10 dark:bg-[#3FBF75]/10",
  blue: "bg-sky-100 dark:bg-sky-900/30",
  violet: "bg-violet-100 dark:bg-violet-900/30",
  amber: "bg-amber-100 dark:bg-amber-900/30",
  rose: "bg-rose-100 dark:bg-rose-900/30",
  indigo: "bg-indigo-100 dark:bg-indigo-900/30",
  slate: "bg-slate-100 dark:bg-slate-800",
};

export default function Progress({
  progress,
  withLabel = false,
  className = "",
  colorScheme = "emerald",
}: ProgressProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const fillColor = colorMap[colorScheme] || colorMap.emerald;
  const trackColor = bgMap[colorScheme] || bgMap.emerald;

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {withLabel && (
        <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
          <span>Progress</span>
          <span className="font-bold text-slate-900 dark:text-white">{clampedProgress}%</span>
        </div>
      )}
      <div className={cn("h-2 w-full rounded-full overflow-hidden", trackColor)}>
        <div
          className={cn("h-full rounded-full transition-all duration-300 ease-out", fillColor)}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}