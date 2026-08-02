import { CompassIcon } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";

export default function NotFound() {
  return (
    <ComingSoon
      icon={CompassIcon}
      title="Page Not Found"
      description="The page you're looking for doesn't exist, or has moved."
    />
  );
}
