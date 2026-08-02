import { Hero } from "@/components/home/Hero";
import { CraftCategories } from "@/components/home/CraftCategories";
import { CustomizationSteps } from "@/components/home/CustomizationSteps";
import { ValueStrip } from "@/components/home/ValueStrip";
import { CtaBand } from "@/components/home/CtaBand";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ValueStrip />
      <CraftCategories />
      <CustomizationSteps />
      <CtaBand />
    </>
  );
}
