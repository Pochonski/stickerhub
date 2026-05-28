"use client";

import { AppShell } from "@/presentation/components/layout/AppShell";
import { FlipbookViewer } from "@/presentation/components/album/FlipbookViewer";

export default function FlipbookPage() {
  return (
    <AppShell>
      <FlipbookViewer />
    </AppShell>
  );
}
