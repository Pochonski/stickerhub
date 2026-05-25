"use client";

import { AppShell } from "@/components/layout/AppShell";
import { FlipbookViewer } from "@/components/album/FlipbookViewer";

export default function FlipbookPage() {
  return (
    <AppShell>
      <FlipbookViewer />
    </AppShell>
  );
}
