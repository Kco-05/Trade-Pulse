"use client";

import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WatchlistButtonProps = {
  ticker: string;
  starred: boolean;
  onToggle: (ticker: string) => void;
};

export function WatchlistButton({
  ticker,
  starred,
  onToggle,
}: WatchlistButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={starred ? `Remove ${ticker} from watchlist` : `Add ${ticker} to watchlist`}
      aria-pressed={starred}
      onClick={() => onToggle(ticker)}
      className="text-muted-foreground hover:text-foreground"
    >
      <Star
        className={cn(
          "size-4",
          starred && "fill-emerald-400 text-emerald-400",
        )}
      />
    </Button>
  );
}
