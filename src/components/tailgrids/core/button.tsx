"use client";

import { cn } from "@/utils/cn";
import { cva, VariantProps } from "class-variance-authority";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps
} from "react-aria-components";

export const buttonStyles = cva(
  "flex items-center justify-center gap-3 rounded-lg font-medium transition focus:ring-3 disabled:pointer-events-none [&>svg]:text-current outline-none",
  {
    variants: {
      variant: {
        primary: "",
        danger: "",
        success: "",
        ghost: ""
      },
      appearance: {
        fill: "",
        outline: ""
      },
      iconOnly: {
        true: "",
        false: ""
      },
      size: {
        xs: "text-xs [&>svg]:size-5",
        sm: "text-sm [&>svg]:size-5",
        md: "[&>svg]:size-6",
        lg: "[&>svg]:size-6"
      }
    },
    compoundVariants: [
      {
        variant: ["primary", "danger", "success"],
        appearance: "fill",
        className: "text-white disabled:bg-slate-200 disabled:text-slate-400"
      },
      {
        variant: ["primary", "danger", "success"],
        appearance: "outline",
        className: "border disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400"
      },
      {
        variant: "primary",
        appearance: "fill",
        className: "bg-[#0E5C44] hover:bg-[#094533] text-white focus:ring-[#0E5C44]/20 shadow-xs"
      },
      {
        variant: "primary",
        appearance: "outline",
        className: "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs"
      },
      {
        variant: "danger",
        appearance: "fill",
        className: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500/20 shadow-xs"
      },
      {
        variant: "danger",
        appearance: "outline",
        className: "border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100/60 shadow-xs"
      },
      {
        variant: "success",
        appearance: "fill",
        className: "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500/20 shadow-xs"
      },
      {
        variant: "success",
        appearance: "outline",
        className: "border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/60 shadow-xs"
      },
      {
        variant: "ghost",
        className: "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus:ring-2 focus:ring-emerald-500/20"
      },
      {
        iconOnly: true,
        size: "xs",
        className: "size-8"
      },
      {
        iconOnly: true,
        size: "sm",
        className: "size-10"
      },
      {
        iconOnly: false,
        size: ["xs", "sm"],
        className: "px-3.5"
      },
      {
        iconOnly: true,
        size: "md",
        className: "size-11"
      },
      {
        iconOnly: false,
        size: "md",
        className: "px-4"
      },
      {
        iconOnly: true,
        size: "lg",
        className: "size-12"
      },
      {
        iconOnly: false,
        size: "lg",
        className: "px-5"
      },
      {
        iconOnly: false,
        className: "py-2.5"
      }
    ],
    defaultVariants: {
      variant: "primary",
      appearance: "fill",
      iconOnly: false,
      size: "md"
    }
  }
);

export interface ButtonProps
  extends
    Omit<AriaButtonProps, "isDisabled" | "isPending">,
    VariantProps<typeof buttonStyles> {
  disabled?: boolean;
  pending?: boolean;
  readOnly?: boolean;
}

export function Button({
  variant,
  appearance,
  iconOnly,
  size,
  children,
  className,
  disabled,
  pending,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      className={cn(
        buttonStyles({
          variant,
          appearance,
          iconOnly,
          size
        }),
        className
      )}
      isDisabled={disabled}
      isPending={pending}
      {...props}
    >
      {children}
    </AriaButton>
  );
}
