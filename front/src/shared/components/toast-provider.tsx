"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { cn } from "@/shared/utils/cn";

export type ToastTone = "success" | "error" | "info";

type ToastInput = {
  message: string;
  tone?: ToastTone;
  title?: string;
  durationMs?: number;
};

type ToastItem = Required<Pick<ToastInput, "message" | "tone">> &
  Pick<ToastInput, "title" | "durationMs"> & {
    id: number;
  };

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
  dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

const toneStyle: Record<ToastTone, { icon: typeof CheckCircle2; className: string; title: string }> = {
  success: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-950",
    title: "완료"
  },
  error: {
    icon: AlertCircle,
    className: "border-red-200 bg-red-50 text-red-950",
    title: "확인 필요"
  },
  info: {
    icon: Info,
    className: "border-blue-200 bg-blue-50 text-blue-950",
    title: "알림"
  }
};

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const style = toneStyle[toast.tone];
  const Icon = style.icon;

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), toast.durationMs ?? 4000);

    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.durationMs, toast.id]);

  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className={cn(
        "grid w-full grid-cols-[auto_1fr_auto] gap-3 rounded-md border p-4 text-sm shadow-lg shadow-slate-900/10",
        style.className
      )}
    >
      <Icon aria-hidden className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0">
        <p className="font-semibold">{toast.title ?? style.title}</p>
        <p className="mt-1 break-words leading-5 text-slate-700">{toast.message}</p>
      </div>
      <button
        type="button"
        className="inline-flex size-7 items-center justify-center rounded text-slate-500 transition hover:bg-white/70 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
        onClick={() => onDismiss(toast.id)}
        aria-label="알림 닫기"
      >
        <X aria-hidden size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: ToastInput) => {
    if (!toast.message.trim()) {
      return;
    }

    const nextToast: ToastItem = {
      id: ++toastId,
      message: toast.message,
      tone: toast.tone ?? "info",
      title: toast.title,
      durationMs: toast.durationMs
    };

    setToasts((current) => [...current, nextToast].slice(-4));
  }, []);

  const value = useMemo(() => ({ showToast, dismissToast }), [dismissToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-50 grid w-[min(360px,calc(100vw-32px))] gap-3"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div className="pointer-events-auto" key={toast.id}>
            <ToastCard toast={toast} onDismiss={dismissToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
