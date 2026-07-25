import { Palette } from "lucide-react";
import { PlaceholderPage } from "@/components/modules/placeholder-page";

export default function CreativeStudioPage() {
  return (
    <PlaceholderPage
      icon={Palette}
      title="Creative Studio"
      description="Không gian sáng tác tích hợp — kết hợp Brand Checker, Image Generator và Banner Generator trong một canvas duy nhất."
      features={[
        "Canvas kéo-thả",
        "Layer management",
        "Brand asset library",
        "AI suggest layout",
        "Real-time collaboration",
        "Export đa định dạng",
      ]}
      accentColor="#ec4899"
    />
  );
}
