"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Check,
  GitCompareArrows,
  Plus,
  Search,
  X,
} from "lucide-react";

type Model = {
  name: string;
  slug: string;
  modelIdentifier: string;
  description: string | null;
  contextWindow: number | null;
  maxOutputTokens: number | null;
  isOpenSource: boolean;
  isDemo: boolean;
  company: { name: string };
  providers: { provider: { name: string }; isAvailable: boolean }[];
  capabilities: { capability: { name: string } }[];
  modalities: {
    modality: { name: string };
    supportsInput: boolean;
    supportsOutput: boolean;
  }[];
  pricing: {
    inputPricePerMillionTokens: string | null;
    outputPricePerMillionTokens: string | null;
    provider: { name: string } | null;
  }[];
  benchmarkResults: {
    score: string;
    scoreUnit: string;
    benchmark: { name: string };
    evaluationDate: string;
  }[];
};
type SearchData = {
  models: { name: string; slug: string; company: { name: string } }[];
};
function CompareContent() {
  const router = useRouter();
  const params = useSearchParams();
  const slugs = useMemo(
    () =>
      Array.from(
        new Set((params.get("models") || "").split(",").filter(Boolean)),
      ).slice(0, 4),
    [params],
  );
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const query = useQuery({
    queryKey: ["comparison", slugs],
    enabled: slugs.length >= 2,
    queryFn: async () => {
      const r = await fetch(`/api/compare?models=${slugs.join(",")}`);
      if (!r.ok) throw new Error();
      return (await r.json()).data as (Model | null)[];
    },
  });
  const results = useQuery({
    queryKey: ["comparison-search", debounced],
    enabled: debounced.length > 0,
    queryFn: async () => {
      const r = await fetch(`/api/search?q=${encodeURIComponent(debounced)}`);
      return (await r.json()).data as SearchData;
    },
  });
  const change = (next: string[]) =>
    router.replace(`/compare${next.length ? `?models=${next.join(",")}` : ""}`);
  const add = (slug: string) => {
    if (slugs.length < 4 && !slugs.includes(slug)) change([...slugs, slug]);
    setSearch("");
    setDebounced("");
  };
  const remove = (slug: string) =>
    change(slugs.filter((item) => item !== slug));
  const models = (query.data || []).filter((model): model is Model =>
    Boolean(model),
  );
  return (
    <main className="mx-auto min-h-screen max-w-[1320px] px-5 py-9 sm:px-8 sm:py-12">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-[#a396ff]">
        <GitCompareArrows size={13} /> Model analysis
      </div>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-.05em] sm:text-[40px]">
            Compare models
          </h1>
          <p className="mt-2 text-sm text-[#929baa]">
            Bring key model specifications into one shareable view.
          </p>
        </div>
        <span className="text-xs text-[#858e9d]">
          {slugs.length}/4 selected
        </span>
      </div>
      <div className="surface mt-7 rounded-xl p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {slugs.map((slug) => {
            const model = models.find((item) => item.slug === slug);
            return (
              <span
                key={slug}
                className="inline-flex items-center gap-2 rounded-lg border border-[#a396ff]/20 bg-[#a396ff]/[0.08] px-3 py-2 text-xs text-[#d7d2ff]"
              >
                {model?.name || slug}
                <button
                  aria-label={`Remove ${model?.name || slug}`}
                  onClick={() => remove(slug)}
                  className="text-[#9288ff] hover:text-white"
                >
                  <X size={13} />
                </button>
              </span>
            );
          })}
        </div>
        <div className="relative mt-4 max-w-[520px]">
          <div className="flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-[#090c12] px-3">
            <Search size={14} className="text-[#858e9e]" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setTimeout(() => setDebounced(event.target.value.trim()), 180);
              }}
              placeholder={
                slugs.length >= 4
                  ? "Remove a model to add another"
                  : "Search to add a model…"
              }
              disabled={slugs.length >= 4}
              className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#727b8b] disabled:opacity-50"
            />
            <span className="text-[10px] text-[#697282]">
              {slugs.length >= 4 ? "Limit reached" : "Add model"}
            </span>
          </div>
          {search && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-white/10 bg-[#141923] p-1 shadow-xl">
              {results.data?.models
                .filter((item) => !slugs.includes(item.slug))
                .map((item) => (
                  <button
                    key={item.slug}
                    onClick={() => add(item.slug)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs hover:bg-white/[0.06]"
                  >
                    <span>
                      {item.name}
                      <span className="ml-2 text-[#929baa]">
                        {item.company.name}
                      </span>
                    </span>
                    <Plus size={13} />
                  </button>
                ))}
              {!results.data?.models.length && (
                <p className="px-3 py-2 text-xs text-[#929baa]">
                  Search for a catalog model.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      {slugs.length < 2 ? (
        <div className="surface mt-5 rounded-xl px-6 py-14 text-center">
          <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-[#a396ff]/10 text-[#a396ff]">
            <Plus size={18} />
          </span>
          <h2 className="mt-4 text-sm font-semibold">
            Choose at least two models
          </h2>
          <p className="mt-1 text-xs text-[#929baa]">
            Use the search above or explore the catalog to start a comparison.
          </p>
          <Link
            href="/models"
            className="mt-4 inline-flex items-center gap-1 text-xs text-[#b4abff]"
          >
            Browse models <ArrowUpRight size={12} />
          </Link>
        </div>
      ) : query.isLoading ? (
        <div className="surface mt-5 h-80 animate-pulse rounded-xl" />
      ) : (
        <div className="surface mt-5 overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[740px] border-collapse text-left text-xs">
              <thead>
                <tr className="bg-white/[0.025]">
                  <th className="w-[180px] border-b border-white/[0.08] p-4 text-[10px] font-medium uppercase tracking-wider text-[#7f8898]">
                    Specification
                  </th>
                  {models.map((model) => (
                    <th
                      key={model.slug}
                      className="min-w-[185px] border-b border-white/[0.08] p-4 align-top"
                    >
                      <Link
                        href={`/models/${model.slug}`}
                        className="text-sm font-semibold hover:text-[#b6adff]"
                      >
                        {model.name}
                      </Link>
                      <p className="mt-1 text-[10px] text-[#929baa]">
                        {model.company.name}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <CompareRow
                  title="Identifier"
                  models={models}
                  render={(m) => (
                    <code className="break-all text-[10px]">
                      {m.modelIdentifier}
                    </code>
                  )}
                />
                <CompareRow
                  title="Context window"
                  models={models}
                  render={(m) =>
                    m.contextWindow
                      ? `${m.contextWindow.toLocaleString()} tokens`
                      : null
                  }
                />
                <CompareRow
                  title="Max output"
                  models={models}
                  render={(m) =>
                    m.maxOutputTokens
                      ? `${m.maxOutputTokens.toLocaleString()} tokens`
                      : null
                  }
                />
                <CompareRow
                  title="Open weights"
                  models={models}
                  render={(m) =>
                    m.isOpenSource ? (
                      <span className="inline-flex items-center gap-1.5 text-[#8fe2c2]">
                        <Check size={13} aria-hidden="true" />
                        Open weights
                      </span>
                    ) : (
                      "Proprietary"
                    )
                  }
                />
                <CompareRow
                  title="Input / 1M"
                  models={models}
                  render={(m) =>
                    price(m.pricing[0]?.inputPricePerMillionTokens)
                  }
                />
                <CompareRow
                  title="Output / 1M"
                  models={models}
                  render={(m) =>
                    price(m.pricing[0]?.outputPricePerMillionTokens)
                  }
                />
                <CompareRow
                  title="Capabilities"
                  models={models}
                  render={(m) =>
                    m.capabilities
                      .map(({ capability }) => capability.name)
                      .join(", ") || null
                  }
                />
                <CompareRow
                  title="Modalities"
                  models={models}
                  render={(m) =>
                    m.modalities
                      .map(({ modality }) => modality.name)
                      .join(", ") || null
                  }
                />
                <CompareRow
                  title="Providers"
                  models={models}
                  render={(m) =>
                    m.providers
                      .map(({ provider }) => provider.name)
                      .join(", ") || null
                  }
                />
                <CompareRow
                  title="Benchmarks"
                  models={models}
                  render={(m) =>
                    m.benchmarkResults.length
                      ? m.benchmarkResults
                          .slice(0, 3)
                          .map(
                            (result) =>
                              `${result.benchmark.name}: ${Number(result.score).toFixed(1)}${result.scoreUnit}*`,
                          )
                          .join(" · ")
                      : null
                  }
                />
              </tbody>
            </table>
          </div>
          <p className="border-t border-white/[0.07] px-4 py-3 text-[10px] text-[#8c95a4]">
            * Seed benchmark results are illustrative demo data, not verified
            evaluation results. Blank cells mean data is unavailable.
          </p>
        </div>
      )}
    </main>
  );
}
function CompareRow({
  title,
  models,
  render,
}: {
  title: string;
  models: Model[];
  render: (model: Model) => React.ReactNode;
}) {
  const values = models.map(render);
  return (
    <tr className="border-b border-white/[0.055] last:border-0">
      <th className="p-4 align-top text-[10px] font-medium text-[#929baa]">
        {title}
      </th>
      {values.map((value, index) => (
        <td
          key={index}
          className="p-4 align-top text-[11px] leading-5 text-[#d2d6df]"
        >
          {value || <span className="text-[#616a79">Not listed</span>}
        </td>
      ))}
    </tr>
  );
}
function price(value: string | null | undefined) {
  return value == null ? null : `$${Number(value).toFixed(2)}`;
}
export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-[1200px] px-5 py-12">
          <div className="surface h-96 animate-pulse rounded-xl" />
        </main>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
