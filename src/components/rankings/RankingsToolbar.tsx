import { useEffect, useState } from "react";
import { ArrowUpDown, Check, Columns3, Copy, Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Menu, MenuItem, MenuPanel, MenuTrigger } from "@/components/ui/menu";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ALL_COLUMNS,
  REQUIRED_COLUMNS,
  SORTS,
  type ColumnKey,
  type Filters,
  type SortKey,
  type View,
} from "@/lib/filters";
import type { Band, SchoolType } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLUMN_LABELS: Record<ColumnKey, string> = {
  rank: "#",
  school: "School",
  type: "Type",
  env: "School Environment",
  infra: "Infrastructure",
  cost: "Net Cost",
  benefit: "Net Benefit",
  score: "Overall",
};

const BANDS: { value: Band | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "strong", label: "Strong" },
  { value: "fair", label: "Fair" },
  { value: "weak", label: "Weak" },
];

const TYPES: { value: SchoolType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Public", label: "Public" },
  { value: "Private", label: "Private" },
];

/**
 * Search, sort, filter, and column visibility.
 *
 * Debounces the search input by 150ms. Without it, every keystroke re-filters
 * and rewrites the URL; 150ms is short enough to feel instant and long enough
 * to stop the URL rewriting thrashing history.
 *
 * All state is URL-backed (`hooks/useRankings.ts`), so this component holds no
 * filter state of its own — only the undebounced text of the input.
 */
export function RankingsToolbar({
  filters,
  sort,
  columns,
  view,
  shown,
  total,
  isFiltered,
  onQuery,
  onType,
  onBand,
  onSort,
  onView,
  onToggleColumn,
  onReset,
}: {
  filters: Filters;
  sort: SortKey;
  columns: ColumnKey[];
  view: View;
  shown: number;
  total: number;
  isFiltered: boolean;
  onQuery: (q: string) => void;
  onType: (t: Filters["type"]) => void;
  onBand: (b: Filters["band"]) => void;
  onSort: (s: SortKey) => void;
  onView: (v: View) => void;
  onToggleColumn: (c: ColumnKey) => void;
  onReset: () => void;
}) {
  /**
   * The input holds its own text so typing is not blocked by the 150ms debounce,
   * while `filters.q` is the committed URL state.
   *
   * The sync happens during render, not in an effect. This is React's supported
   * pattern for "reset local state when a prop changes", and it avoids the
   * cascading render that `useEffect(() => setText(q), [q])` causes. It fires
   * when the URL changes underneath us: Back, a pasted link, or Reset.
   */
  const [text, setText] = useState(filters.q);
  const [syncedQuery, setSyncedQuery] = useState(filters.q);
  const [copied, setCopied] = useState(false);
  if (syncedQuery !== filters.q) {
    setSyncedQuery(filters.q);
    setText(filters.q);
  }

  // Debounce the text into the URL. Writing the URL is a side effect on an
  // external system, so an effect is the right tool here.
  useEffect(() => {
    if (text === filters.q) return;
    const id = setTimeout(() => onQuery(text), 150);
    return () => clearTimeout(id);
  }, [text, filters.q, onQuery]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard unavailable; silently no-op. */
    }
  };

  /*
    The red-flags view is a curated list with no table, so the search / sort /
    column / filter controls — which all operate on the ranked table — do not
    apply there. Only the view toggle is shown. Hooks above always run, so
    this early return is safe.
  */
  if (view === "redflags") {
    return (
      <div className="flex flex-col gap-4">
        <ToggleGroup
          type="single"
          variant="outline"
          value={view}
          onValueChange={(v) => v && onView(v as View)}
          aria-label="Choose which schools to show"
          className="w-fit"
        >
          <ToggleGroupItem value="redflags">Red flags</ToggleGroupItem>
          <ToggleGroupItem value="all">All schools</ToggleGroupItem>
        </ToggleGroup>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/*
        The view toggle comes first because it is the coarsest control on the
        page: three red-flag schools or all forty-two. URL-backed like
        everything else here, so `?view=all` is shareable and Back works.
      */}
      <ToggleGroup
        type="single"
        variant="outline"
        value={view}
        onValueChange={(v) => v && onView(v as View)}
        aria-label="Choose which schools to show"
        className="w-fit"
      >
        <ToggleGroupItem value="redflags">Red flags</ToggleGroupItem>
        <ToggleGroupItem value="all">All schools</ToggleGroupItem>
      </ToggleGroup>

      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
          />
          <Input
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search schools"
            aria-label="Search schools by name or location"
            className="pl-9"
          />
        </div>

        {/* Sort — desktop menu, mobile inside the sheet */}
        <div className="hidden md:block">
          <Menu>
            <MenuTrigger>
              <ArrowUpDown aria-hidden="true" />
              Sort
            </MenuTrigger>
            <MenuPanel label="Sort by">
              {SORTS.map((option) => (
                <MenuItem key={option.key} checked={sort === option.key} onSelect={() => onSort(option.key)}>
                  {option.label}
                </MenuItem>
              ))}
            </MenuPanel>
          </Menu>
        </div>

        {/* Columns — desktop only. On mobile every column is a filter, not a
            display choice, so this control does not apply. */}
        <div className="hidden lg:block">
          <Menu>
            <MenuTrigger>
              <Columns3 aria-hidden="true" />
              Columns
            </MenuTrigger>
            <MenuPanel label="Columns">
              {ALL_COLUMNS.map((key) => (
                <MenuItem
                  key={key}
                  checked={columns.includes(key)}
                  // The two required columns cannot be switched off; a table
                  // with neither a name nor a score is not a table.
                  disabled={REQUIRED_COLUMNS.includes(key)}
                  onSelect={() => onToggleColumn(key)}
                >
                  {COLUMN_LABELS[key]}
                </MenuItem>
              ))}
            </MenuPanel>
          </Menu>
        </div>

        {/* Filters — mobile only, in a bottom sheet */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="lg" className="h-11">
                <SlidersHorizontal aria-hidden="true" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85dvh] gap-6 pb-8">
              <SheetHeader>
                <SheetTitle className="type-heading text-left">Filter</SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-3">
                <span className="type-label text-ink-muted">Type</span>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={filters.type}
                  onValueChange={(v) => v && onType(v as Filters["type"])}
                  className="w-full"
                >
                  {TYPES.map((t) => (
                    <ToggleGroupItem key={t.value} value={t.value} className="flex-1">
                      {t.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <div className="flex flex-col gap-3">
                <span className="type-label text-ink-muted">Score band</span>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={filters.band}
                  onValueChange={(v) => v && onBand(v as Filters["band"])}
                  className="w-full"
                >
                  {BANDS.map((b) => (
                    <ToggleGroupItem key={b.value} value={b.value} className="flex-1">
                      {b.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <div className="flex flex-col gap-3">
                <span className="type-label text-ink-muted">Sort by</span>
                <div className="flex flex-col">
                  {SORTS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => onSort(option.key)}
                      className={cn(
                        "flex items-center justify-between border-b border-rule-soft py-3 text-left type-ui transition-colors",
                        sort === option.key ? "text-bronze-ink" : "text-ink-muted",
                      )}
                    >
                      {option.label}
                      {sort === option.key ? <span aria-hidden="true">✓</span> : null}
                    </button>
                  ))}
                </div>
              </div>

              <SheetClose asChild>
                <Button variant="default" className="w-full">
                  Show {shown} of {total} schools
                </Button>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>

        {isFiltered ? (
          <Button variant="link" onClick={onReset} className="shrink-0">
            <X aria-hidden="true" />
            Clear
          </Button>
        ) : null}

        {/* Share the current view — state is URL-backed, so the link is the view. */}
        <Button variant="outline" size="sm" onClick={copyLink} className="shrink-0">
          {copied ? (
            <>
              <Check aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy aria-hidden="true" />
              Copy link
            </>
          )}
        </Button>
      </div>

      {/* Result count + removable filter chips. `aria-live` so a screen-reader
          user hears the table change after filtering, not just sees it. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p aria-live="polite" className="type-caption text-ink-muted">
          Showing <span className="type-numeric-sm text-ink">{shown}</span> of {total} schools
          {" · "}
          <span className="text-ink-muted">
            sorted by {SORTS.find((s) => s.key === sort)?.label ?? "rank"}
          </span>
        </p>
        {filters.band !== "all" ? (
          <button
            type="button"
            onClick={() => onBand("all")}
            className="inline-flex items-center gap-1 rounded-sm border border-rule-soft bg-surface px-2 py-0.5 type-caption text-ink-muted transition-colors hover:text-ink"
            aria-label="Remove band filter"
          >
            {bandLabel(filters.band)}
            <X aria-hidden="true" className="size-3" />
          </button>
        ) : null}
        {filters.type !== "all" ? (
          <button
            type="button"
            onClick={() => onType("all")}
            className="inline-flex items-center gap-1 rounded-sm border border-rule-soft bg-surface px-2 py-0.5 type-caption text-ink-muted transition-colors hover:text-ink"
            aria-label="Remove type filter"
          >
            {filters.type}
            <X aria-hidden="true" className="size-3" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function bandLabel(band: Band): string {
  return band === "strong" ? "Strong" : band === "fair" ? "Fair" : "Weak";
}
