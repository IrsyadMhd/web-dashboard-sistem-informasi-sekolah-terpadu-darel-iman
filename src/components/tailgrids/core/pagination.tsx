"use client";

import { cn } from "@/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cva } from "class-variance-authority";
import { Button } from "./button";

const wrapperStyles = cva(
  "mx-auto flex w-full items-center justify-center max-sm:gap-3 gap-1",
  {
    variants: {
      variant: {
        default: "gap-1",
        compact: "max-w-fit sm:divide-x sm:divide-emerald-200 dark:sm:divide-emerald-800"
      }
    }
  }
);

type PropsType = {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  variant?: "default" | "compact";
  sideLayout?: "full" | "label" | "icon";
};

const MAX_PAGES_SHOWN = 6;

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  variant = "default",
  sideLayout: _sideLayout = "icon"
}: PropsType) {
  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className="w-full text-sm font-medium text-slate-700 dark:text-slate-200"
    >
      <ul className={wrapperStyles({ variant })}>
        <li className="mr-auto">
          <Button
            variant="primary"
            appearance="fill"
            iconOnly={true}
            size="sm"
            disabled={currentPage <= 1}
            aria-label="Halaman sebelumnya"
            onClick={() => onPageChange?.(currentPage - 1)}
            className={cn(
              "flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 disabled:bg-emerald-600/30 disabled:text-white/40 disabled:pointer-events-none dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:disabled:bg-emerald-950/40 dark:disabled:text-white/30 cursor-pointer",
              variant === "compact" && "sm:rounded-r-none sm:border-r-0"
            )}
          >
            <ChevronLeft className="size-5 shrink-0 text-white" />
          </Button>
        </li>

        {/* Only for mobile view */}
        <li className="sm:hidden text-xs font-bold text-slate-600 dark:text-slate-300">
          {currentPage} / {totalPages}
        </li>

        {Array.from({ length: totalPages }, (_, index) => {
          const isActive = currentPage === index + 1;

          if (totalPages > MAX_PAGES_SHOWN) {
            if (currentPage > 3) {
              if (index + 1 < currentPage) {
                return null;
              }

              if (index + 1 === currentPage + 3) {
                return (
                  <li key={index} className="max-sm:hidden">
                    <PaginationEllipsis paginationVariant={variant} />
                  </li>
                );
              }

              if (index + 1 < currentPage + 3 || index + 1 > totalPages - 2) {
                return (
                  <li key={index} className="max-sm:hidden">
                    <PaginationButton
                      page={index + 1}
                      isActive={isActive}
                      onPageChange={onPageChange}
                      paginationVariant={variant}
                    />
                  </li>
                );
              }
            }

            if (index === 3) {
              return (
                <li key={index} className="max-sm:hidden">
                  <PaginationEllipsis paginationVariant={variant} />
                </li>
              );
            }

            if (index > 2 && index < totalPages - 3) {
              return null;
            }
          }

          return (
            <li key={index} className="max-sm:hidden">
              <PaginationButton
                page={index + 1}
                isActive={isActive}
                onPageChange={onPageChange}
                paginationVariant={variant}
              />
            </li>
          );
        })}

        <li className="ml-auto">
          <Button
            variant="primary"
            appearance="fill"
            iconOnly={true}
            size="sm"
            disabled={currentPage >= totalPages}
            aria-label="Halaman berikutnya"
            onClick={() => onPageChange?.(currentPage + 1)}
            className={cn(
              "flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 disabled:bg-emerald-600/30 disabled:text-white/40 disabled:pointer-events-none dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:disabled:bg-emerald-950/40 dark:disabled:text-white/30 cursor-pointer",
              variant === "compact" && "sm:rounded-l-none sm:border-l-0"
            )}
          >
            <ChevronRight className="size-5 shrink-0 text-white" />
          </Button>
        </li>
      </ul>
    </nav>
  );
}

function PaginationButton({
  page,
  isActive,
  onPageChange,
  paginationVariant
}: {
  page: number;
  isActive: boolean;
  onPageChange?: (page: number) => void;
  paginationVariant: PropsType["variant"];
}) {
  return (
    <button
      aria-label={`Ke halaman ${page}`}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer",
        isActive
          ? "bg-emerald-600 text-white shadow-xs dark:bg-emerald-600 dark:text-white"
          : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300",
        paginationVariant === "compact" &&
          "rounded-none border-y border-emerald-200/80 bg-white dark:border-emerald-800/80 dark:bg-[#1B2433]"
      )}
      onClick={() => onPageChange?.(page)}
    >
      {page}
    </button>
  );
}

function PaginationEllipsis({
  paginationVariant
}: {
  paginationVariant: PropsType["variant"];
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none flex size-9 shrink-0 items-center justify-center text-xs font-bold text-slate-400 dark:text-slate-500", {
        "border-y border-emerald-200/80 dark:border-emerald-800/80":
          paginationVariant === "compact"
      })}
    >
      ...
    </span>
  );
}
