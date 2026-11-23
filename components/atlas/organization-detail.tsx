"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Building2, Network } from "lucide-react";
import { ModelCard, type ModelCardData } from "@/components/models/model-card";

type Company = {
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  headquarters: string | null;
  models: ModelCardData[];
};
type Provider = {
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  documentationUrl: string | null;
  modelListings: {
    model: ModelCardData;
    providerModelId: string | null;
    isAvailable: boolean;
  }[];
};
export function OrganizationDetail({ kind }: { kind: "company" | "provider" }) {
  const { slug } = useParams<{ slug: string }>();
  const query = useQuery({
    queryKey: [kind, slug],
    queryFn: async () => {
      const r = await fetch(
        `/api/${kind === "company" ? "companies" : "providers"}/${slug}`,
      );
      if (!r.ok) throw new Error();
      return (await r.json()).data as Company | Provider;
    },
  });
  if (query.isLoading)
    return (
      <main className="mx-auto max-w-[1280px] px-5 py-12">
        <div className="surface h-72 animate-pulse rounded-xl" />
      </main>
    );
  if (query.isError || !query.data)
    return (
      <main className="px-5 py-20 text-center">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <Link
          href={`/${kind === "company" ? "companies" : "providers"}`}
          className="mt-4 inline-block text-sm text-[#b2aaff]"
        >
          Back to directory
        </Link>
      </main>
    );
  const data = query.data;
  const company = kind === "company" ? (data as Company) : null;
  const provider = kind === "provider" ? (data as Provider) : null;
  const models = company
    ? company.models
    : provider!.modelListings.map((item) => item.model);
  return (
    <main className="mx-auto min-h-screen max-w-[1280px] px-5 py-9 sm:px-8 sm:py-12">
      <Link
        href={`/${kind === "company" ? "companies" : "providers"}`}
        className="text-xs text-[#929baa] hover:text-white"
      >
        ← {kind === "company" ? "Companies" : "Providers"}
      </Link>
      <section className="surface mt-6 rounded-2xl p-6 sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-[#a396ff]/10 text-base font-semibold text-[#bdb4ff]">
              {data.name
                .split(/\s+/)
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </span>
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.14em] text-[#9c91ff]">
                {kind === "company" ? (
                  <Building2 size={12} />
                ) : (
                  <Network size={12} />
                )}{" "}
                {kind} profile
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-.05em]">
                {data.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a2a9b6]">
                {data.description || "Profile details are not yet available."}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {data.website && (
              <a
                href={data.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-[11px] text-[#c4c9d2] hover:bg-white/[0.04]"
              >
                Website <ArrowUpRight size={12} />
              </a>
            )}
            {provider?.documentationUrl && (
              <a
                href={provider.documentationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#a396ff] px-3 py-2 text-[11px] font-semibold text-[#101119]"
              >
                Documentation <ArrowUpRight size={12} />
              </a>
            )}
          </div>
        </div>
        <div className="mt-7 flex gap-8 border-t border-white/[0.07] pt-5">
          <div>
            <p className="text-xl font-semibold">{models.length}</p>
            <p className="mt-1 text-[10px] text-[#929baa]">
              {kind === "company"
                ? "catalog models"
                : "available model listings"}
            </p>
          </div>
          {company?.headquarters && (
            <div>
              <p className="text-sm font-medium">{company.headquarters}</p>
              <p className="mt-1 text-[10px] text-[#929baa]">Headquarters</p>
            </div>
          )}
        </div>
      </section>
      <div className="mt-10 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#a396ff]">
            {kind === "company" ? "The lineup" : "Provider catalog"}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-.04em]">
            {kind === "company"
              ? "Models from " + data.name
              : "Models available through " + data.name}
          </h2>
        </div>
        <span className="text-xs text-[#929baa]">{models.length} models</span>
      </div>
      {models.length ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {models.map((model) => (
            <ModelCard key={model.slug} model={model} />
          ))}
        </div>
      ) : (
        <div className="surface mt-5 rounded-xl p-8 text-center text-sm text-[#929baa]">
          No models are associated with this profile yet.
        </div>
      )}
    </main>
  );
}
