
import { GlobalSearch } from "@/components/common/GlobalSearch";
import { Search } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
            <div className="inline-block bg-primary/10 text-primary rounded-full p-4 mb-4">
                <Search className="h-12 w-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
                Search Everything
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Find exactly what you're looking for across all subjects and chapters.
            </p>
        </header>

        <main className="max-w-4xl mx-auto">
            <GlobalSearch />
        </main>
    </div>
  );
}
