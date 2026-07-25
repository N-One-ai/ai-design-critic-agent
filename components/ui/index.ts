/* ═══════════════════════════════════════════════════════
   ZaloPay AI Creative Platform — UI Component Library
   ═══════════════════════════════════════════════════════ */

/* Buttons */
export { Button, IconButton }           from "./button";
export type { ButtonProps, ButtonVariant, ButtonSize, IconButtonProps } from "./button";

/* Card primitives */
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardDivider, PanelSection } from "./card";
export type { CardProps, CardVariant, CardPadding, PanelSectionProps } from "./card";

/* Form inputs */
export { Input, Textarea, SearchInput }  from "./input";
export type { InputProps, TextareaProps, SearchInputProps } from "./input";

/* Badge + Tag */
export { Badge, Tag }                    from "./badge";
export type { BadgeProps, BadgeVariant, BadgeSize, TagProps } from "./badge";

/* Feedback */
export { Spinner, LoadingOverlay }       from "./spinner";
export type { SpinnerProps, SpinnerSize } from "./spinner";

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonImage,
}                                        from "./skeleton";

export { Alert }                         from "./alert";
export type { AlertProps, AlertVariant } from "./alert";

/* Data display */
export { Avatar, AvatarGroup }           from "./avatar";
export type { AvatarProps, AvatarSize }  from "./avatar";

export { ProgressBar, ScoreBar, ProgressCircle } from "./progress";
export type { ProgressBarProps, ProgressCircleProps, ProgressVariant } from "./progress";

export { StatusDot, StatusBadge }        from "./status-indicator";
export type { StatusDotProps, StatusBadgeProps, StatusType, StatusSize } from "./status-indicator";

/* Interactive */
export { Tabs }                          from "./tabs";
export type { TabsProps, TabItem, TabsVariant } from "./tabs";

export { Dropdown }                      from "./dropdown";
export type { DropdownProps, DropdownItem } from "./dropdown";

export { Accordion }                     from "./accordion";
export type { AccordionProps, AccordionItem } from "./accordion";

export { Tooltip }                       from "./tooltip";
export type { TooltipProps, TooltipPosition } from "./tooltip";

/* Specialized */
export { GenerateButton }                from "./generate-button";
export type { GenerateButtonProps, GenerateButtonVariant } from "./generate-button";

export { UploadArea, FileCard }          from "./upload-area";
export type { UploadAreaProps, FileCardProps } from "./upload-area";

export { EmptyState }                    from "./empty-state";
export type { EmptyStateProps }          from "./empty-state";

/* Layout */
export {
  WorkspaceHeader,
  Section,
  PageContainer,
  SectionDivider,
}                                        from "./section";
export type { WorkspaceHeaderProps, SectionProps } from "./section";
