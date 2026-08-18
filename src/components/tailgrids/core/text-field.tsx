"use client";

import { cn } from "@/utils/cn";
import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps
} from "react-aria-components";

export interface TextFieldProps extends AriaTextFieldProps {
  className?: string;
}

export function TextField({ className, ...props }: TextFieldProps) {
  return (
    <AriaTextField
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}
