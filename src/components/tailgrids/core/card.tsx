import { cn } from "@/utils/cn";
import { ComponentProps } from "react";

export function Card({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "w-full bg-card-background-50 flex flex-col gap-3 rounded-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("w-full px-5 pt-5 relative", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-xl md:text-2xl font-semibold text-title-50 leading-7 -tracking-[0.2px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardDescription({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mt-0.5 text-base text-text-100 leading-6 -tracking-[0.2px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardAction({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("absolute top-5 right-5 text-text-50", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("px-5 text-text-100", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("px-5 pb-5", className)} {...props}>
      {children}
    </div>
  );
}
