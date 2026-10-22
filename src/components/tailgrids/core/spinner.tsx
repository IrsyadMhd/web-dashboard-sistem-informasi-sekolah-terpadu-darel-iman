"use client";

import React from "react";
import { Spinner as HeroSpinner } from "@heroui/react";
import { cn } from "@/utils/cn";

export interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  color?: string;
}

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  const heroSize = size === "xs" || size === "sm" ? "sm" : size === "lg" || size === "xl" ? "lg" : "md";
  return (
    <HeroSpinner
      size={heroSize}
      className={cn("text-current shrink-0", className)}
      {...props}
    />
  );
}

export default Spinner;
