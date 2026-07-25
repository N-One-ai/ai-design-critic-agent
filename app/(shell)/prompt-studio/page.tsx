import { PenTool } from "lucide-react";
import { PlaceholderPage } from "@/components/modules/placeholder-page";

export default function PromptStudioPage() {
  return (
    <PlaceholderPage
      icon={PenTool}
      title="Prompt Studio"
      description="Thư viện và trình soạn thảo prompt AI — xây dựng, lưu trữ và chia sẻ prompt tối ưu cho từng loại nội dung ZaloPay."
      features={[
        "Thư viện prompt có sẵn",
        "Prompt versioning",
        "A/B test prompts",
        "Chia sẻ trong team",
        "Prompt analytics",
        "Auto-suggest variables",
      ]}
      accentColor="#06b6d4"
    />
  );
}
