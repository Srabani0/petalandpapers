import type { OrderStatus } from "@prisma/client";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ORDER_FLOW, ORDER_STATUS_LABEL } from "@/lib/order-status";

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED" || status === "REFUNDED") {
    return (
      <div className="rounded-lg border border-error/30 bg-error/5 p-4 text-sm text-error">
        This order was {status === "CANCELLED" ? "cancelled" : "refunded"}.
      </div>
    );
  }

  const currentIndex = ORDER_FLOW.indexOf(status);

  return (
    <ol className="flex flex-col">
      {ORDER_FLOW.map((step, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;
        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs",
                  done && "border-sage bg-sage text-cream",
                  current && "border-gold bg-gold text-cream",
                  !done && !current && "border-border bg-paper text-muted",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              {index < ORDER_FLOW.length - 1 ? (
                <span className={cn("min-h-6 w-px flex-1", done ? "bg-sage" : "bg-border")} />
              ) : null}
            </div>
            <p
              className={cn(
                "pb-6 text-sm",
                current ? "font-medium text-navy" : done ? "text-navy" : "text-muted",
              )}
            >
              {ORDER_STATUS_LABEL[step]}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
