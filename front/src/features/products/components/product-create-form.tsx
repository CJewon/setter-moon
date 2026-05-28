"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { productCreateSchema, type ProductCreateValues } from "@/features/products/schemas/product-form-schema";
import {
  createVariantCombinationItems,
  normalizeOptionGroups,
  type VariantCombinationItem
} from "@/features/products/utils/variant-combinations";
import { useCreateProductMutation } from "@/features/products/hooks/use-product-mutations";
import { getApiErrorState } from "@/shared/api/http";
import { useToast } from "@/shared/components/toast-provider";
import { productStatusLabel } from "@/shared/constants/status-labels";
import { formatNumber } from "@/shared/lib/format";
import type { UsageSummary } from "@/server/usage/usage-policy";
import { cn } from "@/shared/utils/cn";

type ProductCreateFormProps = {
  usageSummary: UsageSummary;
};

type BasicDraft = {
  name: string;
  basePrice: string;
  baseCost: string;
  status: "active" | "sold_out" | "hidden";
  memo: string;
};

type OptionGroupDraft = {
  id: string;
  name: string;
  values: string[];
};

type VariantDraft = {
  key: string;
  label: string;
  options: VariantCombinationItem["options"];
  isActive: boolean;
  price: string;
  cost: string;
  currentStock: string;
  safetyStock: string;
  memo: string;
};

type FormState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const productStatuses: BasicDraft["status"][] = ["active", "sold_out", "hidden"];
const initialState: FormState = { status: "idle", message: "" };

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

function createDefaultGroup(): OptionGroupDraft {
  return {
    id: createId(),
    name: "색상",
    values: ["블랙", "아이보리"]
  };
}

function toNumber(value: string) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : 0;
}

function createDefaultVariant(combination: VariantCombinationItem, basic: BasicDraft): VariantDraft {
  return {
    key: combination.key,
    label: combination.label,
    options: combination.options,
    isActive: true,
    price: basic.basePrice || "0",
    cost: basic.baseCost || "0",
    currentStock: "0",
    safetyStock: "0",
    memo: ""
  };
}

function getUsageMetric(summary: UsageSummary, key: "products" | "skus") {
  return summary.metrics.find((metric) => metric.key === key);
}

function createPayload(
  basic: BasicDraft,
  optionMode: ProductCreateValues["optionMode"],
  optionGroups: OptionGroupDraft[],
  variants: VariantDraft[]
): ProductCreateValues {
  return {
    name: basic.name,
    basePrice: toNumber(basic.basePrice),
    baseCost: toNumber(basic.baseCost),
    status: basic.status,
    memo: basic.memo,
    optionMode,
    optionGroups:
      optionMode === "options"
        ? normalizeOptionGroups(optionGroups).map((group) => ({
            name: group.name,
            values: group.values
          }))
        : [],
    variants: variants.map((variant) => ({
      clientKey: variant.key,
      options: optionMode === "options" ? variant.options : [],
      isActive: variant.isActive,
      price: toNumber(variant.price || basic.basePrice),
      cost: toNumber(variant.cost || basic.baseCost),
      currentStock: toNumber(variant.currentStock),
      safetyStock: toNumber(variant.safetyStock),
      memo: variant.memo
    }))
  };
}

export function ProductCreateForm({ usageSummary }: ProductCreateFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const createProductMutation = useCreateProductMutation();
  const [state, setState] = useState<FormState>(initialState);
  const [basic, setBasic] = useState<BasicDraft>({
    name: "",
    basePrice: "0",
    baseCost: "0",
    status: "active",
    memo: ""
  });
  const [optionMode, setOptionMode] = useState<ProductCreateValues["optionMode"]>("none");
  const [optionGroups, setOptionGroups] = useState<OptionGroupDraft[]>([createDefaultGroup()]);
  const [variantDrafts, setVariantDrafts] = useState<Record<string, VariantDraft>>({});
  const normalizedGroups = useMemo(() => normalizeOptionGroups(optionGroups), [optionGroups]);
  const combinations = useMemo(() => {
    if (optionMode === "none") {
      return createVariantCombinationItems([]);
    }

    return normalizedGroups.length > 0 ? createVariantCombinationItems(normalizedGroups) : [];
  }, [normalizedGroups, optionMode]);
  const variants = useMemo(
    () =>
      combinations.map((combination) => {
        const defaultVariant = createDefaultVariant(combination, basic);
        const savedVariant = variantDrafts[combination.key];

        return savedVariant
          ? {
              ...defaultVariant,
              ...savedVariant,
              key: combination.key,
              label: combination.label,
              options: combination.options
            }
          : defaultVariant;
      }),
    [basic, combinations, variantDrafts]
  );
  const activeVariantCount = variants.filter((variant) => variant.isActive).length;
  const productMetric = getUsageMetric(usageSummary, "products");
  const optionCombinationMetric = getUsageMetric(usageSummary, "skus");
  const productLimitReached = productMetric?.limit !== null && productMetric?.state === "blocked";
  const optionCombinationLimit =
    optionCombinationMetric?.limit === null || optionCombinationMetric?.limit === undefined
      ? null
      : optionCombinationMetric.limit - optionCombinationMetric.count;
  const optionCombinationLimitExceeded = optionCombinationLimit !== null && activeVariantCount > optionCombinationLimit;
  const pending = createProductMutation.isPending;
  const nameError = state.fieldErrors?.name?.[0];
  const basePriceError = state.fieldErrors?.basePrice?.[0];
  const optionGroupsError = state.fieldErrors?.optionGroups?.[0];
  const variantsError = state.fieldErrors?.variants?.[0];

  function updateBasic(field: keyof BasicDraft, value: string) {
    setBasic((current) => ({
      ...current,
      [field]: value
    }));
  }

  function updateOptionGroup(groupId: string, value: string) {
    setOptionGroups((current) => current.map((group) => (group.id === groupId ? { ...group, name: value } : group)));
  }

  function updateOptionValue(groupId: string, index: number, value: string) {
    setOptionGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? {
              ...group,
              values: group.values.map((optionValue, optionIndex) => (optionIndex === index ? value : optionValue))
            }
          : group
      )
    );
  }

  function addOptionValue(groupId: string) {
    setOptionGroups((current) =>
      current.map((group) => (group.id === groupId ? { ...group, values: [...group.values, ""] } : group))
    );
  }

  function removeOptionValue(groupId: string, index: number) {
    setOptionGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? {
              ...group,
              values: group.values.filter((_, optionIndex) => optionIndex !== index)
            }
          : group
      )
    );
  }

  function addOptionGroup() {
    setOptionGroups((current) => [...current, { id: createId(), name: "", values: [""] }]);
  }

  function removeOptionGroup(groupId: string) {
    setOptionGroups((current) => current.filter((group) => group.id !== groupId));
  }

  function updateVariant(key: string, patch: Partial<VariantDraft>) {
    setVariantDrafts((current) => {
      const currentVariant = current[key] ?? variants.find((variant) => variant.key === key);

      if (!currentVariant) {
        return current;
      }

      return {
        ...current,
        [key]: {
          ...currentVariant,
          ...patch
        }
      };
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = createPayload(basic, optionMode, optionGroups, variants);
    const parsed = productCreateSchema.safeParse(payload);

    if (!parsed.success) {
      const nextState = {
        status: "error" as const,
        message: "상품 정보를 다시 확인해 주세요.",
        fieldErrors: parsed.error.flatten().fieldErrors
      };

      setState(nextState);
      showToast({ tone: "error", title: "확인 필요", message: nextState.message });
      return;
    }

    if (productLimitReached) {
      const message = "무료 플랜 상품 한도 10개를 모두 사용했어요.";
      setState({ status: "error", message });
      showToast({ tone: "error", title: "상품 한도 도달", message });
      return;
    }

    if (optionCombinationLimitExceeded) {
      const message = "무료 플랜 옵션 조합 한도를 초과합니다. 사용하지 않을 조합을 제외해 주세요.";
      setState({ status: "error", message });
      showToast({ tone: "error", title: "옵션 조합 한도 초과", message });
      return;
    }

    setState(initialState);
    createProductMutation.mutate(parsed.data, {
      onSuccess: ({ data, message }) => {
        showToast({
          tone: "success",
          title: "등록 완료",
          message
        });
        router.push(`/products/${data.productId}`);
      },
      onError: (error) => {
        const nextState = getApiErrorState(error, "상품을 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        setState(nextState);
        showToast({
          tone: "error",
          title: "등록 실패",
          message: nextState.message
        });
      }
    });
  }

  return (
    <form className="grid gap-6 xl:grid-cols-[260px_1fr]" onSubmit={handleSubmit} noValidate>
      <aside className="h-fit rounded-md border border-slate-200 bg-white p-4">
        <ol className="space-y-3">
          {["상품 기본 정보", "옵션 선택", "옵션 조합", "옵션별 재고", "저장"].map((step, index) => (
            <li key={step} className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-700">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <div className="mt-5 rounded-md bg-blue-50 p-3 text-xs leading-5 text-blue-900">
          무료 플랜은 상품 {productMetric?.limit ?? "무제한"}개, 옵션 조합 {optionCombinationMetric?.limit ?? "무제한"}개까지 등록할 수 있어요.
        </div>
      </aside>

      <div className="grid gap-5">
        {state.status === "error" && state.message ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{state.message}</div>
        ) : null}

        <section className="rounded-md border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-slate-950">상품 기본 정보</h2>
            <p className="text-sm text-slate-500">상품명과 기본 판매가를 먼저 입력합니다.</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="product-name">
              상품명
              <input
                id="product-name"
                className={cn(
                  "min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                  nameError && "border-red-300 focus:border-red-500 focus:ring-red-100"
                )}
                value={basic.name}
                onChange={(event) => updateBasic("name", event.target.value)}
                placeholder="예: 린넨 셔츠"
                maxLength={80}
              />
              {nameError ? <span className="text-xs text-red-700">{nameError}</span> : null}
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="base-price">
              기본 판매가
              <input
                id="base-price"
                className={cn(
                  "min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                  basePriceError && "border-red-300 focus:border-red-500 focus:ring-red-100"
                )}
                value={basic.basePrice}
                onChange={(event) => updateBasic("basePrice", event.target.value)}
                inputMode="numeric"
                placeholder="0"
              />
              {basePriceError ? <span className="text-xs text-red-700">{basePriceError}</span> : null}
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="base-cost">
              기본 원가
              <input
                id="base-cost"
                className="min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={basic.baseCost}
                onChange={(event) => updateBasic("baseCost", event.target.value)}
                inputMode="numeric"
                placeholder="0"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="product-status">
              판매 상태
              <select
                id="product-status"
                className="min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={basic.status}
                onChange={(event) => updateBasic("status", event.target.value as BasicDraft["status"])}
              >
                {productStatuses.map((status) => (
                  <option key={status} value={status}>
                    {productStatusLabel[status]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-medium text-slate-800" htmlFor="product-memo">
            상품 메모
            <textarea
              id="product-memo"
              className="min-h-20 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              value={basic.memo}
              onChange={(event) => updateBasic("memo", event.target.value)}
              maxLength={500}
              placeholder="입고처, 촬영 메모, 판매 채널별 주의사항 등을 적어둘 수 있어요."
            />
          </label>
        </section>

        <section className="rounded-md border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-slate-950">옵션 사용 여부</h2>
            <p className="text-sm text-slate-500">옵션이 없는 상품도 기본 옵션 조합 1개로 재고를 관리합니다.</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { value: "none" as const, title: "옵션 없이 등록", description: "단일 상품 재고를 관리합니다." },
              { value: "options" as const, title: "옵션을 나눠 등록", description: "색상, 사이즈처럼 조합별 재고를 관리합니다." }
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                className={cn(
                  "rounded-md border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-200",
                  optionMode === item.value ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
                )}
                onClick={() => setOptionMode(item.value)}
              >
                <span className="text-sm font-bold text-slate-950">{item.title}</span>
                <span className="mt-1 block text-sm text-slate-500">{item.description}</span>
              </button>
            ))}
          </div>
        </section>

        {optionMode === "options" ? (
          <section className="rounded-md border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">옵션 그룹과 옵션값</h2>
                <p className="mt-1 text-sm text-slate-500">예: 색상은 블랙/아이보리, 사이즈는 S/M/L처럼 입력합니다.</p>
              </div>
              <button
                type="button"
                className="inline-flex min-h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={addOptionGroup}
              >
                옵션 그룹 추가
              </button>
            </div>
            {optionGroupsError ? <p className="mt-3 text-xs text-red-700">{optionGroupsError}</p> : null}
            <div className="mt-5 grid gap-4">
              {optionGroups.map((group) => (
                <div key={group.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className="grid flex-1 gap-2 text-sm font-medium text-slate-800">
                      옵션 그룹명
                      <input
                        className="min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        value={group.name}
                        onChange={(event) => updateOptionGroup(group.id, event.target.value)}
                        placeholder="예: 색상"
                      />
                    </label>
                    <button
                      type="button"
                      className="min-h-10 rounded-md px-3 text-sm font-semibold text-red-700 hover:bg-red-50 sm:self-end"
                      onClick={() => removeOptionGroup(group.id)}
                    >
                      삭제
                    </button>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {group.values.map((value, index) => (
                      <div key={`${group.id}-${index}`} className="flex gap-2">
                        <input
                          className="min-h-10 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          value={value}
                          onChange={(event) => updateOptionValue(group.id, index, event.target.value)}
                          placeholder="예: 블랙"
                        />
                        <button
                          type="button"
                          className="min-h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-white"
                          onClick={() => removeOptionValue(group.id, index)}
                        >
                          제거
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="w-fit min-h-9 rounded-md px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                      onClick={() => addOptionValue(group.id)}
                    >
                      옵션값 추가
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-md border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">옵션 조합과 옵션별 재고</h2>
              <p className="mt-1 text-sm text-slate-500">등록할 조합만 켜두고 현재 재고와 안전 재고를 입력합니다.</p>
            </div>
            <div className="rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
              등록 예정 {formatNumber(activeVariantCount)}개
            </div>
          </div>
          {variantsError ? <p className="mt-3 text-xs text-red-700">{variantsError}</p> : null}
          {optionCombinationLimitExceeded ? (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              남은 옵션 조합 한도는 {formatNumber(optionCombinationLimit ?? 0)}개입니다. 사용하지 않을 조합을 꺼주세요.
            </p>
          ) : null}
          {variants.length === 0 ? (
            <p className="mt-5 rounded-md bg-slate-50 p-4 text-sm text-slate-600">옵션 그룹과 옵션값을 입력하면 조합이 나타납니다.</p>
          ) : (
            <div className="mt-5 grid gap-3">
              {variants.map((variant) => (
                <div key={variant.key} className={cn("rounded-md border p-4", variant.isActive ? "border-slate-200" : "border-slate-100 bg-slate-50")}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <label className="inline-flex items-start gap-3 text-sm font-semibold text-slate-950">
                      <input
                        type="checkbox"
                        className="mt-1 size-4 rounded border-slate-300"
                        checked={variant.isActive}
                        onChange={(event) => updateVariant(variant.key, { isActive: event.target.checked })}
                      />
                      <span>
                        {variant.label}
                        <span className="mt-1 block text-xs font-medium text-slate-500">{variant.isActive ? "등록할 옵션 조합" : "사용 안 함"}</span>
                      </span>
                    </label>
                    <div className="grid gap-2 sm:grid-cols-4 lg:min-w-[640px]">
                      <label className="grid gap-1 text-xs font-semibold text-slate-600">
                        옵션별 판매가
                        <input
                          className="min-h-9 rounded-md border border-slate-300 px-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          value={variant.price}
                          onChange={(event) => updateVariant(variant.key, { price: event.target.value })}
                          inputMode="numeric"
                          disabled={!variant.isActive}
                        />
                      </label>
                      <label className="grid gap-1 text-xs font-semibold text-slate-600">
                        현재 재고
                        <input
                          className="min-h-9 rounded-md border border-slate-300 px-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          value={variant.currentStock}
                          onChange={(event) => updateVariant(variant.key, { currentStock: event.target.value })}
                          inputMode="numeric"
                          disabled={!variant.isActive}
                        />
                      </label>
                      <label className="grid gap-1 text-xs font-semibold text-slate-600">
                        안전 재고
                        <input
                          className="min-h-9 rounded-md border border-slate-300 px-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          value={variant.safetyStock}
                          onChange={(event) => updateVariant(variant.key, { safetyStock: event.target.value })}
                          inputMode="numeric"
                          disabled={!variant.isActive}
                        />
                      </label>
                      <label className="grid gap-1 text-xs font-semibold text-slate-600">
                        원가
                        <input
                          className="min-h-9 rounded-md border border-slate-300 px-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          value={variant.cost}
                          onChange={(event) => updateVariant(variant.key, { cost: event.target.value })}
                          inputMode="numeric"
                          disabled={!variant.isActive}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">저장 후 상품 상세 화면에서 옵션별 재고를 확인할 수 있어요.</p>
          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
            disabled={pending || productLimitReached || optionCombinationLimitExceeded}
          >
            {pending ? "등록 중..." : "상품 등록하기"}
          </button>
        </div>
      </div>
    </form>
  );
}
