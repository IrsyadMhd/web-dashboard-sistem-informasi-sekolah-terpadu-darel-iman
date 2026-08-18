"use client";

import { cn } from "@/utils/cn";
import { RefreshCircle1Clockwise } from "@tailgrids/icons";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

const spinnerVariants = cva("animate-spin text-current shrink-0", {
  variants: {
    size: {
      xs: "size-3.5",
      sm: "size-4",
      md: "size-5",
      lg: "size-6",
      xl: "size-8"
    }
  },
  defaultVariants: {
    size: "md"
  }
});

export interface SpinnerProps
  extends ComponentProps<"svg">,
    VariantProps<typeof spinnerVariants> {}

export function Spinner({ size, className, ...props }: SpinnerProps) {
  return (
    <RefreshCircle1Clockwise
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    />
  );
}
