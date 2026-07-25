import { ShellClient } from "@/components/shell/shell-client";
import type { ReactNode } from "react";

export default function ShellLayout({ children }: { children: ReactNode }) {
  return <ShellClient>{children}</ShellClient>;
}
