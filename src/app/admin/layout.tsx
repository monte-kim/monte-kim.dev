import type { Metadata } from "next";
import { Toaster } from "@/components/toast";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh">
      {children}
      <Toaster />
    </div>
  );
}
