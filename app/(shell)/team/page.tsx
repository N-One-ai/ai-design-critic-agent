import { Users } from "lucide-react";
import { PlaceholderPage } from "@/components/modules/placeholder-page";

export default function TeamPage() {
  return (
    <PlaceholderPage
      icon={Users}
      title="Team Workspace"
      description="Cộng tác nhóm trong thời gian thực — chia sẻ thiết kế, feedback, và quản lý brand assets cùng đồng nghiệp."
      features={[
        "Shared brand guidelines",
        "Comment & feedback",
        "Role-based permissions",
        "Activity feed",
        "Design handoff",
        "SSO / LDAP integration",
      ]}
    />
  );
}
