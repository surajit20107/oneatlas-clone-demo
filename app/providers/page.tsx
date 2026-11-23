"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Network, Search } from "lucide-react";
import { useState } from "react";
type Provider = {
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  documentationUrl: string | null;
  _count: { modelListings: number };
};
export default function ProvidersPage() {
  const [search, setSearch] = useState("");
  const query = useQuery({
    queryKey: ["providers", search],
    queryFn: async () => {
      const r = await fetch(
        `/api/providers${search ? `?q=${encodeURIComponent(search)}` : ""}`,
      );
      return (await r.json()).data as Provider[];
    },
  });
  return (
    <main className="mx-auto min-h-screen max-w-[1280px] px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.15em] text-[#a396ff]">
        <Network size={14} /> Inference landscape
      </div>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-.05em] sm:text-[40px]">
            Inference providers
          </h1>
          <p className="mt-2 text-sm text-[#929baa]">
            Find the infrastructure and APIs serving AI models.
          </p>
        </div>
        <label className="flex h-10 w-full max-w-[300px] items-center gap-2 rounded-lg border border-white/10 bg-[#10141d] px-3">
          <Search size={14} className="text-[#858e9d]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search providers"
            className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#778191]"
          />
        </label>
      </div>
      {query.isLoading ? (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((x) => (
            <div key={x} className="surface h-40 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : query.data?.length ? (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {query.data.map((provider) => (
            <Link
              key={provider.slug}
              href={`/providers/${provider.slug}`}
              className="surface surface-hover rounded-xl p-5"
            >
              <div className="flex items-start justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#a396ff]/10 text-xs font-semibold text-[#b9b0ff]">
                  {provider.name
                    .split(/\s+/)
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <ArrowUpRight size={14} className="text-[#778191]" />
              </div>
              <h2 className="mt-4 text-sm font-semibold">{provider.name}</h2>
              <p className="mt-1 line-clamp-2 min-h-9 text-[11px] leading-5 text-[#929baa]">
                {provider.description ||
                  "Provider information not yet available."}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3 text-[10px] text-[#858e9d]">
                <span>{provider._count.modelListings} listed models</span>
                <span>Explore listings →</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="surface mt-7 rounded-xl p-10 text-center text-sm text-[#929baa]">
          No providers match this search.
        </div>
      )}
    </main>
  );
}
