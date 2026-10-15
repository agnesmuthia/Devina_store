import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "info" | "success" | "warning" | "danger";

const styles: Record<Tone, { box: string; Icon: typeof Info }> = {
  info: { box: "border-ink-200 bg-ink-50 text-ink-800", Icon: Info },
  success: { box: "border-success-700/20 bg-success-50 text-success-700", Icon: CheckCircle2 },
  warning: { box: "border-warning-700/20 bg-warning-50 text-warning-700", Icon: AlertTriangle },
  danger: { box: "border-danger-700/20 bg-danger-50 text-danger-700", Icon: XCircle },
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const { box, Icon } = styles[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("flex gap-3 rounded-[var(--radius-control)] border p-3.5 text-sm", box, className)}>
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && "mt-0.5", "leading-relaxed")}>{children}</div>}
      </div>
    </div>
  );
}
