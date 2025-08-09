import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  currentPageName: string;
  className?: string;
}

export function Breadcrumbs({ items, currentPageName, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("mb-6", className)}>
      <ol className="flex items-center space-x-1 text-sm text-muted-foreground">
        <li>
          <Link
            href="/"
            className="hover:text-foreground transition-colors"
          >
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRight className="h-4 w-4" />
              <Link
                href={item.href}
                className="ml-1 hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            </div>
          </li>
        ))}
        <li>
          <div className="flex items-center">
            <ChevronRight className="h-4 w-4" />
            <span className="ml-1 text-foreground font-medium">
              {currentPageName}
            </span>
          </div>
        </li>
      </ol>
    </nav>
  );
}
