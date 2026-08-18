"use client";

import { cn } from "@/utils/cn";
import type { ComponentProps } from "react";
import {
  Disclosure as AriaDisclosure,
  DisclosurePanel as AriaDisclosurePanel
} from "react-aria-components";

export function Collapsible({
  className,
  ...props
}: ComponentProps<typeof AriaDisclosure>) {
  return (
    <AriaDisclosure
      data-slot="collapsible"
      className={cn("w-full", className)}
      {...props}
    />
  );
}

export function CollapsibleContent({
  className,
  ...props
}: ComponentProps<typeof AriaDisclosurePanel>) {
  return (
    <AriaDisclosurePanel
      data-slot="collapsible-content"
      className={cn("overflow-hidden transition-all", className)}
      {...props}
    />
  );
}
