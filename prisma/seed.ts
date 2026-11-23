import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  BenchmarkCategory,
  ModelStatus,
} from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});
const companies = [
  ["OpenAI", "openai", "https://openai.com"],
  ["Anthropic", "anthropic", "https://anthropic.com"],
  ["Google DeepMind", "google-deepmind", "https://deepmind.google"],
  ["Meta", "meta", "https://ai.meta.com"],
  ["DeepSeek", "deepseek", "https://deepseek.com"],
  ["Mistral AI", "mistral-ai", "https://mistral.ai"],
  ["Alibaba Cloud", "alibaba-cloud", "https://www.alibabacloud.com"],
  ["xAI", "xai", "https://x.ai"],
  ["Cohere", "cohere", "https://cohere.com"],
  ["01.AI", "01-ai", "https://01.ai"],
] as const;

const providers = [
  "OpenRouter",
  "Together AI",
  "Fireworks AI",
  "DeepInfra",
  "Replicate",
  "Google Vertex AI",
  "Amazon Bedrock",
  "Groq",
];

const capabilities = [
  "Reasoning",
  "Function calling",
  "Tool use",
  "Structured output",
  "Vision",
  "Code generation",
  "JSON mode",
  "Streaming",
  "Long context",
  "Embeddings",
];

const modalities = ["Text", "Image", "Audio", "Video", "File"];

const modelRows = [
  ["GPT-4.1", "gpt-4.1", "openai", 1047576, false, "General purpose"],
  ["GPT-4.1 mini", "gpt-4.1-mini", "openai", 1047576, false, "General purpose"],
  ["o3", "o3", "openai", 200000, false, "Reasoning"],
  ["o4-mini", "o4-mini", "openai", 200000, false, "Reasoning"],
  ["GPT-4o", "gpt-4o", "openai", 128000, false, "Multimodal"],
  [
    "Claude Opus 4",
    "claude-opus-4",
    "anthropic",
    200000,
    false,
    "General purpose",
  ],
  ["Claude Sonnet 4", "claude-sonnet-4", "anthropic", 200000, false, "Coding"],
  [
    "Claude 3.7 Sonnet",
    "claude-3.7-sonnet",
    "anthropic",
    200000,
    false,
    "Reasoning",
  ],
  [
    "Claude 3.5 Haiku",
    "claude-3.5-haiku",
    "anthropic",
    200000,
    false,
    "General purpose",
  ],
  [
    "Gemini 2.5 Pro",
    "gemini-2.5-pro",
    "google-deepmind",
    1048576,
    false,
    "Reasoning",
  ],
  [
    "Gemini 2.5 Flash",
    "gemini-2.5-flash",
    "google-deepmind",
    1048576,
    false,
    "General purpose",
  ],
  [
    "Gemini 2.0 Flash",
    "gemini-2.0-flash",
    "google-deepmind",
    1048576,
    false,
    "Multimodal",
  ],
  ["Llama 4 Maverick", "llama-4-maverick", "meta", 1000000, true, "Multimodal"],
  ["Llama 4 Scout", "llama-4-scout", "meta", 10000000, true, "Multimodal"],
  ["Llama 3.3 70B", "llama-3.3-70b", "meta", 131072, true, "General purpose"],
  ["DeepSeek R1", "deepseek-r1", "deepseek", 65536, true, "Reasoning"],
  ["DeepSeek V3", "deepseek-v3", "deepseek", 65536, true, "General purpose"],
  [
    "DeepSeek Coder V2",
    "deepseek-coder-v2",
    "deepseek",
    128000,
    true,
    "Coding",
  ],
  [
    "Mistral Large",
    "mistral-large",
    "mistral-ai",
    128000,
    false,
    "General purpose",
  ],
  ["Devstral Small", "devstral-small", "mistral-ai", 128000, true, "Coding"],
  ["Codestral", "codestral", "mistral-ai", 256000, false, "Coding"],
  [
    "Qwen3-235B-A22B",
    "qwen3-235b-a22b",
    "alibaba-cloud",
    40960,
    true,
    "Reasoning",
  ],
  [
    "Qwen2.5-72B",
    "qwen2.5-72b",
    "alibaba-cloud",
    131072,
    true,
    "General purpose",
  ],
  [
    "Qwen2.5-Coder-32B",
    "qwen2.5-coder-32b",
    "alibaba-cloud",
    131072,
    true,
    "Coding",
  ],
  ["Grok 3", "grok-3", "xai", 131072, false, "Reasoning"],
  ["Grok 3 mini", "grok-3-mini", "xai", 131072, false, "Reasoning"],
  ["Command A", "command-a", "cohere", 256000, false, "General purpose"],
  [
    "Aya Expanse 32B",
    "aya-expanse-32b",
    "cohere",
    128000,
    true,
    "Multilingual",
  ],
  ["Yi-Lightning", "yi-lightning", "01-ai", 163840, false, "General purpose"],
  ["Yi-Coder-9B", "yi-coder-9b", "01-ai", 128000, true, "Coding"],
] as const;

const benchmarks = [
  ["MMLU-Pro", "mmlu-pro", BenchmarkCategory.GENERAL],
  ["GPQA Diamond", "gpqa-diamond", BenchmarkCategory.REASONING],
  ["HumanEval", "humaneval", BenchmarkCategory.CODING],
  ["SWE-bench Verified", "swe-bench-verified", BenchmarkCategory.CODING],
  ["AIME 2025", "aime-2025", BenchmarkCategory.MATHEMATICS],
  ["MATH-500", "math-500", BenchmarkCategory.MATHEMATICS],
  ["MMMU", "mmmu", BenchmarkCategory.VISION],
  ["LiveCodeBench", "livecodebench", BenchmarkCategory.CODING],
] as const;

const descriptions = [
  "A capable general-purpose model designed for reliable everyday reasoning and creation.",
  "A fast, efficient model tuned for low-latency workloads and strong value.",
  "A reasoning-focused model for complex multi-step problems and analysis.",
  "A coding-oriented model for repository understanding and software development.",
  "A multimodal model that works across text and visual inputs.",
];

async function main() {
  const companyRecords = new Map<string, string>();
  for (const [name, slug, website] of companies) {
    const company = await prisma.company.upsert({
      where: { slug },
      update: {
        description: `${name} develops and researches artificial intelligence systems.`,
        website,
      },
      create: {
        name,
        slug,
        description: `${name} develops and researches artificial intelligence systems.`,
        website,
      },
    });
    companyRecords.set(slug, company.id);
  }

  const providerRecords = [];

  const providerWebsites = [
    "https://openrouter.ai",
    "https://www.together.ai",
    "https://fireworks.ai",
    "https://deepinfra.com",
    "https://replicate.com",
    "https://cloud.google.com/vertex-ai",
    "https://aws.amazon.com/bedrock",
    "https://groq.com",
  ];

  const providerDocs = [
    "https://openrouter.ai/docs",
    "https://docs.together.ai",
    "https://docs.fireworks.ai",
    "https://deepinfra.com/docs",
    "https://replicate.com/docs",
    "https://cloud.google.com/vertex-ai/generative-ai/docs",
    "https://docs.aws.amazon.com/bedrock/",
    "https://console.groq.com/docs",
  ];

  for (const [index, name] of providers.entries()) {
    const slug = name
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    providerRecords.push(
      await prisma.provider.upsert({
        where: { slug },
        update: {
          website: providerWebsites[index],
          documentationUrl: providerDocs[index],
        },
        create: {
          name,
          slug,
          description:
            "Inference infrastructure and API access for production AI applications.",
          website: providerWebsites[index],
          documentationUrl: providerDocs[index],
        },
      }),
    );
  }

  for (const name of capabilities)
    await prisma.capability.upsert({
      where: { slug: name.toLowerCase().replaceAll(" ", "-") },
      update: {},
      create: { name, slug: name.toLowerCase().replaceAll(" ", "-") },
    });
  for (const name of modalities)
    await prisma.modality.upsert({
      where: { slug: name.toLowerCase() },
      update: {},
      create: { name, slug: name.toLowerCase() },
    });

  const benchmarkRecords = [];

  for (const [name, slug, category] of benchmarks)
    benchmarkRecords.push(
      await prisma.benchmark.upsert({
        where: { slug },
        update: { category },
        create: {
          name,
          slug,
          category,
          description: `${name} evaluation dataset. Seeded values are illustrative and not verified results.`,
          sourceUrl: `https://huggingface.co/papers?q=${encodeURIComponent(name)}`,
        },
      }),
    );
    
  for (const [
    index,
    [name, slug, companySlug, contextWindow, isOpenSource, family],
  ] of modelRows.entries()) {
    const model = await prisma.model.upsert({
      where: { slug },
      update: { isDemo: true },
      create: {
        name,
        slug,
        modelIdentifier: slug,
        description: descriptions[index % descriptions.length],
        modelFamily: family,
        companyId: companyRecords.get(companySlug)!,
        contextWindow,
        maxOutputTokens: Math.min(contextWindow, 32768),
        releaseDate: new Date(Date.UTC(2025, (index * 3) % 12, 1)),
        lastUpdatedAt: new Date(Date.UTC(2025, (index * 5) % 12, 15)),
        isOpenSource,
        license: isOpenSource
          ? "Open weights (see provider terms)"
          : "Proprietary",
        status: ModelStatus.ACTIVE,
        isDemo: true,
      },
    });

    const existingCaps = capabilities.slice(index % 5, (index % 5) + 3);
    for (const cap of existingCaps)
      await prisma.modelCapability.upsert({
        where: {
          modelId_capabilityId: {
            modelId: model.id,
            capabilityId: (
              await prisma.capability.findUniqueOrThrow({
                where: { slug: cap.toLowerCase().replaceAll(" ", "-") },
              })
            ).id,
          },
        },
        update: {},
        create: {
          modelId: model.id,
          capabilityId: (
            await prisma.capability.findUniqueOrThrow({
              where: { slug: cap.toLowerCase().replaceAll(" ", "-") },
            })
          ).id,
        },
      });

    const modes = [
      "text",
      ...(index % 3 === 0 ? ["image"] : []),
      ...(index % 9 === 0 ? ["audio", "video"] : []),
    ];

    for (const mode of modes)
      await prisma.modelModality.upsert({
        where: {
          modelId_modalityId: {
            modelId: model.id,
            modalityId: (
              await prisma.modality.findUniqueOrThrow({ where: { slug: mode } })
            ).id,
          },
        },
        update: {},
        create: {
          modelId: model.id,
          modalityId: (
            await prisma.modality.findUniqueOrThrow({ where: { slug: mode } })
          ).id,
          supportsInput: true,
          supportsOutput: mode === "text",
        },
      });
      
    const assignedProviders = providerRecords.slice(
      index % providerRecords.length,
      (index % providerRecords.length) + 2,
    );
    const input = Number((0.15 + (index % 10) * 0.18).toFixed(2));
    for (const [providerIndex, provider] of assignedProviders.entries()) {
      await prisma.modelProvider.upsert({
        where: {
          modelId_providerId: { modelId: model.id, providerId: provider.id },
        },
        update: {},
        create: {
          modelId: model.id,
          providerId: provider.id,
          providerModelId: `${provider.slug}/${slug}`,
          supportedFeatures: ["streaming", "chat"],
        },
      });
      const providerInput = Number((input + providerIndex * 0.12).toFixed(2));
      await prisma.pricing.upsert({
        where: { id: `seed-price-${slug}-${provider.slug}` },
        update: { isDemo: true },
        create: {
          id: `seed-price-${slug}-${provider.slug}`,
          modelId: model.id,
          providerId: provider.id,
          inputPricePerMillionTokens: providerInput,
          outputPricePerMillionTokens: Number((providerInput * 3.5).toFixed(2)),
          cachedInputPricePerMillionTokens: Number(
            (providerInput * 0.25).toFixed(2),
          ),
          isDemo: true,
        },
      });
    }
    if (index < 20) {
      const benchmark = benchmarkRecords[index % benchmarkRecords.length];
      await prisma.benchmarkResult.upsert({
        where: {
          modelId_benchmarkId_evaluationDate: {
            modelId: model.id,
            benchmarkId: benchmark.id,
            evaluationDate: new Date("2025-11-01T00:00:00.000Z"),
          },
        },
        update: { isDemo: true },
        create: {
          modelId: model.id,
          benchmarkId: benchmark.id,
          score: Number((45 + ((index * 13) % 51)).toFixed(1)),
          scoreUnit: "%",
          evaluationDate: new Date("2025-11-01T00:00:00.000Z"),
          isDemo: true,
        },
      });
    }
    await prisma.modelRelease.upsert({
      where: { modelId_version: { modelId: model.id, version: "initial" } },
      update: {},
      create: {
        modelId: model.id,
        version: "initial",
        releaseDate: model.releaseDate ?? new Date(),
        changelog:
          "Initial catalog entry. Demo seed record; verify details with the linked provider before production use.",
      },
    });
  }
  console.info(
    `Seeded ${modelRows.length} demo models, ${companies.length} companies, ${providers.length} providers, and ${benchmarks.length} benchmarks.`,
  );
}

main().finally(async () => {
  await prisma.$disconnect();
});
