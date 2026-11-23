"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  GitCompareArrows,
  Layers3,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type ModelCardData = {
  name: string;
  slug: string;
  modelIdentifier: string;
  description: string | null;
  modelFamily: string | null;
  contextWindow: number | null;
  maxOutputTokens: number | null;
  isOpenSource: boolean;
  isDemo: boolean;
  company: { name: string; slug: string };
  providers: { provider: { name: string; slug: string } }[];
  capabilities: { capability: { name: string; slug: string } }[];
  modalities: { modality: { name: string } }[];
  pricing: {
    inputPricePerMillionTokens: string | number | null;
    outputPricePerMillionTokens: string | number | null;
    isDemo: boolean;
  }[];
};
const money = (value: string | number | null | undefined) =>
  value == null ? "—" : `$${Number(value).toFixed(2)}`;
const context = (value: number | null) =>
  !value
    ? "—"
    : value >= 1_000_000
      ? `${(value / 1_000_000).toFixed(value % 1_000_000 ? 1 : 0)}M`
      : `${Math.round(value / 1000)}K`;
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function ModelCard({
  model,
  selected = false,
}: {
  model: ModelCardData;
  selected?: boolean;
}) {
  const router = useRouter();
  function compare() {
    const params = new URLSearchParams(window.location.search);
    const current = (params.get("models") || "").split(",").filter(Boolean);
    if (!current.includes(model.slug) && current.length < 4)
      current.push(model.slug);
    router.push(`/compare?models=${current.join(",")}`);
  }
  return (
    <article className="surface surface-hover flex min-h-[237px] flex-col rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#a396ff]/20 bg-[#8b7cff]/10 text-xs font-semibold text-[#c4bbff]">
          {initials(model.company.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/models/${model.slug}`}
              className="truncate text-[15px] font-semibold tracking-[-.02em] hover:text-[#c1b8ff]"
            >
              {model.name}
            </Link>
            {model.isOpenSource && (
              <Badge
                variant="secondary"
                className="h-5 border border-[#8fe2c2]/15 bg-[#8fe2c2]/10 px-1.5 text-[9px] text-[#8fe2c2]"
              >
                Open weights
              </Badge>
            )}
          </div>
          <p className="mt-1 truncate text-[11px] text-[#929baa]">
            {model.company.name} <span className="px-1 text-[#555d6b]">/</span>{" "}
            {model.modelIdentifier}
          </p>
        </div>
        <Link
          href={`/models/${model.slug}`}
          aria-label={`Open ${model.name}`}
          className="text-[#727b8b] hover:text-white"
        >
          <ArrowUpRight size={15} />
        </Link>
      </div>
      <p className="mt-4 line-clamp-2 min-h-9 text-xs leading-[1.65] text-[#9ca4b3]">
        {model.description || "Model specifications are not yet provided."}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {model.capabilities.slice(0, 3).map(({ capability }) => (
          <Badge
            key={capability.slug}
            variant="outline"
            className="h-5 border-white/[0.09] bg-white/[0.02] px-2 text-[9px] font-medium text-[#b1b8c5]"
          >
            {capability.name}
          </Badge>
        ))}
        {model.isDemo && (
          <Badge
            variant="outline"
            className="h-5 border-[#e8bd75]/20 bg-[#e8bd75]/[0.08] px-2 text-[9px] text-[#e8bd75]"
          >
            Demo data
          </Badge>
        )}
      </div>
      <div className="mt-auto grid grid-cols-3 gap-2 border-t border-white/[0.07] pt-4">
        <Metric
          icon={<Layers3 size={12} />}
          label="Context"
          value={context(model.contextWindow)}
        />
        <Metric
          icon={<Sparkles size={12} />}
          label="Input / 1M"
          value={money(model.pricing[0]?.inputPricePerMillionTokens)}
        />
        <Metric
          icon={<BarChart3 size={12} />}
          label="Providers"
          value={String(model.providers.length)}
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="truncate text-[10px] text-[#778091]">
          {model.providers
            .slice(0, 2)
            .map((item) => item.provider.name)
            .join(" · ") || "No provider listings"}
        </span>
        <button
          onClick={compare}
          aria-pressed={selected}
          className="focus-ring flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[10px] text-[#a9a0ff] transition-colors hover:bg-[#a396ff]/10"
        >
          <GitCompareArrows size={12} /> Compare
        </button>
      </div>
    </article>
  );
}
function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-[9px] text-[#7b8494]">
        {icon}
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-medium text-[#e1e4eb]">
        {value}
      </p>
    </div>
  );
}
