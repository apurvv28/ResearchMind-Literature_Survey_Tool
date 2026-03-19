"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (topic: string) => void;
  suggestions: string[];
  className?: string;
};

export function SearchInput({
  value,
  onValueChange,
  onSubmit,
  suggestions,
  className,
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const filteredSuggestions = useMemo(() => {
    if (!value.trim()) {
      return suggestions.slice(0, 5);
    }

    const query = value.toLowerCase();
    return suggestions
      .filter((item) => item.toLowerCase().includes(query))
      .slice(0, 5);
  }, [suggestions, value]);

  const showSuggestions = isFocused && filteredSuggestions.length > 0;

  return (
    <div className={cn("relative w-full", className)}>
      <label htmlFor="topic-input" className="sr-only">
        Enter research topic
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-4 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        id="topic-input"
        value={value}
        placeholder="Enter research topic..."
        aria-label="Enter research topic"
        onChange={(event) => onValueChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setTimeout(() => setIsFocused(false), 120);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSubmit(value);
          }
        }}
        className="h-14 rounded-2xl border-border bg-card pl-12 text-base shadow-[0_12px_30px_-24px_rgba(22,55,52,0.35)]"
      />

      {showSuggestions ? (
        <div
          role="listbox"
          aria-label="Trending topic suggestions"
          className="absolute top-[calc(100%+10px)] left-0 z-30 w-full overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-[0_24px_50px_-34px_rgba(22,55,52,0.4)]"
        >
          {filteredSuggestions.map((item) => (
            <button
              key={item}
              type="button"
              role="option"
              className="w-full rounded-xl px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-secondary"
              onMouseDown={(event) => {
                event.preventDefault();
                onValueChange(item);
                onSubmit(item);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
