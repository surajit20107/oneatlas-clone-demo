"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Sparkle, Command, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SearchData = {
  models: {
    name: string;
    slug: string;
    modelIdentifier: string;
    company: { name: string };
  }[];
  companies: { name: string; slug: string }[];
  providers: { name: string; slug: string }[];
};
const links = [
  { href: "/models", label: "Models" },
  { href: "/rankings", label: "Rankings" },
  { href: "/companies", label: "Companies" },
  { href: "/providers", label: "Providers" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const modalInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [focused, setFocused] = useState(false);
  const search = useQuery({
    queryKey: ["global-search", debounced],
    enabled: debounced.length > 0,
    queryFn: async () => {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(debounced)}`,
      );
      if (!response.ok) throw new Error("Search unavailable");
      return (await response.json()).data as SearchData;
    },
  });
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        dialogRef.current?.showModal();
        window.setTimeout(() => modalInputRef.current?.focus(), 0);
      }
      if (event.key === "Escape") {
        setFocused(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const results = search.data;
  const showing = focused && query.trim().length > 0;
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#090b10]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center gap-8 px-5 sm:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label="OneAtlas home"
        >
          <span className="flex size-8 items-center justify-center rounded-[10px] border border-[#9c8cff]/30 bg-[#8b7cff]/10 text-[#b7adff]">
            <Sparkle size={16} />
          </span>
          <span className="text-[17px] font-semibold tracking-[-0.04em]">
            oneatlas<span className="text-[#a396ff]">.</span>
          </span>
        </Link>
        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname.startsWith(link.href) ? "page" : undefined}
              className={`text-[13px] transition-colors hover:text-white ${pathname.startsWith(link.href) ? "text-white" : "text-[#929baa]"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="relative ml-auto hidden w-full max-w-[252px] lg:block">
          <label className="flex h-9 items-center gap-2.5 rounded-lg border border-white/[0.09] bg-white/[0.035] px-3 text-[#838b9b] focus-within:border-[#8b7cff]/50 focus-within:text-white">
            <Search size={14} aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => window.setTimeout(() => setFocused(false), 150)}
              aria-label="Search models, companies, and providers"
              placeholder="Search the atlas..."
              className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-[#7d8593]"
            />
            <kbd className="flex items-center gap-0.5 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-[#858c9b]">
              <Command size={10} />K
            </kbd>
          </label>
          {showing && (
            <div className="absolute top-11 right-0 left-0 z-50 max-h-[440px] overflow-auto rounded-xl border border-white/10 bg-[#11151e] p-2 shadow-2xl shadow-black/50">
              {search.isFetching && (
                <p className="px-3 py-3 text-xs text-[#929baa]">
                  Searching the catalog…
                </p>
              )}
              {!search.isFetching &&
                results &&
                !results.models.length &&
                !results.companies.length &&
                !results.providers.length && (
                  <p className="px-3 py-3 text-xs text-[#929baa]">
                    No matching models or organizations.
                  </p>
                )}
              {results?.models.length ? (
                <SearchGroup title="Models">
                  {results.models.map((item) => (
                    <SearchLink
                      key={item.slug}
                      href={`/models/${item.slug}`}
                      title={item.name}
                      meta={`${item.company.name} · ${item.modelIdentifier}`}
                    />
                  ))}
                </SearchGroup>
              ) : null}
              {results?.companies.length ? (
                <SearchGroup title="Companies">
                  {results.companies.map((item) => (
                    <SearchLink
                      key={item.slug}
                      href={`/companies/${item.slug}`}
                      title={item.name}
                      meta="AI company"
                    />
                  ))}
                </SearchGroup>
              ) : null}
              {results?.providers.length ? (
                <SearchGroup title="Providers">
                  {results.providers.map((item) => (
                    <SearchLink
                      key={item.slug}
                      href={`/providers/${item.slug}`}
                      title={item.name}
                      meta="Inference provider"
                    />
                  ))}
                </SearchGroup>
              ) : null}
            </div>
          )}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-4 lg:ml-0">
          <button
            onClick={() => {
              dialogRef.current?.showModal();
              window.setTimeout(() => modalInputRef.current?.focus(), 0);
            }}
            aria-label="Open global search"
            className="rounded-md p-1.5 text-[#929baa] hover:bg-white/[0.06] hover:text-white"
          >
            <Search size={15} />
          </button>
          <Link
            href="/compare"
            className="flex items-center gap-1.5 text-[12px] text-[#b8beca] transition-colors hover:text-white"
          >
            Compare <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
      <nav
        className="flex gap-5 overflow-x-auto border-t border-white/[0.05] px-5 py-2.5 md:hidden"
        aria-label="Mobile navigation"
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 text-xs ${pathname.startsWith(link.href) ? "text-white" : "text-[#929baa]"}`}
          >
            {link.label}
          </Link>
        ))}
        <Link href="/admin" className="shrink-0 text-xs text-[#929baa]">
          Admin
        </Link>
      </nav>
      <dialog
        ref={dialogRef}
        aria-labelledby="global-search-title"
        onClose={() => setFocused(false)}
        className="fixed inset-x-4 top-[12vh] mx-auto m-0 w-auto max-w-xl rounded-2xl border border-white/10 bg-[#11151e] p-3 text-white shadow-2xl backdrop:bg-black/70 sm:inset-x-auto sm:w-full"
      >
        <h2 id="global-search-title" className="sr-only">
          Search the OneAtlas catalog
        </h2>
        <label className="flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-[#090c12] px-3">
          <Search size={15} className="text-[#a396ff]" />
          <input
            ref={modalInputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search models, companies, and providers"
            placeholder="Search models, companies, providers…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#778091]"
          />
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close search"
            className="rounded p-1 text-[#929baa] hover:bg-white/[0.06] hover:text-white"
          >
            <X size={14} />
          </button>
        </label>
        <div className="mt-2 max-h-[55vh] overflow-y-auto rounded-lg">
          {!query.trim() ? (
            <p className="px-3 py-5 text-xs text-[#929baa]">
              Search models, companies, and inference providers.
            </p>
          ) : search.isFetching ? (
            <p className="px-3 py-5 text-xs text-[#929baa]">
              Searching the catalog…
            </p>
          ) : results &&
            !results.models.length &&
            !results.companies.length &&
            !results.providers.length ? (
            <p className="px-3 py-5 text-xs text-[#929baa]">
              No matching models or organizations.
            </p>
          ) : (
            <>
              {results?.models.length ? (
                <SearchGroup title="Models">
                  {results.models.map((item) => (
                    <SearchLink
                      key={item.slug}
                      href={`/models/${item.slug}`}
                      title={item.name}
                      meta={`${item.company.name} · ${item.modelIdentifier}`}
                    />
                  ))}
                </SearchGroup>
              ) : null}
              {results?.companies.length ? (
                <SearchGroup title="Companies">
                  {results.companies.map((item) => (
                    <SearchLink
                      key={item.slug}
                      href={`/companies/${item.slug}`}
                      title={item.name}
                      meta="AI company"
                    />
                  ))}
                </SearchGroup>
              ) : null}
              {results?.providers.length ? (
                <SearchGroup title="Providers">
                  {results.providers.map((item) => (
                    <SearchLink
                      key={item.slug}
                      href={`/providers/${item.slug}`}
                      title={item.name}
                      meta="Inference provider"
                    />
                  ))}
                </SearchGroup>
              ) : null}
            </>
          )}
        </div>
        <p className="border-t border-white/[0.07] px-3 pt-2 text-[10px] text-[#778191]">
          Search is powered by the OneAtlas catalog · Press Esc to close
        </p>
      </dialog>
    </header>
  );
}
function SearchGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-1">
      <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[.14em] text-[#768093]">
        {title}
      </p>
      {children}
    </div>
  );
}
function SearchLink({
  href,
  title,
  meta,
}: {
  href: string;
  title: string;
  meta: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-white/[0.06]"
    >
      <span className="min-w-0">
        <span className="block truncate text-[13px] text-white">{title}</span>
        <span className="block truncate text-[11px] text-[#929baa]">
          {meta}
        </span>
      </span>
      <ArrowUpRight size={13} className="shrink-0 text-[#768093]" />
    </Link>
  );
}
