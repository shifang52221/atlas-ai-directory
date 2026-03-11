export type ToolDetailSeoInput = {
  slug: string;
  name: string;
  categories: string[];
  highlights: string[];
  comparisonNotes: string[];
  setupLabel: string;
  pricingLabel: string;
};

export type ToolDetailFaqItem = {
  question: string;
  answer: string;
};

export type ToolDetailUseCaseLink = {
  href: string;
  label: string;
};

export type ToolDetailSeoContent = {
  reviewScore: number;
  reviewSummary: string;
  faqItems: ToolDetailFaqItem[];
  alternativeSlugs: string[];
  useCaseLinks: ToolDetailUseCaseLink[];
};

type CuratedSeoOverride = {
  reviewScore: number;
  reviewSummary: string;
  faqItems: ToolDetailFaqItem[];
  alternativeSlugs: string[];
  useCaseLinks: ToolDetailUseCaseLink[];
};

const DEFAULT_ALTERNATIVE_POOL = [
  "zapier-ai",
  "make",
  "n8n",
  "relevance-ai",
  "clay",
  "lindy",
];

const curatedOverrides: Record<string, CuratedSeoOverride> = {
  "zapier-ai": {
    reviewScore: 4.7,
    reviewSummary:
      "Zapier AI delivers the strongest speed-to-value for RevOps and SMB operations teams that need reliable multi-app automation with minimal engineering dependency.",
    faqItems: [
      {
        question: "Is Zapier AI worth it for RevOps and SMB operations teams?",
        answer:
          "Yes, when your team prioritizes fast automation rollout, broad integrations, and predictable operational handoffs.",
      },
      {
        question: "How does Zapier AI compare with Make and n8n?",
        answer:
          "Zapier AI is typically faster for simple-to-moderate production workflows, while Make and n8n can offer deeper control for complex routing or technical teams.",
      },
      {
        question: "What is the realistic setup time for first production workflow?",
        answer: "~45 min to first workflow",
      },
      {
        question: "How should teams evaluate Zapier AI pricing?",
        answer:
          "Model expected task volume by your highest-frequency workflows and validate cost breakpoints before scaling.",
      },
      {
        question: "Zapier AI vs Make: which is better for complex automations?",
        answer:
          "Zapier AI usually wins on speed-to-launch, while Make can be stronger when your workflow requires deeper branching and visual logic control.",
      },
      {
        question: "What are the best Zapier AI alternatives to compare first?",
        answer:
          "Start with Make and n8n for workflow depth and control differences, then include Relevance AI when agent-style orchestration is relevant.",
      },
    ],
    alternativeSlugs: ["make", "n8n", "relevance-ai"],
    useCaseLinks: [
      { href: "/use-cases/ai-sales", label: "AI Sales" },
      { href: "/use-cases/internal-ops", label: "Internal Ops" },
      { href: "/use-cases/support-automation", label: "Support Automation" },
    ],
  },
  make: {
    reviewScore: 4.6,
    reviewSummary:
      "Make is a strong choice for operators who need visual control across branching logic, multi-step orchestration, and transparent workflow debugging.",
    faqItems: [
      {
        question: "Who should pick Make over other automation tools?",
        answer:
          "Teams that need visual scenario complexity, branching control, and operational visibility should shortlist Make early.",
      },
      {
        question: "Is Make hard for non-technical teams?",
        answer:
          "Basic flows are accessible, but complex scenarios usually require process owners who can manage logic depth and data mapping.",
      },
      {
        question: "What setup speed can teams expect?",
        answer: "~60 min to first production scenario",
      },
      {
        question: "How should I evaluate Make cost?",
        answer:
          "Track operation consumption per scenario and validate high-volume workflows before committing to scale tiers.",
      },
      {
        question: "Make vs Zapier AI: what should operators compare first?",
        answer:
          "Compare launch speed, routing complexity, and long-term maintenance overhead for your top 3 workflows before deciding.",
      },
      {
        question: "What are the best Make alternatives for automation teams?",
        answer:
          "Zapier AI and n8n are the most useful initial alternatives, with choice driven by simplicity needs versus control and ownership requirements.",
      },
    ],
    alternativeSlugs: ["zapier-ai", "n8n", "clay"],
    useCaseLinks: [
      { href: "/use-cases/content-workflows", label: "Content Workflows" },
      { href: "/use-cases/internal-ops", label: "Internal Ops" },
      { href: "/use-cases/lead-enrichment", label: "Lead Enrichment" },
    ],
  },
  n8n: {
    reviewScore: 4.5,
    reviewSummary:
      "n8n is best for technical teams that value ownership, extensibility, and long-term cost control through open and self-hosted automation architecture.",
    faqItems: [
      {
        question: "When is n8n a better choice than managed platforms?",
        answer:
          "n8n is often better when your team needs self-hosting, custom logic, and deeper infrastructure control.",
      },
      {
        question: "Is n8n suitable for non-technical users?",
        answer:
          "It can work for mixed teams, but technical operators usually unlock the most value, especially for complex workflows.",
      },
      {
        question: "How long does initial deployment usually take?",
        answer: "~75 min for hosted, ~120 min for self-hosted",
      },
      {
        question: "How should n8n pricing be evaluated?",
        answer:
          "Compare cloud operation cost versus self-hosted infrastructure overhead at your projected automation volume.",
      },
    ],
    alternativeSlugs: ["zapier-ai", "make", "relevance-ai"],
    useCaseLinks: [
      { href: "/use-cases/internal-ops", label: "Internal Ops" },
      { href: "/use-cases/research-agents", label: "Research Agents" },
      { href: "/use-cases/content-workflows", label: "Content Workflows" },
    ],
  },
  clay: {
    reviewScore: 4.6,
    reviewSummary:
      "Clay is one of the strongest enrichment-first choices for GTM teams that need faster targeting cycles, tighter outbound sequencing, and signal-driven prospecting workflows.",
    faqItems: [
      {
        question: "Is Clay a strong choice for modern outbound and enrichment workflows?",
        answer:
          "Yes, Clay is usually a top shortlist option when teams need flexible data enrichment and signal-based outbound execution at scale.",
      },
      {
        question: "How does Clay compare with general automation tools?",
        answer:
          "Clay is more GTM-specialized for enrichment and prospect workflows, while general automation platforms often cover broader cross-team process orchestration.",
      },
      {
        question: "What setup speed should teams expect for Clay?",
        answer: "~50 min to first outbound flow",
      },
      {
        question: "How should teams evaluate Clay pricing?",
        answer:
          "Model expected enrichment usage and outbound volume together, then validate cost at your target campaign cadence.",
      },
    ],
    alternativeSlugs: ["zapier-ai", "make", "relevance-ai"],
    useCaseLinks: [
      { href: "/use-cases/lead-enrichment", label: "Lead Enrichment" },
      { href: "/use-cases/ai-sales", label: "AI Sales" },
      { href: "/use-cases/content-workflows", label: "Content Workflows" },
    ],
  },
  "relevance-ai": {
    reviewScore: 4.6,
    reviewSummary:
      "Relevance AI stands out for teams building role-based agent systems where repeatable multi-agent execution and workflow governance matter more than one-off automation speed.",
    faqItems: [
      {
        question: "Who should use Relevance AI?",
        answer:
          "Relevance AI is a strong fit for teams designing multi-agent workflows across sales, support, and internal operations with clear role boundaries.",
      },
      {
        question: "How does Relevance AI compare with Lindy?",
        answer:
          "Relevance AI tends to be stronger for broader workforce orchestration, while Lindy is often faster for SMB-friendly operator workflows.",
      },
      {
        question: "What setup timeline is realistic for Relevance AI?",
        answer: "~70 min to first team-ready workflow",
      },
      {
        question: "How should Relevance AI pricing be evaluated?",
        answer:
          "Estimate cost by seat count, workflow complexity, and expected automation volume before expanding usage to multiple teams.",
      },
      {
        question: "Relevance AI vs Lindy: which is better for multi-agent orchestration?",
        answer:
          "Relevance AI is often stronger for broader multi-agent coordination and governance, while Lindy can be faster for narrower operator-led workflows.",
      },
      {
        question: "What are the best Relevance AI alternatives to compare?",
        answer:
          "Start with Lindy for operator simplicity and n8n or Zapier AI when orchestration needs overlap with broader automation stacks.",
      },
    ],
    alternativeSlugs: ["lindy", "zapier-ai", "n8n"],
    useCaseLinks: [
      { href: "/use-cases/research-agents", label: "Research Agents" },
      { href: "/use-cases/support-automation", label: "Support Automation" },
      { href: "/use-cases/ai-sales", label: "AI Sales" },
    ],
  },
  lindy: {
    reviewScore: 4.5,
    reviewSummary:
      "Lindy is an effective operator-first option for SMB teams that want agent workflows running quickly across inbox, support handoffs, and recurring communication-heavy operations.",
    faqItems: [
      {
        question: "Is Lindy good for operator-led support and inbox workflows?",
        answer:
          "Yes, Lindy is often a practical fit for teams that need quick wins in support and communication workflows without heavyweight setup.",
      },
      {
        question: "How does Lindy compare with Relevance AI?",
        answer:
          "Lindy is usually simpler to launch for SMB use cases, while Relevance AI can offer deeper multi-agent orchestration depth.",
      },
      {
        question: "What setup speed can teams expect with Lindy?",
        answer: "~40 min to first usable agent",
      },
      {
        question: "How should Lindy pricing be evaluated?",
        answer:
          "Validate usage-based cost against your expected message volume and handoff complexity before full team rollout.",
      },
      {
        question: "Lindy vs Relevance AI: which one should SMB teams pick first?",
        answer:
          "SMB teams usually start faster with Lindy, while Relevance AI can be a better fit when multi-agent orchestration depth becomes a priority.",
      },
      {
        question: "What are the best Lindy alternatives to evaluate?",
        answer:
          "Relevance AI, Zapier AI, and Make are useful initial alternatives depending on whether your priority is agent depth or workflow automation breadth.",
      },
    ],
    alternativeSlugs: ["relevance-ai", "zapier-ai", "make"],
    useCaseLinks: [
      { href: "/use-cases/support-automation", label: "Support Automation" },
      { href: "/use-cases/research-agents", label: "Research Agents" },
      { href: "/use-cases/internal-ops", label: "Internal Ops" },
    ],
  },
};

function toDefaultReviewScore(input: ToolDetailSeoInput): number {
  const raw =
    4.2 +
    Math.min(0.5, input.highlights.length * 0.08) +
    Math.min(0.2, input.categories.length * 0.04) -
    Math.min(0.1, Math.max(0, input.comparisonNotes.length - 2) * 0.03);
  return Math.max(4, Math.min(4.9, Number(raw.toFixed(1))));
}

function toDefaultFaqItems(input: ToolDetailSeoInput): ToolDetailFaqItem[] {
  return [
    {
      question: `Who should use ${input.name}?`,
      answer: `${input.name} fits teams focused on ${input.categories[0] || "AI automation"} outcomes that need faster rollout without heavy engineering overhead.`,
    },
    {
      question: `How long does ${input.name} take to implement?`,
      answer: input.setupLabel,
    },
    {
      question: `What does ${input.name} cost?`,
      answer: input.pricingLabel,
    },
    {
      question: `What should I compare before choosing ${input.name}?`,
      answer:
        input.comparisonNotes[0] ||
        "Compare setup friction, integration depth, and cost at expected usage.",
    },
  ];
}

function toDefaultAlternativeSlugs(input: ToolDetailSeoInput): string[] {
  return DEFAULT_ALTERNATIVE_POOL.filter((slug) => slug !== input.slug).slice(0, 3);
}

function toDefaultUseCaseLinks(input: ToolDetailSeoInput): ToolDetailUseCaseLink[] {
  const categoryMap: Record<string, ToolDetailUseCaseLink> = {
    "Sales Ops": { href: "/use-cases/ai-sales", label: "AI Sales" },
    Marketing: { href: "/use-cases/content-workflows", label: "Content Workflows" },
    "Customer Support": {
      href: "/use-cases/support-automation",
      label: "Support Automation",
    },
    Automation: { href: "/use-cases/internal-ops", label: "Internal Ops" },
    "AI Agents": { href: "/use-cases/research-agents", label: "Research Agents" },
    "No-Code": { href: "/use-cases/internal-ops", label: "Internal Ops" },
  };
  const links = input.categories
    .map((category) => categoryMap[category])
    .filter((item): item is ToolDetailUseCaseLink => Boolean(item));
  const unique = Array.from(new Map(links.map((item) => [item.href, item])).values());

  if (unique.length === 0) {
    unique.push({ href: "/use-cases", label: "Use Cases" });
  }

  return unique.slice(0, 3);
}

function toDefaultReviewSummary(input: ToolDetailSeoInput): string {
  return `${input.name} is strongest when your team prioritizes ${input.categories[0] || "automation"} with fast rollout and clear operational ownership.`;
}

export function getToolDetailSeoContent(input: ToolDetailSeoInput): ToolDetailSeoContent {
  const curated = curatedOverrides[input.slug];
  if (curated) {
    return curated;
  }

  return {
    reviewScore: toDefaultReviewScore(input),
    reviewSummary: toDefaultReviewSummary(input),
    faqItems: toDefaultFaqItems(input),
    alternativeSlugs: toDefaultAlternativeSlugs(input),
    useCaseLinks: toDefaultUseCaseLinks(input),
  };
}
