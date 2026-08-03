import {
  LayoutDashboard,
  Target,
  Image,
  Sparkles,
  Video,
  Palette,
  PenTool,
  Archive,
  FolderOpen,
  Clock,
  Star,
  Users,
  Settings,
  Layers,
  type LucideIcon,
} from "lucide-react";

export type NavBadge = "beta" | "soon" | "new";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  Icon: LucideIcon;
  badge?: NavBadge;
  description?: string;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/dashboard",
        Icon: LayoutDashboard,
        description: "Tổng quan & hoạt động gần đây",
      },
    ],
  },
  {
    label: "Tạo nội dung",
    items: [
      {
        id: "brand-checker",
        label: "Brand Checker",
        href: "/brand-checker",
        Icon: Target,
        description: "Kiểm tra tuân thủ thương hiệu",
      },
      {
        id: "banner-generator",
        label: "Banner Generator",
        href: "/banner-generator",
        Icon: Image,
        badge: "beta",
        description: "Tạo banner tự động với AI",
      },
      {
        id: "image-generator",
        label: "Image Generator",
        href: "/image-generator",
        Icon: Sparkles,
        description: "Sinh ảnh sáng tạo bằng AI",
      },
      {
        id: "video-generator",
        label: "Video Generator",
        href: "/video-generator",
        Icon: Video,
        badge: "soon",
        description: "Tạo video marketing tự động",
      },
      {
        id: "creative-studio",
        label: "Creative Studio",
        href: "/creative-studio",
        Icon: Palette,
        badge: "beta",
        description: "Không gian thiết kế tích hợp AI",
      },
      {
        id: "prompt-studio",
        label: "Prompt Studio",
        href: "/prompt-studio",
        Icon: PenTool,
        badge: "new",
        description: "Thư viện & tối ưu prompt AI",
      },
    ],
  },
  {
    label: "Quản lý",
    items: [
      {
        id: "asset-library",
        label: "Asset Library",
        href: "/asset-library",
        Icon: Archive,
        description: "Kho tài nguyên thiết kế",
      },
      {
        id: "projects",
        label: "Projects",
        href: "/projects",
        Icon: FolderOpen,
        description: "Dự án và workspace nhóm",
      },
      {
        id: "history",
        label: "History",
        href: "/history",
        Icon: Clock,
        description: "Lịch sử phân tích & tạo nội dung",
      },
      {
        id: "favorites",
        label: "Favorites",
        href: "/favorites",
        Icon: Star,
        description: "Thiết kế đã lưu yêu thích",
      },
      {
        id: "team",
        label: "Team Workspace",
        href: "/team",
        Icon: Users,
        badge: "soon",
        description: "Cộng tác và phân quyền nhóm",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        id: "design-system",
        label: "Design System",
        href: "/design-system",
        Icon: Layers,
        badge: "new",
        description: "Component library & tokens",
      },
      {
        id: "settings",
        label: "Settings",
        href: "/settings",
        Icon: Settings,
        description: "Tài khoản & cài đặt ứng dụng",
      },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function findNavItem(id: string): NavItem | undefined {
  return ALL_NAV_ITEMS.find((item) => item.id === id);
}

export function findNavItemByPath(pathname: string): NavItem | undefined {
  return ALL_NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );
}
