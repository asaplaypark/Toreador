import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string>;
};

function buildUrl(basePath: string, searchParams: Record<string, string>, page: number) {
  const p = new URLSearchParams(searchParams);
  if (page === 1) {
    p.delete("page");
  } else {
    p.set("page", String(page));
  }
  const qs = p.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  // Always include first 2 and last 2
  pages.add(1);
  pages.add(2);
  pages.add(total - 1);
  pages.add(total);
  // Window around current
  pages.add(Math.max(1, current - 1));
  pages.add(current);
  pages.add(Math.min(total, current + 1));

  const sorted = Array.from(pages).sort((a, b) => a - b);

  const result: (number | "...")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push("...");
    }
    result.push(sorted[i]);
  }
  return result;
}

export default function Pagination({ currentPage, totalPages, basePath, searchParams }: Props) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const btnBase =
    "flex h-8 min-w-[2rem] items-center justify-center rounded-md px-2 text-sm transition-colors";
  const btnActive = `${btnBase} bg-sepia text-white font-medium`;
  const btnDefault = `${btnBase} border border-sepia-pale/60 text-sepia-dark hover:bg-sepia-cream hover:border-sepia-pale`;
  const btnDisabled = `${btnBase} border border-sepia-pale/30 text-sepia-pale/50 pointer-events-none`;
  const btnEllipsis = `${btnBase} text-muted-foreground pointer-events-none`;

  return (
    <nav className="flex flex-wrap items-center justify-center gap-1.5 py-4" aria-label="Pagination">
      {hasPrev ? (
        <Link href={buildUrl(basePath, searchParams, currentPage - 1)} className={btnDefault} aria-label="หน้าก่อนหน้า">
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={btnDisabled} aria-disabled="true">
          <ChevronLeft className="size-4" />
        </span>
      )}

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className={btnEllipsis}>…</span>
        ) : (
          <Link
            key={p}
            href={buildUrl(basePath, searchParams, p)}
            className={p === currentPage ? btnActive : btnDefault}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </Link>
        )
      )}

      {hasNext ? (
        <Link href={buildUrl(basePath, searchParams, currentPage + 1)} className={btnDefault} aria-label="หน้าถัดไป">
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={btnDisabled} aria-disabled="true">
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
