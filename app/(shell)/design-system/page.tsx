"use client";

import { useState } from "react";
import {
  Target, Sparkles, Star, Plus, Trash2, Download, Copy,
  Settings, ArrowRight, Check, Bell, Layers, Code2, Type,
} from "lucide-react";
import { Button, IconButton }        from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, PanelSection } from "@/components/ui/card";
import { Input, Textarea, SearchInput } from "@/components/ui/input";
import { Badge, Tag }               from "@/components/ui/badge";
import { Spinner, LoadingOverlay }  from "@/components/ui/spinner";
import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/skeleton";
import { Avatar, AvatarGroup }      from "@/components/ui/avatar";
import { Alert }                    from "@/components/ui/alert";
import { ProgressBar, ScoreBar, ProgressCircle } from "@/components/ui/progress";
import { StatusDot, StatusBadge }   from "@/components/ui/status-indicator";
import { Tabs }                     from "@/components/ui/tabs";
import { Dropdown }                 from "@/components/ui/dropdown";
import { Accordion }                from "@/components/ui/accordion";
import { Tooltip }                  from "@/components/ui/tooltip";
import { GenerateButton }           from "@/components/ui/generate-button";
import { UploadArea, FileCard }     from "@/components/ui/upload-area";
import { EmptyState }               from "@/components/ui/empty-state";
import { SectionDivider }           from "@/components/ui/section";

/* ─── Docs section wrapper ─── */
function DocSection({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-10 border-b border-[var(--border-default)] last:border-0">
      <div className="mb-6">
        <h2 className="text-[18px] font-bold text-[var(--fg-default)]">{title}</h2>
        {description && (
          <p className="text-[14px] text-[var(--fg-muted)] mt-1">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Preview({ label, children, className }: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--fg-subtle)] mb-3">
        {label}
      </p>
      <div className={`flex flex-wrap items-center gap-3 ${className ?? ""}`}>
        {children}
      </div>
    </div>
  );
}

/* ─── Token swatch ─── */
function ColorSwatch({ label, token }: { label: string; token: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="w-14 h-14 rounded-[var(--radius-lg)] border border-[var(--border-default)] shadow-1"
        style={{ background: `var(${token})` }}
      />
      <p className="text-[11px] font-medium text-[var(--fg-default)]">{label}</p>
      <code className="text-[10px] text-[var(--fg-subtle)] font-mono">{token}</code>
    </div>
  );
}

/* ─── Typography specimen ─── */
function TypeSpecimen({ name, className, sample }: { name: string; className: string; sample?: string }) {
  return (
    <div className="flex items-baseline gap-6 py-2 border-b border-[var(--border-subtle)] last:border-0">
      <code className="text-[11px] text-[var(--fg-subtle)] font-mono w-28 shrink-0">{name}</code>
      <span className={className}>{sample ?? "ZaloPay AI Creative Platform"}</span>
    </div>
  );
}

export default function DesignSystemPage() {
  const [tab1, setTab1] = useState("overview");
  const [query, setQuery] = useState("");
  const [mockFile] = useState<File | null>(null);

  return (
    <div className="max-w-4xl px-6 py-8">

      {/* ─── Header ─── */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="primary" size="sm">v1.0</Badge>
          <Badge variant="accent" size="sm">Sprint 4</Badge>
        </div>
        <h1 className="text-[32px] font-bold text-[var(--fg-default)] tracking-tight mb-2">
          Design System
        </h1>
        <p className="text-[15px] text-[var(--fg-muted)] max-w-xl">
          A complete enterprise UI component library and token system for the ZaloPay AI Creative Platform.
          Every module must use these components — never implement styles independently.
        </p>
      </div>

      {/* ═══════════════ COLOR TOKENS ═══════════════ */}
      <DocSection
        title="Color Tokens"
        description="All colors are defined as CSS custom properties. Never hardcode hex values in components."
      >
        <div className="space-y-6">
          <Preview label="Brand">
            <ColorSwatch label="Brand Default"  token="--brand-default" />
            <ColorSwatch label="Brand Hover"    token="--brand-hover" />
            <ColorSwatch label="Brand Subtle"   token="--brand-subtle" />
            <ColorSwatch label="Accent Default" token="--accent-default" />
            <ColorSwatch label="Accent Subtle"  token="--accent-subtle" />
          </Preview>
          <Preview label="Background">
            <ColorSwatch label="bg-base"      token="--bg-base" />
            <ColorSwatch label="bg-surface-1" token="--bg-surface-1" />
            <ColorSwatch label="bg-surface-2" token="--bg-surface-2" />
            <ColorSwatch label="bg-surface-3" token="--bg-surface-3" />
          </Preview>
          <Preview label="Foreground">
            <ColorSwatch label="fg-default"  token="--fg-default" />
            <ColorSwatch label="fg-muted"    token="--fg-muted" />
            <ColorSwatch label="fg-subtle"   token="--fg-subtle" />
            <ColorSwatch label="fg-disabled" token="--fg-disabled" />
          </Preview>
          <Preview label="Semantic">
            <ColorSwatch label="Success"         token="--success-default" />
            <ColorSwatch label="Success Subtle"  token="--success-subtle" />
            <ColorSwatch label="Warning"         token="--warning-default" />
            <ColorSwatch label="Warning Subtle"  token="--warning-subtle" />
            <ColorSwatch label="Danger"          token="--danger-default" />
            <ColorSwatch label="Danger Subtle"   token="--danger-subtle" />
            <ColorSwatch label="Info"            token="--info-default" />
            <ColorSwatch label="Info Subtle"     token="--info-subtle" />
          </Preview>
        </div>
      </DocSection>

      {/* ═══════════════ TYPOGRAPHY ═══════════════ */}
      <DocSection title="Typography" description="Type scale with semantic CSS class names via @layer components.">
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden">
          <TypeSpecimen name=".type-display"    className="type-display"    sample="Display 40px" />
          <TypeSpecimen name=".type-heading-xl" className="type-heading-xl" sample="Heading XL 28px" />
          <TypeSpecimen name=".type-heading-l"  className="type-heading-l"  sample="Heading L 22px" />
          <TypeSpecimen name=".type-heading-m"  className="type-heading-m"  sample="Heading M 18px" />
          <TypeSpecimen name=".type-heading-s"  className="type-heading-s"  sample="Heading S 15px" />
          <TypeSpecimen name=".type-body-l"     className="type-body-l"     sample="Body L 15px — Regular text for primary reading" />
          <TypeSpecimen name=".type-body-m"     className="type-body-m"     sample="Body M 14px — Standard interface text" />
          <TypeSpecimen name=".type-body-s"     className="type-body-s"     sample="Body S 13px — Secondary / metadata" />
          <TypeSpecimen name=".type-caption"    className="type-caption"    sample="Caption 12px — Small labels and hints" />
          <TypeSpecimen name=".type-label"      className="type-label"      sample="Label 11px · Uppercase" />
        </div>
      </DocSection>

      {/* ═══════════════ BUTTONS ═══════════════ */}
      <DocSection title="Button" description="6 variants × 4 sizes. Supports loading, icons, and full-width.">
        <div className="space-y-6">
          <Preview label="Variants">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
          </Preview>
          <Preview label="Sizes">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Preview>
          <Preview label="With icons">
            <Button icon={<Plus size={14} />}>Add Module</Button>
            <Button variant="secondary" icon={<Download size={14} />}>Export</Button>
            <Button variant="ghost" icon={<Copy size={14} />} iconPosition="right">Copy link</Button>
            <Button variant="danger" icon={<Trash2 size={14} />}>Delete</Button>
          </Preview>
          <Preview label="States">
            <Button loading>Processing</Button>
            <Button disabled>Disabled</Button>
            <IconButton label="Settings" size="md"><Settings size={16} /></IconButton>
            <IconButton label="Notifications" variant="secondary" size="md"><Bell size={16} /></IconButton>
          </Preview>
          <Preview label="Generate Button (AI CTA)">
            <GenerateButton>Phân tích ngay</GenerateButton>
            <GenerateButton variant="gradient">Tạo banner</GenerateButton>
            <GenerateButton variant="accent" icon={<Star size={16} />}>Yêu thích</GenerateButton>
            <GenerateButton loading>Đang xử lý</GenerateButton>
          </Preview>
        </div>
      </DocSection>

      {/* ═══════════════ CARD ═══════════════ */}
      <DocSection title="Card" description="Composable card system with header, content, footer, and panel sections.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="default">
            <CardHeader action={<Badge variant="success">Live</Badge>}>
              <CardTitle>Brand Checker</CardTitle>
              <CardDescription>Kiểm tra tuân thủ thương hiệu ZaloPay</CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressBar value={78} showValue label="Compliance score" />
            </CardContent>
            <CardFooter>
              <Button size="sm" icon={<ArrowRight size={13} />} iconPosition="right">
                Xem chi tiết
              </Button>
            </CardFooter>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Uses shadow-2 instead of border</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <StatusBadge status="online" label="Đang hoạt động" />
                <StatusBadge status="loading" label="Đang phân tích" />
              </div>
            </CardContent>
          </Card>

          <Card variant="flat" padding="md">
            <CardTitle>Flat Card</CardTitle>
            <CardDescription>bg-surface-2, no border, no shadow</CardDescription>
          </Card>

          <Card variant="brand" padding="md">
            <CardTitle>Brand Card</CardTitle>
            <CardDescription>Highlighted with brand color border and subtle bg</CardDescription>
          </Card>
        </div>
      </DocSection>

      {/* ═══════════════ INPUTS ═══════════════ */}
      <DocSection title="Form Inputs" description="Input, Textarea, and SearchInput with label/hint/error states.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Tên thiết kế" placeholder="VD: Banner Tết 2025" hint="Không bắt buộc" />
          <Input label="Required Field" placeholder="Bắt buộc nhập" required />
          <Input
            label="Email"
            type="email"
            placeholder="user@zalopay.vn"
            error="Vui lòng nhập email hợp lệ"
          />
          <Input
            label="Với icon"
            placeholder="Tìm kiếm module..."
            icon={<Sparkles size={15} />}
          />
          <div className="md:col-span-2">
            <Textarea
              label="Mô tả prompt"
              placeholder="Nhập mô tả chi tiết về thiết kế bạn muốn tạo..."
              hint="Tối đa 500 ký tự"
            />
          </div>
          <div className="md:col-span-2">
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery("")}
              placeholder="Tìm kiếm trong Design System..."
            />
          </div>
        </div>
      </DocSection>

      {/* ═══════════════ BADGE ═══════════════ */}
      <DocSection title="Badge & Tag" description="Status labels, module tags, and removable tags.">
        <div className="space-y-5">
          <Preview label="Badge variants">
            <Badge variant="default">Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="accent">Accent</Badge>
          </Preview>
          <Preview label="Badge with dot">
            <Badge variant="success" dot>Online</Badge>
            <Badge variant="warning" dot>Beta</Badge>
            <Badge variant="danger" dot>Error</Badge>
            <Badge variant="primary" dot>Active</Badge>
          </Preview>
          <Preview label="Tag (removable)">
            <Tag variant="primary" onRemove={() => {}}>ZaloPay Blue</Tag>
            <Tag variant="accent" onRemove={() => {}}>AI Generated</Tag>
            <Tag variant="default" onRemove={() => {}}>Draft</Tag>
          </Preview>
        </div>
      </DocSection>

      {/* ═══════════════ STATUS INDICATORS ═══════════════ */}
      <DocSection title="Status Indicators" description="Dots and badge labels for real-time status communication.">
        <div className="space-y-5">
          <Preview label="StatusDot">
            <div className="flex items-center gap-1.5"><StatusDot status="online" />Online</div>
            <div className="flex items-center gap-1.5"><StatusDot status="offline" />Offline</div>
            <div className="flex items-center gap-1.5"><StatusDot status="loading" />Loading</div>
            <div className="flex items-center gap-1.5"><StatusDot status="warning" />Warning</div>
            <div className="flex items-center gap-1.5"><StatusDot status="danger" />Error</div>
          </Preview>
          <Preview label="StatusBadge">
            <StatusBadge status="online" label="Gemini 2.0 Active" />
            <StatusBadge status="loading" label="Đang phân tích..." />
            <StatusBadge status="success" label="Hoàn thành" />
            <StatusBadge status="danger" label="Lỗi kết nối" />
            <StatusBadge status="idle" label="Chờ xử lý" />
          </Preview>
        </div>
      </DocSection>

      {/* ═══════════════ PROGRESS ═══════════════ */}
      <DocSection title="Progress" description="ProgressBar, ScoreBar, and ProgressCircle with variant colors.">
        <div className="space-y-6">
          <Preview label="Progress Bar">
            <div className="w-full space-y-3">
              <ProgressBar value={78} variant="brand"   showValue label="Brand compliance" />
              <ProgressBar value={92} variant="success" showValue label="Color accuracy" />
              <ProgressBar value={45} variant="warning" showValue label="Typography score" />
              <ProgressBar value={22} variant="danger"  showValue label="Logo placement" />
            </div>
          </Preview>
          <Preview label="Score Bar (AI analysis 0–10)">
            <div className="w-full space-y-2">
              <ScoreBar score={8.5} />
              <ScoreBar score={5.2} />
              <ScoreBar score={2.8} />
            </div>
          </Preview>
          <Preview label="Progress Circle">
            <ProgressCircle value={78} variant="brand"   size={72} label="Brand" />
            <ProgressCircle value={92} variant="success" size={72} label="Color" />
            <ProgressCircle value={45} variant="warning" size={72} label="Type" />
            <ProgressCircle value={22} variant="danger"  size={72} label="Logo" />
          </Preview>
        </div>
      </DocSection>

      {/* ═══════════════ ALERTS ═══════════════ */}
      <DocSection title="Alert" description="4 variants for contextual feedback messages. Dismissible via onDismiss.">
        <div className="space-y-3">
          <Alert variant="info" title="Thông tin">
            Quy chuẩn thương hiệu đã được tải lên thành công.
          </Alert>
          <Alert variant="success" title="Phân tích hoàn thành">
            Thiết kế đạt 8.5/10 điểm tuân thủ thương hiệu ZaloPay.
          </Alert>
          <Alert variant="warning" title="Cảnh báo">
            Màu sắc sử dụng không đúng tỷ lệ theo brand guideline.
          </Alert>
          <Alert variant="danger" title="Lỗi phân tích" onDismiss={() => {}}>
            Không thể kết nối tới Gemini API. Vui lòng kiểm tra API key.
          </Alert>
        </div>
      </DocSection>

      {/* ═══════════════ AVATAR ═══════════════ */}
      <DocSection title="Avatar" description="User avatars with image or initial fallback. Supports AvatarGroup.">
        <div className="space-y-5">
          <Preview label="Sizes">
            <Avatar size="xs" name="Ngoc NA" />
            <Avatar size="sm" name="Ngoc NA" />
            <Avatar size="md" name="Ngoc NA" />
            <Avatar size="lg" name="Ngoc NA" />
            <Avatar size="xl" name="Ngoc NA" />
          </Preview>
          <Preview label="AvatarGroup">
            <AvatarGroup
              size="sm"
              avatars={[
                { name: "Ngoc NA" },
                { name: "Minh TT" },
                { name: "Lan PH" },
                { name: "Duc NQ" },
                { name: "Tuan LM" },
                { name: "An DT" },
              ]}
              max={4}
            />
          </Preview>
        </div>
      </DocSection>

      {/* ═══════════════ SPINNER & SKELETON ═══════════════ */}
      <DocSection title="Loading States" description="Spinner for in-progress actions. Skeleton for content placeholders.">
        <div className="space-y-6">
          <Preview label="Spinner sizes">
            <Spinner size="xs" />
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
            <Spinner size="xl" />
          </Preview>
          <Preview label="Skeleton" className="flex-col items-stretch">
            <SkeletonCard />
          </Preview>
        </div>
      </DocSection>

      {/* ═══════════════ TABS ═══════════════ */}
      <DocSection title="Tabs" description="3 variants: underline (Linear style), pill (Vercel style), outline.">
        <div className="space-y-8">
          <div>
            <p className="type-label text-[var(--fg-subtle)] mb-3">Underline (default)</p>
            <Tabs
              variant="underline"
              value={tab1}
              onChange={setTab1}
              items={[
                { id: "overview",  label: "Overview",   badge: 3 },
                { id: "analysis",  label: "Analysis" },
                { id: "history",   label: "History",    badge: 12 },
                { id: "settings",  label: "Settings" },
              ]}
            >
              {(id) => (
                <div className="text-[13px] text-[var(--fg-muted)] py-2">
                  Content for tab: <strong className="text-[var(--fg-default)]">{id}</strong>
                </div>
              )}
            </Tabs>
          </div>

          <div>
            <p className="type-label text-[var(--fg-subtle)] mb-3">Pill</p>
            <Tabs
              variant="pill"
              defaultValue="all"
              items={[
                { id: "all",     label: "All" },
                { id: "images",  label: "Images" },
                { id: "banners", label: "Banners" },
                { id: "videos",  label: "Videos",  disabled: true },
              ]}
            />
          </div>

          <div>
            <p className="type-label text-[var(--fg-subtle)] mb-3">Outline</p>
            <Tabs
              variant="outline"
              defaultValue="light"
              items={[
                { id: "light",  label: "Light" },
                { id: "dark",   label: "Dark" },
                { id: "system", label: "System" },
              ]}
            />
          </div>
        </div>
      </DocSection>

      {/* ═══════════════ DROPDOWN ═══════════════ */}
      <DocSection title="Dropdown" description="Keyboard-accessible contextual menu with icons, shortcuts, and destructive items.">
        <Preview label="Example">
          <Dropdown
            trigger={<Button variant="secondary" icon={<Settings size={14} />}>Actions</Button>}
            items={[
              { id: "edit",     label: "Edit",     icon: <Copy size={14} />,     shortcut: "⌘E" },
              { id: "duplicate",label: "Duplicate",icon: <Layers size={14} />,   shortcut: "⌘D" },
              { id: "download", label: "Download", icon: <Download size={14} />  },
              { id: "---",      label: "---" },
              { id: "delete",   label: "Delete",   icon: <Trash2 size={14} />,   destructive: true },
            ]}
            onSelect={(id) => console.log("Selected:", id)}
          />
        </Preview>
      </DocSection>

      {/* ═══════════════ ACCORDION ═══════════════ */}
      <DocSection title="Accordion" description="Collapsible sections for settings and FAQ-style content.">
        <Accordion
          defaultOpen={["logo"]}
          items={[
            {
              id: "logo",
              title: "Logo Compliance",
              subtitle: "Kiểm tra vị trí và kích thước logo",
              icon: <Target size={16} />,
              children: (
                <div className="space-y-2 text-[13px]">
                  <p>Logo phải xuất hiện ở góc trên trái hoặc trên phải của thiết kế.</p>
                  <p>Kích thước tối thiểu: 60px chiều cao. Không được che khuất hoặc méo logo.</p>
                </div>
              ),
            },
            {
              id: "colors",
              title: "Color Rules",
              subtitle: "Tỷ lệ màu sắc theo brand guideline",
              children: "Primary #0033C9 chiếm tối thiểu 30% diện tích màu sắc chủ đạo.",
            },
            {
              id: "typography",
              title: "Typography Standards",
              subtitle: "Font chữ và hierarchy",
              children: "Tiêu đề dùng SVN-Gilroy Bold, nội dung dùng SVN-Gilroy Regular.",
            },
          ]}
        />
      </DocSection>

      {/* ═══════════════ TOOLTIP ═══════════════ */}
      <DocSection title="Tooltip" description="Hover labels for icon buttons and truncated content.">
        <Preview label="Positions">
          <Tooltip content="Phân tích thiết kế" position="top">
            <Button variant="ghost" size="sm">Top</Button>
          </Tooltip>
          <Tooltip content="Xuất báo cáo PDF" position="bottom">
            <Button variant="ghost" size="sm">Bottom</Button>
          </Tooltip>
          <Tooltip content="Lưu vào favorites" position="left">
            <Button variant="ghost" size="sm">Left</Button>
          </Tooltip>
          <Tooltip content="Chia sẻ kết quả" position="right">
            <Button variant="ghost" size="sm">Right</Button>
          </Tooltip>
        </Preview>
      </DocSection>

      {/* ═══════════════ UPLOAD ═══════════════ */}
      <DocSection title="Upload Area & File Card" description="Drag-drop upload zone with file preview cards.">
        <div className="space-y-4">
          <UploadArea
            className="p-0"
            onFiles={(files) => console.log("Files:", files)}
          />
        </div>
      </DocSection>

      {/* ═══════════════ EMPTY STATE ═══════════════ */}
      <DocSection title="Empty State" description="Placeholder content for empty lists, search misses, and first-run states.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="default" padding="none">
            <EmptyState
              icon={Target}
              title="Chưa có phân tích nào"
              description="Tải lên thiết kế đầu tiên để bắt đầu kiểm tra brand compliance."
              action={<Button size="sm" icon={<Plus size={14} />}>Upload thiết kế</Button>}
            />
          </Card>
          <Card variant="default" padding="none">
            <EmptyState
              icon={Star}
              title="Chưa có favorites"
              description="Lưu kết quả phân tích yêu thích để xem lại sau."
              size="sm"
            />
          </Card>
        </div>
      </DocSection>

      {/* ═══════════════ SPACING & RADIUS ═══════════════ */}
      <DocSection title="Spacing & Radius" description="8px grid system. 6 radius tokens from 4px to full.">
        <div className="space-y-6">
          <Preview label="Spacing scale (8px grid)">
            {[4, 8, 12, 16, 24, 32, 40, 48, 64, 80].map((px) => (
              <div key={px} className="flex flex-col items-center gap-1">
                <div
                  className="bg-[var(--brand-default)] rounded-[var(--radius-xs)]"
                  style={{ width: px, height: px }}
                />
                <span className="text-[10px] text-[var(--fg-subtle)]">{px}</span>
              </div>
            ))}
          </Preview>
          <Preview label="Radius tokens">
            {(["xs", "sm", "md", "lg", "xl", "2xl", "full"] as const).map((r) => {
              const vals: Record<string, string> = {
                xs: "4px", sm: "6px", md: "10px", lg: "14px", xl: "18px", "2xl": "24px", full: "9999px",
              };
              return (
                <div key={r} className="flex flex-col items-center gap-1">
                  <div
                    className="w-10 h-10 bg-[var(--bg-surface-3)] border border-[var(--border-default)]"
                    style={{ borderRadius: vals[r] }}
                  />
                  <span className="text-[10px] text-[var(--fg-subtle)]">{r}</span>
                  <span className="text-[9px] text-[var(--fg-disabled)]">{vals[r]}</span>
                </div>
              );
            })}
          </Preview>
        </div>
      </DocSection>

      {/* ═══════════════ SHADOWS ═══════════════ */}
      <DocSection title="Shadows / Elevation" description="5 elevation levels. Use shadow-modal only for overlays.">
        <div className="flex flex-wrap gap-6">
          {(["shadow-1", "shadow-2", "shadow-3", "shadow-hover", "shadow-modal"] as const).map((s) => (
            <div key={s} className="flex flex-col items-center gap-3">
              <div
                className={`w-20 h-20 bg-[var(--bg-surface-1)] rounded-[var(--radius-lg)] ${s}`}
              />
              <span className="text-[11px] text-[var(--fg-subtle)]">{s}</span>
            </div>
          ))}
        </div>
      </DocSection>

      {/* ═══════════════ ANIMATION ═══════════════ */}
      <DocSection title="Animations" description="Standard easing and duration tokens. Use CSS var()—never hardcode ms values.">
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden">
          {[
            { name: "--duration-fast",   value: "150ms", use: "Hover, focus, color transitions" },
            { name: "--duration-normal", value: "250ms", use: "Expand/collapse, slide animations" },
            { name: "--duration-slow",   value: "400ms", use: "Page transitions, large reveals" },
            { name: "--ease",            value: "cubic-bezier(0.4,0,0.2,1)", use: "General purpose" },
            { name: "--ease-spring",     value: "cubic-bezier(0.34,1.56,0.64,1)", use: "Bouncy, playful" },
          ].map(({ name, value, use }) => (
            <div
              key={name}
              className="flex items-center gap-4 px-5 py-3 border-b border-[var(--border-subtle)] last:border-0"
            >
              <code className="text-[12px] font-mono text-[var(--brand-default)] w-44 shrink-0">{name}</code>
              <code className="text-[12px] font-mono text-[var(--fg-muted)] w-52 shrink-0">{value}</code>
              <span className="text-[13px] text-[var(--fg-subtle)]">{use}</span>
            </div>
          ))}
        </div>
      </DocSection>

      {/* ═══════════════ USAGE GUIDE ═══════════════ */}
      <DocSection title="Component Usage Guide" description="Where each component is used across the platform.">
        <div className="space-y-2">
          {[
            { component: "Button — primary",       usage: "GenerateButton, Analyze, Export PDF, Save, Submit forms" },
            { component: "Button — secondary",     usage: "Cancel, Back, Show more, Filter options" },
            { component: "Button — ghost",         usage: "Icon buttons, nav items, inline actions" },
            { component: "Button — danger",        usage: "Delete, Remove, Disconnect API key" },
            { component: "GenerateButton",         usage: "Right panel main CTA — always the bottom-most button" },
            { component: "Card",                   usage: "Dashboard stat cards, module cards, history items" },
            { component: "PanelSection",           usage: "Groups settings in the right panel" },
            { component: "Input",                  usage: "Design name, API keys, search, settings forms" },
            { component: "Badge",                  usage: "Module status (Soon/Beta/New), score labels, tags" },
            { component: "StatusBadge",            usage: "API connection status, analysis state, online presence" },
            { component: "ProgressBar / ScoreBar", usage: "Brand compliance scores, upload progress, category scores" },
            { component: "Tabs (underline)",       usage: "Module sections — Overview / Analysis / History / Settings" },
            { component: "Tabs (pill)",            usage: "Filter toggles — All / Images / Banners" },
            { component: "Alert",                  usage: "API errors, warnings, success confirmations" },
            { component: "EmptyState",             usage: "History tab (empty), Favorites (empty), no search results" },
            { component: "Skeleton",               usage: "While loading: dashboard stats, history list, brand panel" },
            { component: "UploadArea",             usage: "Brand Checker upload zone, Banner Generator, Image input" },
            { component: "Accordion",              usage: "Right panel settings groups, FAQ, detailed category breakdown" },
            { component: "Dropdown",               usage: "More actions (...) menus on cards and history items" },
            { component: "Tooltip",                usage: "Icon button labels, truncated text, keyboard shortcuts" },
          ].map(({ component, usage }) => (
            <div
              key={component}
              className="flex gap-4 items-start px-4 py-3 rounded-[var(--radius-md)] hover:bg-[var(--bg-surface-2)] transition-colors"
            >
              <Badge variant="primary" size="sm" className="mt-0.5 shrink-0">{component}</Badge>
              <span className="text-[13px] text-[var(--fg-muted)]">{usage}</span>
            </div>
          ))}
        </div>
      </DocSection>

      <div className="py-8 text-center">
        <p className="text-[12px] text-[var(--fg-subtle)]">
          ZaloPay AI Creative Platform · Design System v1.0 · Sprint 4
        </p>
      </div>
    </div>
  );
}
