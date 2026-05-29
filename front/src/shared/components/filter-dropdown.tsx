"use client";

import Link from "next/link";
import type { Route } from "next";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/shared/utils/cn";

export type FilterDropdownOption = {
  label: string;
  value: string;
};

type FilterDropdownProps = {
  ariaLabel: string;
  defaultValue?: string;
  getOptionHref?: (value: string) => Route;
  options: FilterDropdownOption[];
  selectedValue?: string;
};

export function FilterDropdown({ ariaLabel, defaultValue = "", getOptionHref, options, selectedValue }: FilterDropdownProps) {
  const dropdownId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelectedValue, setInternalSelectedValue] = useState(defaultValue);
  const currentValue = selectedValue ?? internalSelectedValue;
  const selectedOption = options.find((option) => option.value === currentValue) ?? options[0];

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        className={cn(
          "flex min-h-10 w-full items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 text-left text-sm font-medium text-slate-800 shadow-sm transition",
          "hover:border-blue-300 hover:bg-blue-50/30",
          "focus:outline-none focus:ring-2 focus:ring-blue-200",
          isOpen && "border-blue-400 ring-2 ring-blue-100"
        )}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={dropdownId}
        onClick={() => setIsOpen((value) => !value)}
      >
        <span className="min-w-0 truncate">{selectedOption?.label}</span>
        <ChevronDown
          aria-hidden
          size={17}
          className={cn("shrink-0 text-slate-500 transition", isOpen && "rotate-180 text-blue-600")}
        />
      </button>

      {isOpen ? (
        <div
          id={dropdownId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-64 overflow-auto rounded-md border border-slate-200 bg-white p-1 shadow-xl shadow-slate-900/15"
        >
          {options.map((option) => {
            const selected = option.value === currentValue;
            const className = cn(
              "flex min-h-10 w-full items-center justify-between gap-2 rounded-md px-3 text-left text-sm transition",
              selected ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-700 hover:bg-slate-50"
            );
            const content = (
              <>
                <span className="min-w-0 truncate">{option.label}</span>
                {selected ? <Check aria-hidden size={16} className="shrink-0" /> : null}
              </>
            );

            if (getOptionHref) {
              return (
                <Link
                  key={option.value}
                  role="option"
                  aria-selected={selected}
                  className={className}
                  href={getOptionHref(option.value)}
                  onClick={() => setIsOpen(false)}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                className={className}
                onClick={() => {
                  setInternalSelectedValue(option.value);
                  setIsOpen(false);
                }}
              >
                {content}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
