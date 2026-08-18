"use client";

import { cn } from "@/utils/cn";
import * as React from "react";

export interface LabelProps extends React.ComponentProps<"label"> {}

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "text-sm font-medium text-text-100 select-none cursor-pointer",
        className
      )}
      {...props}
    />
  );
}
