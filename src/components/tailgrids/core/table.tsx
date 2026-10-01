import { cn } from "@/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

const tableRootStyles = cva(
  "min-w-full border-emerald-200/90 dark:border-emerald-800/80 border-separate border-spacing-0 overflow-clip text-left",
  {
    variants: {
      fullBleed: {
        true: "border-y border-emerald-200/90 dark:border-emerald-800/80",
        false: "rounded-lg border border-emerald-200/90 dark:border-emerald-800/80"
      }
    },
    defaultVariants: {
      fullBleed: false
    }
  }
);

type TableRootProps = ComponentProps<"table"> &
  VariantProps<typeof tableRootStyles>;

export function TableRoot({ className, fullBleed, ...props }: TableRootProps) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn(tableRootStyles({ fullBleed }), className)}
        {...props}
      />
    </div>
  );
}

const tableHeaderStyles = cva(
  "bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 [&_th]:border-b [&_th]:border-emerald-200/80 dark:[&_th]:border-emerald-800/80 [&_th]:text-xs font-bold"
);

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn(tableHeaderStyles(), className)} {...props} />;
}

const tableBodyStyle = cva("divide-y divide-emerald-100/80 dark:divide-emerald-900/40");

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={cn(tableBodyStyle(), className)} {...props} />;
}

const tableHeadStyles = cva("px-5 py-3.5 font-extrabold uppercase tracking-wider text-[11px] text-emerald-950 dark:text-emerald-200");

export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return <th className={cn(tableHeadStyles(), className)} {...props} />;
}

const tableRowStyles = cva(
  "not-last:[&>*]:border-emerald-200/70 dark:not-last:[&>*]:border-emerald-800/50 not-last:[&>td]:border-b not-last:[&>th]:border-b border-b border-emerald-100/80 dark:border-emerald-900/30"
);

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={cn(tableRowStyles(), className)} {...props} />;
}

const tableCellStyles = cva("text-text-100 px-5 py-3.5 font-medium border-b border-emerald-100/70 dark:border-emerald-900/30");

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn(tableCellStyles(), className)} {...props} />;
}
