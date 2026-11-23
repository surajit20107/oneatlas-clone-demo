"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Blocks,
  Bot,
  Braces,
  Command,
  Database,
  Globe2,
  Layers3,
  Network,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { ModelCard, type ModelCardData } from "@/components/models/model-card";

type Envelope<T> = { success: boolean; data: T };
type ProviderSummary = {
  name: string;
  slug: string;
  _count: { modelListings: number };
};
type BenchmarkHighlight = {
  rank: number;
  score: string;
  scoreUnit: string;
  model: { name: string; slug: string };
  benchmark: { name: string };
};
async function get<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Request failed");
  return ((await response.json()) as Envelope<T>).data;
}

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const stats = useQuery({
    queryKey: ["stats"],
    queryFn: () =>
      get<{
        models: number;
        companies: number;
        providers: number;
        benchmarks: number;
      }>("/api/stats"),
  });
  const models = useQuery({
    queryKey: ["featured-models"],
    queryFn: () => get<ModelCardData[]>("/api/models?limit=6&sort=popular"),
  });
  const providers = useQuery({
    queryKey: ["popular-providers"],
    queryFn: () => get<ProviderSummary[]>("/api/providers"),
  });
  const benchmarks = useQuery({
    queryKey: ["benchmark-highlights"],
    queryFn: () => get<BenchmarkHighlight[]>("/api/rankings"),
  });
  const result = useQuery({
    queryKey: ["hero-search", debounced],
    enabled: debounced.length > 0,
    queryFn: () =>
      get<{
        models: { name: string; slug: string; company: { name: string } }[];
      }>(`/api/search?q=${encodeURIComponent(debounced)}`),
  });
  const [timer, setTimer] = useState<
    ReturnType<typeof setTimeout> | undefined
  >();
  function onSearch(value: string) {
    setSearch(value);
    clearTimeout(timer);
    setTimer(setTimeout(() => setDebounced(value.trim()), 250));
  }
  const categories = [
    {
      name: "Reasoning",
      detail: "Models that think through complex problems",
      icon: Sparkles,
      query: "Reasoning",
    },
    {
      name: "Coding",
      detail: "From autocomplete to agentic development",
      icon: Braces,
      query: "Coding",
    },
    {
      name: "Multimodal",
      detail: "Models that work beyond text",
      icon: Layers3,
      query: "Multimodal",
    },
    {
      name: "Open weights",
      detail: "Build with models you can run yourself",
      icon: Globe2,
      query: "open",
    },
  ];

  return (
    <main>
      <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
        <div className="grid-glow pointer-events-none absolute inset-0 -z-10 opacity-60" />
        <div className="absolute -top-48 left-[45%] -z-10 size-[580px] rounded-full bg-[#7062f4]/[0.08] blur-[120px]" />
        <div className="mx-auto max-w-[1440px] px-5 pt-16 pb-16 sm:px-8 sm:pt-20 sm:pb-20 lg:pt-[106px] lg:pb-[100px]">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[.16em] text-[#9b91ff]">
            <span className="size-1.5 rounded-full bg-[#a396ff] shadow-[0_0_12px_#a396ff]" />{" "}
            The intelligence layer for AI
          </div>
          <div className="mt-6 max-w-[790px]">
            <h1 className="text-[42px] leading-[1.04] font-semibold tracking-[-.065em] sm:text-[62px] lg:text-[72px]">
              Find the right model.
              <br />
              <span className="text-gradient">Build what&apos;s next.</span>
            </h1>
            <p className="mt-6 max-w-[570px] text-[15px] leading-7 text-[#a1a8b5] sm:text-[17px]">
              One clear view of the models, providers, pricing, and benchmarks
              shaping the AI ecosystem.
            </p>
          </div>
          <div className="relative mt-9 max-w-[610px]">
            <label className="flex h-[54px] items-center gap-3 rounded-xl border border-white/[0.12] bg-[#121722]/90 px-4 shadow-[0_12px_60px_#00000055] focus-within:border-[#a396ff]/60">
              <Search size={17} className="shrink-0 text-[#968aff]" />
              <input
                value={search}
                onChange={(event) => onSearch(event.target.value)}
                placeholder="Search models, companies, providers..."
                aria-label="Search models, companies, and providers"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#778091]"
              />
              <kbd className="hidden items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-[#7e8796] sm:flex">
                <Command size={10} /> K
              </kbd>
              <Link
                href={`/models${search ? `?search=${encodeURIComponent(search)}` : ""}`}
                className="rounded-lg bg-[#a396ff] px-3 py-2 text-[11px] font-semibold text-[#11121a] hover:bg-[#b7adff]"
              >
                Explore
              </Link>
            </label>
            {debounced && (
              <div className="absolute z-20 mt-2 w-full rounded-xl border border-white/10 bg-[#11151e] p-2 shadow-2xl">
                {result.isFetching ? (
                  <p className="p-3 text-xs text-[#929baa]">
                    Searching catalog…
                  </p>
                ) : result.data?.models.length ? (
                  result.data.models.slice(0, 5).map((item) => (
                    <Link
                      key={item.slug}
                      href={`/models/${item.slug}`}
                      className="flex justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-white/[0.06]"
                    >
                      {item.name}
                      <span className="text-xs text-[#929baa]">
                        {item.company.name}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="p-3 text-xs text-[#929baa]">
                    No matching models yet.
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-[#788191]">
            <span className="text-[#a0a7b5]">Popular searches</span>
            {["Claude Sonnet", "GPT-4.1", "DeepSeek R1"].map((term) => (
              <button
                key={term}
                onClick={() => {
                  onSearch(term);
                  setDebounced(term);
                }}
                className="hover:text-white"
              >
                {term}
              </button>
            ))}
          </div>
          <div className="mt-14 grid grid-cols-2 gap-y-5 border-t border-white/[0.08] pt-6 sm:grid-cols-4">
            <Stat
              label="Models indexed"
              value={stats.data?.models}
              icon={<Bot size={13} />}
            />
            <Stat
              label="AI organizations"
              value={stats.data?.companies}
              icon={<Blocks size={13} />}
            />
            <Stat
              label="Inference providers"
              value={stats.data?.providers}
              icon={<Zap size={13} />}
            />
            <Stat
              label="Benchmark suites"
              value={stats.data?.benchmarks}
              icon={<Database size={13} />}
            />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-16">
        <SectionHeading
          eyebrow="A better starting point"
          title="Explore by what matters"
          action="All models"
          href="/models"
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(({ name, detail, icon: Icon, query }) => (
            <Link
              key={name}
              href={
                query === "open"
                  ? "/models?openSource=true"
                  : `/models?search=${encodeURIComponent(query)}`
              }
              className="surface surface-hover group rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-lg bg-[#a396ff]/10 text-[#ada4ff]">
                  <Icon size={16} />
                </span>
                <ArrowUpRight
                  size={14}
                  className="text-[#667081] transition-colors group-hover:text-white"
                />
              </div>
              <h3 className="mt-4 text-sm font-medium">{name}</h3>
              <p className="mt-1.5 text-xs leading-5 text-[#929baa]">
                {detail}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8">
        <SectionHeading
          eyebrow="The model landscape"
          title="Most widely listed"
          action="Browse all models"
          href="/models"
        />
        {models.isLoading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="surface h-[235px] animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : models.data?.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {models.data.slice(0, 6).map((model) => (
              <ModelCard key={model.slug} model={model} />
            ))}
          </div>
        ) : (
          <EmptyState text="Catalog data is being prepared. Seed the connected database to load models here." />
        )}
      </section>
      <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <SectionHeading
              eyebrow="Where models run"
              title="Popular providers"
              action="All providers"
              href="/providers"
            />
            <div className="mt-5 grid grid-cols-2 gap-3">
              {(providers.data || [])
                .slice()
                .sort((a, b) => b._count.modelListings - a._count.modelListings)
                .slice(0, 4)
                .map((provider) => (
                  <Link
                    key={provider.slug}
                    href={`/providers/${provider.slug}`}
                    className="surface surface-hover rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-[#a396ff]/10 text-[10px] font-semibold text-[#b9b0ff]">
                        {provider.name
                          .split(/\\s+/)
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                      <Network size={13} className="text-[#6f7888]" />
                    </div>
                    <p className="mt-3 truncate text-xs font-medium">
                      {provider.name}
                    </p>
                    <p className="mt-1 text-[10px] text-[#858e9d]">
                      {provider._count.modelListings} model listings
                    </p>
                  </Link>
                ))}
            </div>
          </div>
          <div>
            <SectionHeading
              eyebrow="Recorded evaluations"
              title="Benchmark highlights"
              action="View rankings"
              href="/rankings"
            />
            <div className="surface mt-5 rounded-xl p-2">
              {(benchmarks.data || []).slice(0, 4).map((item) => (
                <Link
                  key={`${item.benchmark.name}-${item.model.slug}`}
                  href={`/models/${item.model.slug}`}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.04]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-medium">
                      {item.model.name}
                    </span>
                    <span className="mt-1 block text-[10px] text-[#858e9d]">
                      {item.benchmark.name}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-md bg-[#a396ff]/10 px-2 py-1 text-[10px] font-semibold text-[#c5bdff]">
                    {Number(item.score).toFixed(1)}
                    {item.scoreUnit}
                  </span>
                </Link>
              ))}
              <p className="border-t border-white/[0.06] px-3 py-2 text-[9px] leading-4 text-[#9a8e72]">
                Illustrative demo scores only — not verified evaluations.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8">
        <div className="surface relative overflow-hidden rounded-2xl p-7 sm:flex sm:items-center sm:justify-between sm:p-9">
          <div className="absolute -right-20 -bottom-32 size-80 rounded-full bg-[#8b7cff]/10 blur-[80px]" />
          <div className="relative">
            <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#a396ff]">
              Make a more informed choice
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-.04em] sm:text-[30px]">
              Compare models side by side.
            </h2>
            <p className="mt-2 max-w-lg text-sm text-[#929baa]">
              Bring specs, provider availability, pricing, and benchmark data
              into one view.
            </p>
          </div>
          <Link
            href="/compare"
            className="relative mt-5 inline-flex items-center gap-2 rounded-lg bg-[#a396ff] px-4 py-2.5 text-xs font-semibold text-[#101119] hover:bg-[#b9b0ff] sm:mt-0"
          >
            Start a comparison <ArrowRight size={14} />
          </Link>
        </div>
      </section>
      <footer className="border-t border-white/[0.07]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-6 text-[11px] text-[#7f8795] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© 2026 OneAtlas.dev · AI model intelligence</span>
          <span>
            Demo benchmark and pricing values are illustrative, not verified
            live data.
          </span>
          <div className="flex gap-4">
            <Link href="/companies" className="hover:text-white">
              Companies
            </Link>
            <Link href="/providers" className="hover:text-white">
              Providers
            </Link>
            <Link href="/rankings" className="hover:text-white">
              Rankings
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value?: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-1 text-[#9288ff]">{icon}</span>
      <div>
        <p className="text-xl font-semibold tracking-[-.04em]">
          {value == null ? "—" : value.toLocaleString()}
        </p>
        <p className="mt-1 text-[10px] text-[#868e9d]">{label}</p>
      </div>
    </div>
  );
}
function SectionHeading({
  eyebrow,
  title,
  action,
  href,
}: {
  eyebrow: string;
  title: string;
  action: string;
  href: string;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#a396ff]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-[23px] font-semibold tracking-[-.045em] sm:text-[28px]">
          {title}
        </h2>
      </div>
      <Link
        href={href}
        className="mb-1 flex shrink-0 items-center gap-1.5 text-[11px] text-[#a396ff] hover:text-white"
      >
        {action}
        <ArrowRight size={13} />
      </Link>
    </div>
  );
}
function EmptyState({ text }: { text: string }) {
  return (
    <div className="surface mt-6 rounded-xl p-8 text-center text-sm text-[#929baa]">
      {text}
    </div>
  );
}
