"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
      <p className="text-xs uppercase tracking-[.15em] text-[#a396ff]">
        Something went wrong
      </p>
      <h1 className="mt-3 text-2xl font-semibold">
        We couldn&apos;t load this page.
      </h1>
      <p className="mt-2 text-sm text-[#929baa]">
        The page may be temporarily unavailable. Try again.
      </p>
      <button
        onClick={reset}
        className="mt-5 rounded-lg bg-[#a396ff] px-4 py-2.5 text-xs font-semibold text-[#101119]"
      >
        Try again
      </button>
    </main>
  );
}
