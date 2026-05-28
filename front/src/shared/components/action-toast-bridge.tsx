"use client";

import { useEffect } from "react";
import type { ActionState } from "@/shared/types/action-state";
import { useToast } from "@/shared/components/toast-provider";

type ActionToastBridgeProps = {
  state: ActionState;
  successTitle?: string;
  errorTitle?: string;
};

export function ActionToastBridge({ state, successTitle, errorTitle }: ActionToastBridgeProps) {
  const { showToast } = useToast();

  useEffect(() => {
    if (state.status === "idle" || !state.message) {
      return;
    }

    showToast({
      tone: state.status === "success" ? "success" : "error",
      title: state.status === "success" ? successTitle : errorTitle,
      message: state.message
    });
  }, [errorTitle, showToast, state, successTitle]);

  return null;
}
