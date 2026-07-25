import { Sparkles } from "lucide-react";
import { PlaceholderPage } from "@/components/modules/placeholder-page";

export default function ImageGeneratorPage() {
  return (
    <PlaceholderPage
      icon={Sparkles}
      title="Image Generator"
      description="Sinh hình ảnh sáng tạo bằng AI — từ prompt văn bản đến hình ảnh chuyên nghiệp phù hợp với campaign ZaloPay."
      features={[
        "Text-to-image AI",
        "Style matching thương hiệu",
        "Nhiều tỷ lệ khung hình",
        "Inpainting & editing",
        "Upscale tới 4K",
        "Lịch sử sinh ảnh",
      ]}
      accentColor="#f59e0b"
    />
  );
}
