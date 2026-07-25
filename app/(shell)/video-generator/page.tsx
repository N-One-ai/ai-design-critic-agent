import { Video } from "lucide-react";
import { PlaceholderPage } from "@/components/modules/placeholder-page";

export default function VideoGeneratorPage() {
  return (
    <PlaceholderPage
      icon={Video}
      title="Video Generator"
      description="Tạo video marketing ngắn cho ZaloPay — tự động ghép ảnh, nhạc nền, và hiệu ứng chuyển cảnh theo phong cách thương hiệu."
      features={[
        "Tạo video 15s / 30s / 60s",
        "Auto-motion từ ảnh tĩnh",
        "Nhạc nền thương hiệu",
        "Thêm caption tự động",
        "Xuất MP4 & GIF",
        "Social media formats",
      ]}
      accentColor="#8b5cf6"
    />
  );
}
