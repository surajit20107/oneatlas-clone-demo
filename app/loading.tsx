export default function Loading() {
  return (
    <main className="mx-auto min-h-[70vh] max-w-[1280px] px-5 py-12">
      <div className="h-8 w-48 animate-pulse rounded bg-white/[0.06]" />
      <div className="mt-3 h-4 w-72 animate-pulse rounded bg-white/[0.04]" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="surface h-[230px] animate-pulse rounded-xl"
          />
        ))}
      </div>
    </main>
  );
}
