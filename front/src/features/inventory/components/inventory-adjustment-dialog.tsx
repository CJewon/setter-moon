"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useInventoryAdjustmentMutation } from "@/features/inventory/hooks/use-inventory-adjustment-mutation";
import { inventoryAdjustmentSchema } from "@/features/inventory/schemas/inventory-adjustment-schema";
import { getApiErrorState } from "@/shared/api/http";
import { primaryActionClassName, secondaryActionClassName } from "@/shared/components/action-styles";
import { useToast } from "@/shared/components/toast-provider";
import { formatNumber } from "@/shared/lib/format";

type InventoryAdjustmentDialogProps = {
  item: {
    availableStock: number;
    currentStock: number;
    productName: string;
    reservedQuantity: number;
    variantId: string;
    variantName: string;
  };
};

type AdjustmentState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message: string;
  status: "error" | "idle";
};

const initialState: AdjustmentState = {
  message: "",
  status: "idle"
};

export function InventoryAdjustmentDialog({ item }: InventoryAdjustmentDialogProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const adjustInventoryMutation = useInventoryAdjustmentMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<AdjustmentState>(initialState);

  function closeDialog() {
    if (adjustInventoryMutation.isPending) {
      return;
    }

    setIsOpen(false);
    setState(initialState);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const parsed = inventoryAdjustmentSchema.safeParse({
      memo: formData.get("memo"),
      targetStock: formData.get("targetStock"),
      variantId: item.variantId
    });

    if (!parsed.success) {
      const nextState = {
        fieldErrors: parsed.error.flatten().fieldErrors,
        message: "재고 조정 정보를 다시 확인해 주세요.",
        status: "error" as const
      };

      setState(nextState);
      showToast({ message: nextState.message, title: "확인 필요", tone: "error" });
      return;
    }

    setState(initialState);
    adjustInventoryMutation.mutate(parsed.data, {
      onError: (error) => {
        const nextState = getApiErrorState(error, "재고를 조정하지 못했습니다. 잠시 후 다시 시도해 주세요.");

        setState(nextState);
        showToast({ message: nextState.message, title: "조정 실패", tone: "error" });
      },
      onSuccess: ({ message }) => {
        showToast({ message, title: "조정 완료", tone: "success" });
        setIsOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <button className={secondaryActionClassName} onClick={() => setIsOpen(true)} type="button">
        재고 조정
      </button>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 px-3 py-4 sm:items-center" role="presentation">
          <div
            aria-labelledby="inventory-adjustment-title"
            aria-modal="true"
            className="w-full max-w-lg rounded-md bg-white p-5 text-slate-950 shadow-2xl"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold" id="inventory-adjustment-title">
                  재고 조정
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  실제 수량을 확인한 뒤 목표 재고와 사유를 남깁니다.
                </p>
              </div>
              <button
                aria-label="재고 조정 닫기"
                className="inline-flex size-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-950"
                onClick={closeDialog}
                type="button"
              >
                <X aria-hidden size={18} />
              </button>
            </div>

            <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-slate-950">{item.productName}</p>
              <p className="mt-1 text-slate-600">{item.variantName}</p>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-500">
                <div>
                  <dt>현재 재고</dt>
                  <dd className="mt-1 text-sm font-bold text-slate-950">{formatNumber(item.currentStock)}개</dd>
                </div>
                <div>
                  <dt>예약 수량</dt>
                  <dd className="mt-1 text-sm font-bold text-slate-950">{formatNumber(item.reservedQuantity)}개</dd>
                </div>
                <div>
                  <dt>가용 재고</dt>
                  <dd className="mt-1 text-sm font-bold text-slate-950">{formatNumber(item.availableStock)}개</dd>
                </div>
              </dl>
            </div>

            <form className="mt-5 grid gap-4" onSubmit={handleSubmit} noValidate>
              {state.message ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{state.message}</p> : null}
              <label className="grid gap-2 text-sm font-semibold text-slate-800" htmlFor="target-stock">
                목표 재고
                <input
                  className="min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  defaultValue={item.currentStock}
                  id="target-stock"
                  inputMode="numeric"
                  min={0}
                  name="targetStock"
                  required
                  type="number"
                />
                {state.fieldErrors?.targetStock?.[0] ? <span className="text-xs text-red-700">{state.fieldErrors.targetStock[0]}</span> : null}
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-800" htmlFor="adjustment-memo">
                조정 사유
                <textarea
                  className="min-h-24 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  id="adjustment-memo"
                  maxLength={300}
                  name="memo"
                  placeholder="예: 실사 재고 반영, 오입고 정정"
                  required
                />
                {state.fieldErrors?.memo?.[0] ? <span className="text-xs text-red-700">{state.fieldErrors.memo[0]}</span> : null}
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                <button className={primaryActionClassName} disabled={adjustInventoryMutation.isPending} type="submit">
                  {adjustInventoryMutation.isPending ? "조정 중" : "재고 조정"}
                </button>
                <button className={secondaryActionClassName} disabled={adjustInventoryMutation.isPending} onClick={closeDialog} type="button">
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
