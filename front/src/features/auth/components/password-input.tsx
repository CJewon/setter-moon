"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/utils/cn";

type PasswordInputProps = {
  id: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  describedBy?: string;
  hasError?: boolean;
};

export function PasswordInput({ id, name, autoComplete, describedBy, hasError }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        className={cn(
          "min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 pr-11 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
          hasError && "border-red-300 focus:border-red-500 focus:ring-red-100"
        )}
        type={isVisible ? "text" : "password"}
        autoComplete={autoComplete}
        aria-describedby={describedBy}
        required
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center rounded-r-md text-slate-500 transition hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
        onClick={() => setIsVisible((value) => !value)}
        aria-label={isVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
      >
        {isVisible ? <EyeOff aria-hidden size={18} /> : <Eye aria-hidden size={18} />}
      </button>
    </div>
  );
}
