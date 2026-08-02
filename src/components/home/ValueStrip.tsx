import { HandHeart, ShieldCheck, Leaf, Truck } from "lucide-react";
import { Container } from "@/components/ui/Container";

const VALUES = [
  { icon: HandHeart, label: "Handmade with love" },
  { icon: ShieldCheck, label: "Careful, secure packaging" },
  { icon: Leaf, label: "Made to order, not mass-produced" },
  { icon: Truck, label: "Shipped across India" },
];

export function ValueStrip() {
  return (
    <div className="border-y border-border bg-sage/10">
      <Container className="grid grid-cols-2 gap-6 py-10 sm:grid-cols-4">
        {VALUES.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <Icon className="h-6 w-6 text-sage-dark" />
            <p className="text-xs font-medium text-navy sm:text-sm">{label}</p>
          </div>
        ))}
      </Container>
    </div>
  );
}
