"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Check,
  Code2,
  GitCompareArrows,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { ModelCard, type ModelCardData } from "@/components/models/model-card";

type Detail = {
  name: string;
  slug: string;
  modelIdentifier: string;
  description: string | null;
  modelFamily: string | null;
  contextWindow: number | null;
  maxOutputTokens: number | null;
  releaseDate: string | null;
  lastUpdatedAt: string | null;
  isOpenSource: boolean;
  license: string | null;
  isDemo: boolean;
  company: { name: string; slug: string };
  providers: {
    provider: { name: string; slug: string };
    providerModelId: string | null;
    isAvailable: boolean;
  }[];
  capabilities: { capability: { name: string; slug: string } }[];
  modalities: {
    modality: { name: string };
    supportsInput: boolean;
    supportsOutput: boolean;
  }[];
  pricing: {
    inputPricePerMillionTokens: string | null;
    outputPricePerMillionTokens: string | null;
    cachedInputPricePerMillionTokens: string | null;
    provider: { name: string; slug: string } | null;
    isDemo: boolean;
  }[];
  benchmarkResults: {
    score: string;
    scoreUnit: string;
    evaluationDate: string;
    sourceUrl: string | null;
    isDemo: boolean;
    benchmark: { name: string; category: string; sourceUrl: string | null };
  }[];
  releases: {
    version: string;
    releaseDate: string;
    changelog: string | null;
    announcementUrl: string | null;
  }[];
  relatedModels: ModelCardData[];
};

export default function ModelDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const query = useQuery({
    queryKey: ["model", slug],
    queryFn: async () => {
      const res = await fetch(`/api/models/${slug}`);
      if (!res.ok) throw new Error("Model not found");
      return (await res.json()).data as Detail;
    },
  });
  const model = query.data;
  if (query.isLoading)
    return (
      <main className="mx-auto max-w-[1200px] px-5 py-12">
        <div className="surface h-[440px] animate-pulse rounded-2xl" />
      </main>
    );
  if (!model)
    return (
      <main className="mx-auto max-w-[1200px] px-5 py-20 text-center">
        <h1 className="text-2xl font-semibold">Model not found</h1>
        <Link
          href="/models"
          className="mt-4 inline-block text-sm text-[#b0a7ff]"
        >
          Back to catalog
        </Link>
      </main>
    );
  const latestPrice = model.pricing[0];
  return (
    <main className="mx-auto min-h-screen max-w-[1200px] px-5 py-8 sm:px-8 sm:py-12">
      <Link
        href="/models"
        className="inline-flex items-center gap-2 text-xs text-[#929baa] hover:text-white"
      >
        <ArrowLeft size={14} /> Model catalog
      </Link>
      <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-[#aab1be]">
              {model.modelFamily || "AI model"}
            </span>
            {model.isOpenSource && (
              <span className="rounded-md bg-[#8fe2c2]/10 px-2 py-1 text-[10px] text-[#8fe2c2]">
                Open weights
              </span>
            )}
            {model.isDemo && (
              <span className="rounded-md bg-[#e8bd75]/10 px-2 py-1 text-[10px] text-[#e8bd75]">
                Illustrative demo record
              </span>
            )}
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-.055em] sm:text-[52px]">
            {model.name}
          </h1>
          <Link
            href={`/companies/${model.company.slug}`}
            className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#9e91ff] hover:text-white"
          >
            {model.company.name}
            <ArrowUpRight size={13} />
          </Link>
          <p className="mt-6 max-w-[740px] text-sm leading-7 text-[#a2a9b6]">
            {model.description}
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {model.capabilities.map(({ capability }) => (
              <span
                key={capability.slug}
                className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-[#c7cbd4]"
              >
                {capability.name}
              </span>
            ))}
            {model.modalities.map(({ modality }) => (
              <span
                key={modality.name}
                className="rounded-full border border-[#a396ff]/20 bg-[#a396ff]/[0.07] px-3 py-1.5 text-[11px] text-[#b6adff]"
              >
                {modality.name}
              </span>
            ))}
          </div>
          <div className="mt-9 flex items-center gap-3">
            <button
              onClick={() => {
                const slugs =
                  new URLSearchParams(window.location.search)
                    .get("models")
                    ?.split(",")
                    .filter(Boolean) || [];
                if (!slugs.includes(model.slug)) slugs.push(model.slug);
                router.push(`/compare?models=${slugs.slice(0, 4).join(",")}`);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#a396ff] px-4 text-xs font-semibold text-[#11121a] hover:bg-[#b7adff]"
            >
              <GitCompareArrows size={14} /> Compare model
            </button>
            <code className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[11px] text-[#aeb5c1]">
              {model.modelIdentifier}
            </code>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <Spec
              icon={<Layers size={15} />}
              label="Context window"
              value={
                model.contextWindow
                  ? model.contextWindow.toLocaleString() + " tokens"
                  : "Not listed"
              }
            />
            <Spec
              icon={<Zap size={15} />}
              label="Max output"
              value={
                model.maxOutputTokens
                  ? model.maxOutputTokens.toLocaleString() + " tokens"
                  : "Not listed"
              }
            />
            <Spec
              icon={<ShieldCheck size={15} />}
              label="License"
              value={model.license || "Not listed"}
            />
          </div>
          <div className="mt-10 grid gap-6 xl:grid-cols-2">
            <div className="surface rounded-xl p-5">
              <div className="flex items-center gap-2">
                <BarChart3 size={15} className="text-[#a396ff]" />
                <h2 className="text-sm font-semibold">Benchmark results</h2>
              </div>
              {model.benchmarkResults.length ? (
                <>
                  <p className="mt-1 text-[10px] text-[#929baa]">
                    Scores are illustrative seed values, not verified
                    evaluations.
                  </p>
                  <div className="mt-4 h-[230px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={model.benchmarkResults.map((item) => ({
                          name: item.benchmark.name,
                          score: Number(item.score),
                        }))}
                        layout="vertical"
                        margin={{ left: 8, right: 15 }}
                      >
                        <CartesianGrid stroke="#252b38" horizontal={false} />
                        <XAxis
                          type="number"
                          tick={{ fill: "#8c95a5", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fill: "#aab1bd", fontSize: 10 }}
                          width={95}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#141923",
                            border: "1px solid #303748",
                            borderRadius: 8,
                            fontSize: 11,
                          }}
                        />
                        <Bar
                          dataKey="score"
                          fill="#a396ff"
                          radius={[0, 5, 5, 0]}
                          barSize={13}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="mt-3 flex flex-col gap-2">
                    {model.benchmarkResults.map((item, index) => (
                      <li
                        key={`${item.benchmark.name}-${index}`}
                        className="flex items-center justify-between border-t border-white/[0.06] pt-2 text-[10px]"
                      >
                        <span className="text-[#abb2bf]">
                          {item.benchmark.name}
                        </span>
                        <span className="text-[#818b9a]">
                          {Number(item.score).toFixed(1)}
                          {item.scoreUnit} ·{" "}
                          {format(new Date(item.evaluationDate), "MMM yyyy")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-5 text-xs text-[#929baa]">
                  No benchmark results have been recorded.
                </p>
              )}
            </div>
            <div className="surface rounded-xl p-5">
              <div className="flex items-center gap-2">
                <Code2 size={15} className="text-[#a396ff]" />
                <h2 className="text-sm font-semibold">Available providers</h2>
              </div>
              <div className="mt-4 flex flex-col">
                {model.providers.map(
                  ({ provider, providerModelId, isAvailable }) => (
                    <Link
                      key={provider.slug}
                      href={`/providers/${provider.slug}`}
                      className="flex items-center justify-between gap-3 border-t border-white/[0.06] py-3 first:border-0"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-white/[0.06] text-[10px] font-semibold text-[#c4bbff]">
                          {provider.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span>
                          <span className="block text-xs font-medium">
                            {provider.name}
                          </span>
                          <span className="mt-0.5 block text-[10px] text-[#798292]">
                            {providerModelId || "Model listing"}
                          </span>
                        </span>
                      </span>
                      <span
                        className={`flex items-center gap-1 text-[10px] ${isAvailable ? "text-[#8fe2c2]" : "text-[#929baa]"}`}
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                        {isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </Link>
                  ),
                )}
              </div>
            </div>
          </div>
          <div className="surface mt-6 rounded-xl p-5">
            <h2 className="text-sm font-semibold">Release history</h2>
            {model.releases.length ? (
              <div className="mt-3 flex flex-col">
                {model.releases.map((release) => (
                  <div
                    key={release.version}
                    className="flex items-start justify-between gap-4 border-t border-white/[0.06] py-3"
                  >
                    <div>
                      <p className="text-xs font-medium">{release.version}</p>
                      <p className="mt-1 text-[11px] text-[#929baa]">
                        {release.changelog || "Release entry"}
                      </p>
                    </div>
                    <time className="shrink-0 text-[10px] text-[#8991a0]">
                      {format(new Date(release.releaseDate), "MMM d, yyyy")}
                    </time>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-[#929baa]">
                No release history recorded.
              </p>
            )}
          </div>
        </section>
        <aside className="flex flex-col gap-4">
          <div className="surface rounded-xl p-5">
            <h2 className="text-sm font-semibold">Pricing</h2>
            <p className="mt-1 text-[10px] text-[#929baa]">
              Per 1M tokens · USD{latestPrice?.isDemo ? " · demo" : ""}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Price
                label="Input"
                value={latestPrice?.inputPricePerMillionTokens}
              />
              <Price
                label="Output"
                value={latestPrice?.outputPricePerMillionTokens}
              />
              <Price
                label="Cached input"
                value={latestPrice?.cachedInputPricePerMillionTokens}
              />
            </div>
            <p className="mt-4 border-t border-white/[0.06] pt-3 text-[10px] text-[#808999]">
              Pricing varies by provider and may change. Confirm with provider
              docs.
            </p>
          </div>
          <div className="surface rounded-xl p-5">
            <h2 className="text-sm font-semibold">Model specifications</h2>
            <dl className="mt-4 flex flex-col gap-3">
              {[
                ["Identifier", model.modelIdentifier],
                ["Model family", model.modelFamily],
                [
                  "Released",
                  model.releaseDate
                    ? format(new Date(model.releaseDate), "MMM d, yyyy")
                    : "Not listed",
                ],
                [
                  "Last updated",
                  model.lastUpdatedAt
                    ? format(new Date(model.lastUpdatedAt), "MMM d, yyyy")
                    : "Not listed",
                ],
                ["License", model.license],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-3 border-t border-white/[0.06] pt-3 first:border-0 first:pt-0"
                >
                  <dt className="text-[10px] text-[#858e9c]">{label}</dt>
                  <dd className="max-w-[150px] break-words text-right text-[10px] text-[#d1d5dd]">
                    {value || "—"}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-xl border border-[#e8bd75]/15 bg-[#e8bd75]/[0.05] p-4">
            <p className="text-[11px] font-medium text-[#efcf98]">
              About this catalog data
            </p>
            <p className="mt-1.5 text-[10px] leading-5 text-[#b2a58f]">
              Seeded benchmark and pricing values are for demonstration only.
              They are not sourced from live evaluations.
            </p>
          </div>
        </aside>
      </div>
      {model.relatedModels.length > 0 && (
        <section className="mt-12">
          <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#a396ff]">
            Keep exploring
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-.04em]">
            Related models
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {model.relatedModels.map((related) => (
              <ModelCard key={related.slug} model={related} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
function Spec({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="surface rounded-xl p-4">
      <div className="flex items-center gap-2 text-[#a396ff]">
        {icon}
        <span className="text-[10px] text-[#929baa]">{label}</span>
      </div>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}
function Price({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-3">
      <p className="text-[10px] text-[#929baa]">{label}</p>
      <p className="mt-1.5 text-sm font-semibold">
        {value == null ? "—" : `$${Number(value).toFixed(2)}`}
      </p>
    </div>
  );
}
