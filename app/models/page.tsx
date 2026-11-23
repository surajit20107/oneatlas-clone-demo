"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  ListFilter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { ModelCard, type ModelCardData } from "@/components/models/model-card";

type Response<T> = {
  success: boolean;
  data: T;
  meta?: { page: number; total: number; totalPages: number };
};
type Option = { name: string; slug: string };
const capabilities = [
  "reasoning",
  "function-calling",
  "tool-use",
  "structured-output",
  "vision",
  "code-generation",
  "json-mode",
  "streaming",
  "embeddings",
];
const modalities = ["text", "image", "audio", "video", "file"];

export default function ModelsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const query = params.toString();
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(query);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    router.replace(`${pathname}${next.size ? `?${next.toString()}` : ""}`, {
      scroll: false,
    });
  };
  const models = useQuery({
    queryKey: ["models", query],
    queryFn: async () => {
      const response = await fetch(`/api/models${query ? `?${query}` : ""}`);
      if (!response.ok) throw new Error("Unable to load models");
      return (await response.json()) as Response<ModelCardData[]>;
    },
  });
  const companies = useQuery({
    queryKey: ["companies-options"],
    queryFn: async () =>
      (await fetch("/api/companies")).json() as Promise<Response<Option[]>>,
  });
  const providers = useQuery({
    queryKey: ["providers-options"],
    queryFn: async () =>
      (await fetch("/api/providers")).json() as Promise<Response<Option[]>>,
  });
  const activeFilters = [
    "company",
    "provider",
    "capabilities",
    "modalities",
    "openSource",
    "minContext",
    "maxContext",
    "minPrice",
    "maxPrice",
  ].filter((key) => params.has(key)).length;
  const page = Number(params.get("page") || 1);
  return (
    <main className="mx-auto min-h-screen max-w-[1440px] px-5 py-9 sm:px-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.15em] text-[#9c92ff]">
            <ListFilter size={13} /> Discovery
          </div>
          <h1 className="text-3xl font-semibold tracking-[-.05em] sm:text-[40px]">
            Model catalog
          </h1>
          <p className="mt-2 text-sm text-[#929baa]">
            Explore the models powering today&apos;s AI products.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tracking-[-.04em]">
            {models.data?.meta?.total ?? "—"}
          </p>
          <p className="text-[10px] text-[#858e9e]">active models</p>
        </div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[238px_minmax(0,1fr)]">
        <aside className="h-fit rounded-xl border border-white/[0.08] bg-[#10141d] p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xs font-semibold">
              <SlidersHorizontal size={13} /> Filters
            </h2>
            {activeFilters > 0 && (
              <button
                onClick={() => router.replace(pathname)}
                className="text-[10px] text-[#a79cff]"
              >
                Clear all
              </button>
            )}
          </div>
          <label className="mt-4 block text-[10px] font-medium text-[#929baa]">
            Search
          </label>
          <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-white/10 bg-[#0b0e14] px-2.5">
            <Search size={13} className="text-[#7b8494]" />
            <input
              value={params.get("search") || ""}
              onChange={(event) => update("search", event.target.value)}
              placeholder="Model or identifier"
              className="h-9 min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#667080]"
            />
          </div>
          <FilterSelect
            label="Company"
            value={params.get("company") || ""}
            onChange={(value) => update("company", value)}
            options={
              companies.data?.data.map((item) => [item.slug, item.name]) || []
            }
          />
          <FilterSelect
            label="Provider"
            value={params.get("provider") || ""}
            onChange={(value) => update("provider", value)}
            options={
              providers.data?.data.map((item) => [item.slug, item.name]) || []
            }
          />
          <FilterSelect
            label="Capability"
            value={params.get("capabilities") || ""}
            onChange={(value) => update("capabilities", value)}
            options={capabilities.map((item) => [
              item,
              item.replaceAll("-", " "),
            ])}
          />
          <FilterSelect
            label="Modality"
            value={params.get("modalities") || ""}
            onChange={(value) => update("modalities", value)}
            options={modalities.map((item) => [item, item])}
          />
          <FilterSelect
            label="Model type"
            value={params.get("openSource") || ""}
            onChange={(value) => update("openSource", value)}
            options={[
              ["true", "Open weights"],
              ["false", "Proprietary"],
            ]}
          />
          <label className="mt-4 block text-[10px] font-medium text-[#929baa]">
            Minimum context
          </label>
          <input
            type="number"
            min="0"
            value={params.get("minContext") || ""}
            onChange={(event) => update("minContext", event.target.value)}
            placeholder="e.g. 128000"
            className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#0b0e14] px-2.5 text-xs outline-none focus:border-[#a396ff]/50"
          />
          <label className="mt-4 block text-[10px] font-medium text-[#929baa]">
            Maximum context
          </label>
          <input
            type="number"
            min="0"
            value={params.get("maxContext") || ""}
            onChange={(event) => update("maxContext", event.target.value)}
            placeholder="Any context"
            className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#0b0e14] px-2.5 text-xs outline-none focus:border-[#a396ff]/50"
          />
          <label className="mt-4 block text-[10px] font-medium text-[#929baa]">
            Input price / 1M · minimum
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={params.get("minPrice") || ""}
            onChange={(event) => update("minPrice", event.target.value)}
            placeholder="Any price"
            className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#0b0e14] px-2.5 text-xs outline-none focus:border-[#a396ff]/50"
          />
          <label className="mt-4 block text-[10px] font-medium text-[#929baa]">
            Input price / 1M · maximum
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={params.get("maxPrice") || ""}
            onChange={(event) => update("maxPrice", event.target.value)}
            placeholder="Any price"
            className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#0b0e14] px-2.5 text-xs outline-none focus:border-[#a396ff]/50"
          />
        </aside>
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#929baa]">
              <span>{models.data?.meta?.total ?? 0} results</span>
              {activeFilters > 0 && (
                <span className="rounded-full bg-[#a396ff]/10 px-2 py-0.5 text-[10px] text-[#b8afff]">
                  {activeFilters} filters
                </span>
              )}
            </div>
            <select
              value={params.get("sort") || "newest"}
              onChange={(event) => update("sort", event.target.value)}
              aria-label="Sort models"
              className="h-9 rounded-lg border border-white/10 bg-[#10141d] px-3 text-xs text-[#d9dce4] outline-none"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="inputPrice">Lowest input price</option>
              <option value="outputPrice">Lowest output price</option>
              <option value="context">Largest context</option>
              <option value="popular">Most listed providers</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
          {models.isError ? (
            <div className="mt-5 rounded-xl border border-[#ee8585]/20 bg-[#ee8585]/[0.06] p-6 text-sm text-[#f2a1a1]">
              Could not reach the catalog. Check the database connection and try
              again.
            </div>
          ) : models.isLoading ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="surface h-[237px] animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : models.data?.data.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {models.data.data.map((model) => (
                <ModelCard key={model.slug} model={model} />
              ))}
            </div>
          ) : (
            <div className="surface mt-5 rounded-xl px-6 py-14 text-center">
              <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-[#a396ff]/10 text-[#aca3ff]">
                <Search size={18} />
              </div>
              <p className="mt-4 text-sm font-medium">
                No models match these filters
              </p>
              <p className="mt-1 text-xs text-[#929baa]">
                Try broadening your search or removing a filter.
              </p>
              <button
                onClick={() => router.replace(pathname)}
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#b2aaff]"
              >
                Clear filters <X size={12} />
              </button>
            </div>
          )}
          {!!models.data?.meta?.totalPages &&
            models.data.meta.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-4">
                <button
                  disabled={page <= 1}
                  onClick={() => update("page", String(page - 1))}
                  className="flex items-center gap-1 text-xs text-[#929baa] disabled:opacity-40"
                >
                  <ArrowLeft size={13} /> Previous
                </button>
                <span className="text-xs text-[#929baa]">
                  Page {page} of {models.data.meta.totalPages}
                </span>
                <button
                  disabled={page >= models.data.meta.totalPages}
                  onClick={() => update("page", String(page + 1))}
                  className="flex items-center gap-1 text-xs text-[#929baa] disabled:opacity-40"
                >
                  Next <ArrowRight size={13} />
                </button>
              </div>
            )}
        </section>
      </div>
    </main>
  );
}
function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <label className="mt-4 block text-[10px] font-medium capitalize text-[#929baa]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#0b0e14] px-2.5 text-xs capitalize text-[#d8dce5] outline-none focus:border-[#a396ff]/50"
      >
        <option value="">Any {label.toLowerCase()}</option>
        {options.map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
