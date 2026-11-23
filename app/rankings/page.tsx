"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, BarChart3, Medal, TrendingUp } from "lucide-react";
import { useState } from "react";

type Rank = {
  rank: number;
  score: string;
  scoreUnit: string;
  evaluationDate: string;
  isDemo: boolean;
  sourceUrl: string | null;
  model: {
    name: string;
    slug: string;
    contextWindow: number | null;
    isOpenSource: boolean;
    company: { name: string };
    pricing: { inputPricePerMillionTokens: string | null }[];
    providers: { providerId: string }[];
  };
  benchmark: { name: string; category: string; sourceUrl: string | null };
};
type Option = { name: string; slug: string };
const categories = [
  ["", "Overall"],
  ["REASONING", "Reasoning"],
  ["CODING", "Coding"],
  ["MATHEMATICS", "Mathematics"],
  ["VISION", "Vision"],
  ["GENERAL", "General"],
];
export default function RankingsPage() {
  const [category, setCategory] = useState("");
  const [company, setCompany] = useState("");
  const [provider, setProvider] = useState("");
  const [openSource, setOpenSource] = useState("");
  const companies = useQuery({
    queryKey: ["ranking-companies"],
    queryFn: async () =>
      (await fetch("/api/companies")).json().then((r) => r.data as Option[]),
  });
  const providers = useQuery({
    queryKey: ["ranking-providers"],
    queryFn: async () =>
      (await fetch("/api/providers")).json().then((r) => r.data as Option[]),
  });
  const query = useQuery({
    queryKey: ["rankings", category, company, provider, openSource],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (company) params.set("company", company);
      if (provider) params.set("provider", provider);
      if (openSource) params.set("openSource", openSource);
      const r = await fetch(`/api/rankings?${params}`);
      if (!r.ok) throw new Error();
      return (await r.json()).data as Rank[];
    },
  });
  const rows = query.data || [];
  return (
    <main className="mx-auto min-h-screen max-w-[1280px] px-5 py-9 sm:px-8 sm:py-12">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.15em] text-[#a396ff]">
        <Medal size={14} /> Benchmarks & leaderboards
      </div>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-.05em] sm:text-[40px]">
            Model rankings
          </h1>
          <p className="mt-2 text-sm text-[#929baa]">
            Rankings are based on recorded benchmark results, never inferred
            capability.
          </p>
        </div>
        <span className="rounded-lg border border-[#e8bd75]/20 bg-[#e8bd75]/[0.07] px-3 py-2 text-[10px] text-[#e8bd75]">
          Seed scores are illustrative
        </span>
      </div>
      <div className="mt-7 flex flex-wrap gap-2">
        {categories.map(([value, label]) => (
          <button
            key={value}
            onClick={() => setCategory(value)}
            className={`rounded-lg border px-3 py-2 text-[11px] transition-colors ${category === value ? "border-[#a396ff]/40 bg-[#a396ff]/10 text-[#c9c2ff]" : "border-white/[0.08] bg-white/[0.025] text-[#929baa] hover:text-white"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <select
          aria-label="Filter rankings by company"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          className="h-9 rounded-lg border border-white/10 bg-[#10141d] px-3 text-[11px] text-[#c6cbd4]"
        >
          <option value="">All companies</option>
          {(companies.data || []).map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter rankings by provider"
          value={provider}
          onChange={(event) => setProvider(event.target.value)}
          className="h-9 rounded-lg border border-white/10 bg-[#10141d] px-3 text-[11px] text-[#c6cbd4]"
        >
          <option value="">All providers</option>
          {(providers.data || []).map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter rankings by model type"
          value={openSource}
          onChange={(event) => setOpenSource(event.target.value)}
          className="h-9 rounded-lg border border-white/10 bg-[#10141d] px-3 text-[11px] text-[#c6cbd4]"
        >
          <option value="">All model types</option>
          <option value="true">Open weights</option>
          <option value="false">Proprietary</option>
        </select>
      </div>
      <div className="surface mt-5 overflow-hidden rounded-xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={15} className="text-[#a396ff]" />
            <h2 className="text-sm font-semibold">Leaderboard</h2>
          </div>
          <span className="text-[10px] text-[#858e9d]">
            {rows.length} evaluation records
          </span>
        </div>
        {query.isLoading ? (
          <div className="p-8 text-xs text-[#929baa]">
            Loading recorded benchmark results…
          </div>
        ) : query.isError ? (
          <div className="p-8 text-sm text-[#ec9a9a]">
            Unable to load benchmark results.
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#929baa]">
            No benchmark results have been recorded in this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left">
              <thead>
                <tr className="text-[9px] uppercase tracking-[.11em] text-[#778191]">
                  <th className="px-5 py-3 font-medium">Rank</th>
                  <th className="px-5 py-3 font-medium">Model</th>
                  <th className="px-5 py-3 font-medium">Benchmark</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Input / 1M</th>
                  <th className="px-5 py-3 font-medium">Context</th>
                  <th className="px-5 py-3 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row.model.slug}-${row.benchmark.name}`}
                    className="border-t border-white/[0.055] hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4 text-xs text-[#8b94a2]">
                      {row.rank <= 3 ? (
                        <span className="inline-flex size-6 items-center justify-center rounded-md bg-[#a396ff]/10 text-[10px] font-semibold text-[#bdb5ff]">
                          {row.rank}
                        </span>
                      ) : (
                        `#${row.rank}`
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/models/${row.model.slug}`}
                        className="text-xs font-medium hover:text-[#b8afff]"
                      >
                        {row.model.name}
                      </Link>
                      <p className="mt-1 text-[10px] text-[#858e9d]">
                        {row.model.company.name}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-[#c8cdd6]">
                        {row.benchmark.name}
                      </span>
                      <span className="ml-2 rounded bg-white/[0.05] px-1.5 py-0.5 text-[9px] text-[#9099a8]">
                        {row.benchmark.category.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold">
                        {Number(row.score).toFixed(1)}
                        {row.scoreUnit}
                      </span>
                      <span className="ml-2 text-[9px] text-[#e8bd75]">
                        Demo
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#c7ccd5]">
                      {row.model.pricing[0]?.inputPricePerMillionTokens == null
                        ? "—"
                        : `$${Number(row.model.pricing[0].inputPricePerMillionTokens).toFixed(2)}`}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#c7ccd5]">
                      {row.model.contextWindow
                        ? `${Math.round(row.model.contextWindow / 1000)}K`
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      {row.sourceUrl || row.benchmark.sourceUrl ? (
                        <a
                          href={row.sourceUrl || row.benchmark.sourceUrl || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-[#a99fff] hover:text-white"
                        >
                          Reference <ArrowUpRight size={11} />
                        </a>
                      ) : (
                        <span className="text-[10px] text-[#737c8b]">
                          Not provided
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="mt-4 flex items-center gap-2 text-[10px] leading-5 text-[#868e9d]">
        <TrendingUp size={13} className="shrink-0 text-[#a396ff]" />
        Only recorded results are shown. Demo scores are synthetic test
        fixtures; they are explicitly identified and should not be used as
        real-world evaluations.
      </p>
    </main>
  );
}
