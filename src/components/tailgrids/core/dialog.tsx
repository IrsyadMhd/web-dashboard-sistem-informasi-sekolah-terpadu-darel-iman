import { cn } from "@/utils/cn";
import { Close } from "@tailgrids/icons";
import type { ComponentProps } from "react";
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  Modal as AriaModal,
  Heading,
  type DialogProps as AriaDialogProps,
  type HeadingProps
} from "react-aria-components";
import { Button, ButtonProps } from "./button";
import { Description, DescriptionProps } from "./description";

export interface DialogProps extends AriaDialogProps {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  showCloseButton?: boolean;
}

export function Dialog({
  isOpen,
  defaultOpen,
  onOpenChange,
  className,
  showCloseButton = true,
  children,
  ...props
}: DialogProps) {
  const hasCustomMaxW = className && /\bmax-w-/.test(className);
  const hasCustomPadding = className && /\b(p-0|p-\d|px-\d|py-\d)\b/.test(className);

  return (
    <AriaModal
      isOpen={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm overflow-hidden"
    >
      <AriaDialog
        className={cn(
          "relative w-full border border-slate-200/80 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl outline-none flex flex-col max-h-[85vh] sm:max-h-[88vh] my-auto overflow-hidden p-6 z-50",
          !hasCustomMaxW && "max-w-140 max-sm:max-w-[calc(100%-2rem)]",
          !hasCustomPadding && "p-6",
          className
        )}
        {...props}
      >
        {({ close }) => (
          <>
            {typeof children === "function" ? children({ close }) : children}
            {showCloseButton && (
              <AriaButton
                onPress={close}
                aria-label="Close"
                className="absolute top-4 right-4 flex size-7 items-center justify-center rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white transition-opacity outline-none z-10 [&>svg]:size-5"
              >
                <Close />
                <span className="sr-only">Close</span>
              </AriaButton>
            )}
          </>
        )}
      </AriaDialog>
    </AriaModal>
  );
}

export interface DialogHeaderProps extends ComponentProps<"div"> {}

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("shrink-0 flex flex-col gap-1.5 text-left", className)}
      {...props}
    />
  );
}

export interface DialogTitleProps extends HeadingProps {
  className?: string;
}

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <Heading
      slot="title"
      className={cn(
        "text-lg font-semibold leading-none text-title-50",
        className
      )}
      {...props}
    />
  );
}

export interface DialogDescriptionProps extends DescriptionProps {}

export function DialogDescription({ ...props }: DialogDescriptionProps) {
  return <Description {...props} />;
}

export interface DialogBodyProps extends ComponentProps<"div"> {}

export function DialogBody({ className, ...props }: DialogBodyProps) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("flex-1 min-h-0 overflow-y-auto py-4 text-sm text-text-100 custom-scrollbar", className)}
      {...props}
    />
  );
}

export interface DialogFooterProps extends ComponentProps<"div"> {
  showCloseButton?: boolean;
}

export function DialogFooter({
  className,
  children,
  ...props
}: DialogFooterProps) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "shrink-0 flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface DialogCloseProps extends Omit<ButtonProps, "slot"> {}

export function DialogClose({ ...props }: DialogCloseProps) {
  return <Button slot="close" {...props} />;
}
