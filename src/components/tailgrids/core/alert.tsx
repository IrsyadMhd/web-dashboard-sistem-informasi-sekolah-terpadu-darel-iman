"use client";

import { cn } from "@/utils/cn";
import {
  CheckCircle1,
  InfoCircle,
  InfoTriangle,
  Xmark
} from "@tailgrids/icons";
import { cva, type VariantProps } from "class-variance-authority";
import { createContext, use } from "react";
import { Heading, HeadingProps } from "react-aria-components";

const AlertContext = createContext<{ status: AlertStatus }>({
  status: "default"
});

// Alert

const alertStyles = cva(
  "relative w-full flex items-start gap-3 max-w-4xl rounded-lg border px-5 py-4",
  {
    variants: {
      status: {
        default: "border-alert-default-border bg-alert-default-background border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100",
        success: "border-alert-success-border bg-alert-success-background border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200",
        warning: "border-alert-warning-border bg-alert-warning-background border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200",
        error: "border-alert-danger-border bg-alert-danger-background border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200",
        info: "border-alert-info-border bg-alert-info-background border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-200"
      }
    },
    defaultVariants: {
      status: "default"
    }
  }
);

export type AlertStatus = NonNullable<
  VariantProps<typeof alertStyles>["status"]
>;

export interface AlertProps extends React.ComponentProps<"div"> {
  status?: AlertStatus;
}

export function Alert({
  className,
  status = "default",
  children,
  ...props
}: AlertProps) {
  return (
    <AlertContext.Provider value={{ status }}>
      <div
        data-slot="alert"
        data-status={status}
        role="alert"
        className={cn(alertStyles({ status }), className)}
        {...props}
      >
        {children}
      </div>
    </AlertContext.Provider>
  );
}

Alert.displayName = "Alert";

// Alert Indicator

const indicatorStyles = cva(
  "flex size-7 items-center justify-center rounded-lg [&>svg]:size-4 text-white shrink-0",
  {
    variants: {
      status: {
        default: "bg-alert-default-icon-background bg-slate-700 text-white",
        success: "bg-alert-success-icon-background bg-emerald-600 text-white",
        warning: "bg-alert-warning-icon-background bg-amber-500 text-white",
        error: "bg-alert-danger-icon-background bg-rose-600 text-white",
        info: "bg-alert-info-icon-background bg-sky-600 text-white"
      }
    },
    defaultVariants: {
      status: "default"
    }
  }
);

export interface AlertIndicatorProps extends React.ComponentProps<"span"> {}

export function AlertIndicator({
  className,
  children,
  ...props
}: AlertIndicatorProps) {
  const { status } = use(AlertContext);

  const loadIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle1 aria-hidden="true" focusable="false" />;
      case "warning":
        return <InfoTriangle aria-hidden="true" focusable="false" />;
      case "error":
        return <Xmark aria-hidden="true" focusable="false" />;
      case "info":
      default:
        return <InfoCircle aria-hidden="true" focusable="false" />;
    }
  };

  return (
    <span
      data-slot="alert-indicator"
      data-status={status}
      aria-hidden="true"
      role="presentation"
      className={cn(indicatorStyles({ status }), className)}
      {...props}
    >
      {children ?? loadIcon()}
    </span>
  );
}

AlertIndicator.displayName = "AlertIndicator";

// Alert Content

export interface AlertContentProps extends React.ComponentProps<"div"> {}

export function AlertContent({ className, ...props }: AlertContentProps) {
  return (
    <div
      data-slot="alert-content"
      className={cn("flex-1 flex flex-col items-start gap-1", className)}
      {...props}
    />
  );
}

AlertContent.displayName = "AlertContent";

// Alert Title

const titleStyles = cva("font-semibold leading-6 tracking-[-0.2px]", {
  variants: {
    status: {
      default: "text-alert-default-title text-slate-900 dark:text-slate-100",
      success: "text-alert-success-title text-emerald-950 dark:text-emerald-100",
      warning: "text-alert-warning-title text-amber-950 dark:text-amber-100",
      error: "text-alert-danger-title text-rose-950 dark:text-rose-100",
      info: "text-alert-info-title text-sky-950 dark:text-sky-100"
    }
  },
  defaultVariants: {
    status: "default"
  }
});

export interface AlertTitleProps extends HeadingProps {}

export function AlertTitle({
  className,
  children,
  level = 4,
  ...props
}: AlertTitleProps) {
  const { status } = use(AlertContext);

  return (
    <Heading
      data-slot="alert-title"
      data-status={status}
      level={level}
      className={cn(titleStyles({ status }), className)}
      {...props}
    >
      {children}
    </Heading>
  );
}

AlertTitle.displayName = "AlertTitle";

// Alert Description

export interface AlertDescriptionProps extends React.ComponentProps<"div"> {}

export function AlertDescription({
  className,
  children,
  ...props
}: AlertDescriptionProps) {
  const { status } = use(AlertContext);

  const descColorMap: Record<AlertStatus, string> = {
    default: "text-slate-600 dark:text-slate-300",
    success: "text-emerald-800 dark:text-emerald-300",
    warning: "text-amber-800 dark:text-amber-300",
    error: "text-rose-800 dark:text-rose-300",
    info: "text-sky-800 dark:text-sky-300",
  };

  return (
    <div
      data-slot="alert-description"
      data-status={status}
      className={cn(
        "text-sm leading-5 tracking-[-0.2px]",
        descColorMap[status] || "text-text-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

AlertDescription.displayName = "AlertDescription";
