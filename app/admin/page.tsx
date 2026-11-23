"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import {
  Check,
  KeyRound,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";

type Company = { id: string; name: string };
type Model = {
  id: string;
  name: string;
  slug: string;
  modelIdentifier: string;
  companyId: string;
  company: { name: string };
  description: string | null;
  modelFamily: string | null;
  contextWindow: number | null;
  maxOutputTokens: number | null;
  isOpenSource: boolean;
  license: string | null;
};
const schema = z.object({
  name: z.string().min(2, "Enter at least 2 characters").max(120),
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens",
    ),
  modelIdentifier: z.string().min(2).max(180),
  companyId: z.string().min(1, "Choose a company"),
  description: z.string().max(2000).optional(),
  contextWindow: z.preprocess(
    (value) => (value === "" || value == null ? undefined : Number(value)),
    z.number().int().positive().optional(),
  ),
  maxOutputTokens: z.preprocess(
    (value) => (value === "" || value == null ? undefined : Number(value)),
    z.number().int().positive().optional(),
  ),
  isOpenSource: z.boolean().default(false),
  license: z.string().max(120).optional(),
});
type FormValues = z.infer<typeof schema>;
export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [active, setActive] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [values, setValues] = useState("");
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["admin-models", values],
    enabled: active,
    queryFn: async () => {
      const r = await fetch("/api/admin/models", {
        headers: { "x-admin-secret": values },
      });
      if (!r.ok) throw new Error("Admin access denied or not configured");
      return (await r.json()).data as { models: Model[]; companies: Company[] };
    },
  });
  const form = useForm<z.input<typeof schema>, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      modelIdentifier: "",
      companyId: "",
      description: "",
      isOpenSource: false,
      license: "",
    },
  });
  async function enter(event: React.FormEvent) {
    event.preventDefault();
    setValues(secret);
    setActive(true);
  }
  async function submit(data: FormValues) {
    try {
      const r = await fetch(
        editing ? `/api/admin/models/${editing}` : "/api/admin/models",
        {
          method: editing ? "PATCH" : "POST",
          headers: {
            "content-type": "application/json",
            "x-admin-secret": values,
          },
          body: JSON.stringify(data),
        },
      );
      if (!r.ok)
        throw new Error((await r.json()).error?.message || "Save failed");
      toast.success(editing ? "Model updated" : "Model created");
      setEditing(null);
      form.reset();
      await client.invalidateQueries({ queryKey: ["admin-models"] });
      await client.invalidateQueries({ queryKey: ["models"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    }
  }
  async function edit(model: Model) {
    setEditing(model.id);
    form.reset({
      name: model.name,
      slug: model.slug,
      modelIdentifier: model.modelIdentifier,
      companyId: model.companyId,
      description: model.description || "",
      contextWindow: model.contextWindow || undefined,
      maxOutputTokens: model.maxOutputTokens || undefined,
      isOpenSource: model.isOpenSource,
      license: model.license || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function remove(model: Model) {
    if (
      !window.confirm(
        `Delete ${model.name}? This removes its associated pricing and benchmark records.`,
      )
    )
      return;
    try {
      const r = await fetch(`/api/admin/models/${model.id}?confirm=true`, {
        method: "DELETE",
        headers: { "x-admin-secret": values },
      });
      if (!r.ok) throw new Error("Delete failed");
      toast.success("Model deleted");
      await client.invalidateQueries({ queryKey: ["admin-models"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }
  return (
    <main className="mx-auto min-h-screen max-w-[1100px] px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.15em] text-[#a396ff]">
        <ShieldCheck size={14} /> Restricted access
      </div>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] sm:text-[40px]">
        Catalog administration
      </h1>
      <p className="mt-2 text-sm text-[#929baa]">
        Manage model records. Changes are validated on the server before they
        are saved.
      </p>
      {!active ? (
        <form
          onSubmit={enter}
          className="surface mt-7 max-w-[500px] rounded-xl p-5"
        >
          <label className="text-xs font-medium">
            Admin secret
            <input
              required
              type="password"
              autoComplete="current-password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-[#090c12] px-3 text-sm outline-none focus:border-[#a396ff]/50"
              placeholder="Enter your environment-configured secret"
            />
          </label>
          <p className="mt-2 text-[10px] leading-5 text-[#828b9a]">
            The server must have ADMIN_SECRET configured. This value is held in
            memory for this page session only.
          </p>
          <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#a396ff] px-4 py-2.5 text-xs font-semibold text-[#11121a]">
            <KeyRound size={13} /> Unlock admin
          </button>
        </form>
      ) : query.isError ? (
        <div className="mt-7 rounded-xl border border-[#ee8585]/20 bg-[#ee8585]/[0.06] p-5 text-sm text-[#f2a1a1]">
          Admin access was rejected. Confirm the secret is configured for the
          server and try again.
          <button
            onClick={() => {
              setActive(false);
              setSecret("");
            }}
            className="ml-2 underline"
          >
            Lock
          </button>
        </div>
      ) : (
        <div className="mt-7 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <form
            onSubmit={form.handleSubmit(submit)}
            className="surface h-fit rounded-xl p-5"
          >
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Plus size={14} className="text-[#a396ff]" />
              {editing ? "Edit model" : "Add a model"}
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {(
                [
                  ["name", "Model name"],
                  ["slug", "URL slug"],
                  ["modelIdentifier", "Model identifier"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="text-[10px] text-[#929baa]">
                  {label}
                  <input
                    {...form.register(key)}
                    className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#090c12] px-2.5 text-xs text-white outline-none focus:border-[#a396ff]/50"
                  />
                  {form.formState.errors[key] && (
                    <span className="mt-1 block text-[#f0a1a1]">
                      {form.formState.errors[key]?.message}
                    </span>
                  )}
                </label>
              ))}
              <label className="text-[10px] text-[#929baa]">
                Company
                <select
                  {...form.register("companyId")}
                  className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#090c12] px-2.5 text-xs text-white"
                >
                  <option value="">Choose a company</option>
                  {query.data?.companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[10px] text-[#929baa]">
                Short description
                <textarea
                  {...form.register("description")}
                  rows={3}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#090c12] p-2.5 text-xs text-white outline-none focus:border-[#a396ff]/50"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["contextWindow", "maxOutputTokens"] as const).map((key) => (
                  <label key={key} className="text-[10px] text-[#929baa]">
                    {key === "contextWindow" ? "Context" : "Max output"}
                    <input
                      type="number"
                      {...form.register(key)}
                      className="mt-1.5 h-9 w-full rounded-lg border border-white/10 bg-[#090c12] px-2.5 text-xs text-white"
                    />
                  </label>
                ))}
              </div>
              <label className="flex items-center gap-2 text-[11px] text-[#c3c9d3]">
                <input
                  type="checkbox"
                  {...form.register("isOpenSource")}
                  className="accent-[#a396ff]"
                />{" "}
                Open weights
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                disabled={form.formState.isSubmitting}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#a396ff] px-3 text-xs font-semibold text-[#101119] disabled:opacity-50"
              >
                {editing ? <Check size={13} /> : <Plus size={13} />}{" "}
                {form.formState.isSubmitting
                  ? "Saving…"
                  : editing
                    ? "Save changes"
                    : "Create model"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    form.reset();
                  }}
                  className="rounded-lg border border-white/10 px-3 text-xs text-[#aeb5c1]"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          <section className="surface overflow-hidden rounded-xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
              <h2 className="text-sm font-semibold">Models</h2>
              <span className="text-[10px] text-[#858e9d]">
                {query.data?.models.length || 0} records
              </span>
            </div>
            {query.isLoading ? (
              <p className="p-5 text-xs text-[#929baa]">Loading catalog…</p>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {query.data?.models.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">
                        {model.name}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-[#8992a1]">
                        {model.company.name} · {model.modelIdentifier}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        aria-label={`Edit ${model.name}`}
                        onClick={() => edit(model)}
                        className="rounded-md p-2 text-[#a6adba] hover:bg-white/[0.07] hover:text-white"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        aria-label={`Delete ${model.name}`}
                        onClick={() => remove(model)}
                        className="rounded-md p-2 text-[#e79999] hover:bg-[#e79999]/10"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
