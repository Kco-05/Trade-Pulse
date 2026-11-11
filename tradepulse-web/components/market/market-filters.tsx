"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type MarketFilter = "all" | "gainers" | "losers" | "watchlist";

type MarketFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  filter: MarketFilter;
  onFilterChange: (value: MarketFilter) => void;
};

const FILTER_OPTIONS: { value: MarketFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "gainers", label: "Gainers" },
  { value: "losers", label: "Losers" },
  { value: "watchlist", label: "Watchlist" },
];

export function MarketFilters({
  search,
  onSearchChange,
  filter,
  onFilterChange,
}: MarketFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search ticker or company"
          aria-label="Search stocks"
          className="h-9 pl-8"
        />
      </div>

      <ToggleGroup
        value={[filter]}
        onValueChange={(values) => {
          const next = values[0] as MarketFilter | undefined;
          if (next) onFilterChange(next);
        }}
        variant="outline"
        size="sm"
        className="flex-wrap"
      >
        {FILTER_OPTIONS.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
