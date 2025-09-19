
import { GlobalSearch } from "@/components/common/GlobalSearch";
import { Search } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
        <main className="max-w-4xl mx-auto">
            <GlobalSearch />
        </main>
    </div>
  );
}
