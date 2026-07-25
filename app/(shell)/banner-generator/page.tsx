import { Image } from "lucide-react";
import { PlaceholderPage } from "@/components/modules/placeholder-page";

export default function BannerGeneratorPage() {
  return (
    <PlaceholderPage
      icon={Image}
      title="Banner Generator"
      description="Tự động tạo banner quảng cáo đẹp mắt theo đúng chuẩn thương hiệu ZaloPay chỉ với vài dòng mô tả."
      features={[
        "Tạo banner theo kích thước chuẩn",
        "Tự động áp dụng brand guideline",
        "Nhiều template đa dạng",
        "Xuất PNG / JPG chất lượng cao",
        "Tích hợp font ZaloPay",
        "Batch generation",
      ]}
    />
  );
}
