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
const DEFAULT_TOAST_DURATION_MS = 3000;
const TOAST_EXIT_DURATION_MS = 220;

const toneStyle: Record<
  ToastTone,
  {
    icon: typeof CheckCircle2;
    accentClassName: string;
    iconClassName: string;
    title: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    accentClassName: "bg-emerald-500",
    iconClassName: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    title: "완료"
  },
  error: {
    icon: AlertCircle,
    accentClassName: "bg-red-500",
    iconClassName: "bg-red-50 text-red-600 ring-red-100",
    title: "확인 필요"
  },
  info: {
    icon: Info,
    accentClassName: "bg-blue-500",
    iconClassName: "bg-blue-50 text-blue-600 ring-blue-100",
    title: "알림"
  }
};

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const [isLeaving, setIsLeaving] = useState(false);
  const style = toneStyle[toast.tone];
  const Icon = style.icon;

  const startDismiss = useCallback(() => {
    setIsLeaving((current) => {
      if (current) {
        return current;
      }

      window.setTimeout(() => onDismiss(toast.id), TOAST_EXIT_DURATION_MS);
      return true;
    });
  }, [onDismiss, toast.id]);

  useEffect(() => {
    const timer = window.setTimeout(startDismiss, toast.durationMs ?? DEFAULT_TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [startDismiss, toast.durationMs]);

  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className={cn(
        "toast-enter grid w-full grid-cols-[4px_auto_1fr_auto] overflow-hidden rounded-lg border border-slate-200 bg-white/95 text-sm text-slate-950 shadow-xl shadow-slate-900/15 backdrop-blur",
        isLeaving && "toast-exit"
      )}
    >
      <div className={cn("h-full w-1", style.accentClassName)} />
      <div
        className={cn(
          "ml-3 mt-3 inline-flex size-9 shrink-0 items-center justify-center rounded-full ring-1",
          style.iconClassName
        )}
      >
        <Icon aria-hidden size={18} />
      </div>
      <div className="min-w-0 px-3 py-3">
        <p className="font-bold tracking-normal">{toast.title ?? style.title}</p>
        <p className="mt-1 break-words leading-5 text-slate-600">{toast.message}</p>
      </div>
      <button
        type="button"
        className="mr-2 mt-2 inline-flex size-7 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
        onClick={startDismiss}
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
        className="pointer-events-none fixed bottom-4 right-4 z-50 grid w-[min(380px,calc(100vw-32px))] gap-3"
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
