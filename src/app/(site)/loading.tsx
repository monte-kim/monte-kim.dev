import { Spinner } from "@/components/icons";

export default function SiteLoading() {
  return (
    <div className="flex justify-center py-24">
      <Spinner size={22} className="text-muted" />
    </div>
  );
}
