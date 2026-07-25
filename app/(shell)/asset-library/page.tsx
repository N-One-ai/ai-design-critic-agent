import { Archive } from "lucide-react";
import { PlaceholderPage } from "@/components/modules/placeholder-page";

export default function AssetLibraryPage() {
  return (
    <PlaceholderPage
      icon={Archive}
      title="Asset Library"
      description="Kho tài nguyên thiết kế tập trung — logo, icon, hình ảnh thương hiệu và template được kiểm duyệt sẵn sàng sử dụng."
      features={[
        "Brand-approved assets",
        "Smart search & tagging",
        "Version control",
        "Usage tracking",
        "Download formats",
        "Team permissions",
      ]}
      accentColor="#10b981"
    />
  );
}
