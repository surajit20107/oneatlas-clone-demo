import Link from "next/link";
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
      <p className="text-xs uppercase tracking-[.16em] text-[#a396ff]">
        404 · Not in the atlas
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em]">
        We couldn&apos;t find that page.
      </h1>
      <p className="mt-2 text-sm text-[#929baa]">
        Try the model catalog or search across the ecosystem.
      </p>
      <Link
        href="/models"
        className="mt-5 rounded-lg bg-[#a396ff] px-4 py-2.5 text-xs font-semibold text-[#101119]"
      >
        Explore models
      </Link>
    </main>
  );
}
