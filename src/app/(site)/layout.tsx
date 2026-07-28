import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SearchModal } from "@/components/search-modal";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <SearchModal />
    </div>
  );
}
