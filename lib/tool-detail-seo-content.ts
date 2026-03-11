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
  fitSignals: string[];
  avoidSignals: string[];
  implementationPlan: string[];
  riskControls: string[];
  faqItems: ToolDetailFaqItem[];
  alternativeSlugs: string[];
  useCaseLinks: ToolDetailUseCaseLink[];
};

type CuratedSeoOverride = {
  reviewScore: number;
  reviewSummary: string;
  fitSignals: string[];
  avoidSignals: string[];
  implementationPlan: string[];
  riskControls: string[];
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
    fitSignals: [
      "You need to launch production automation quickly without heavy developer bandwidth",
      "Your workflows span CRM, support, and internal systems with frequent handoffs",
      "Ops leadership prioritizes reliability and cross-team adoption over deep custom logic",
    ],
    avoidSignals: [
      "You require full infrastructure ownership and custom execution environments",
      "Your core workflows depend on deeply nested branching and low-level code control",
    ],
    implementationPlan: [
      "Week 1: map top 3 repetitive workflows and define success metrics",
      "Week 2: launch one workflow per function with QA and owner signoff",
      "Week 3: add error alerts and fallback runbooks for failed automations",
      "Week 4: standardize naming, permissions, and template governance",
    ],
    riskControls: [
      "Track task-volume spikes weekly to prevent hidden cost escalation",
      "Lock app credentials and role scopes before enabling team-wide editing",
      "Audit failed runs and duplicate triggers at least once per sprint",
    ],
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
        question: "Zapier AI vs n8n: what should technical teams prioritize?",
        answer:
          "Choose Zapier AI for launch speed and managed reliability, while n8n is stronger when ownership and custom extensibility are strategic requirements.",
      },
      {
        question: "Zapier AI vs Relevance AI: when does each win?",
        answer:
          "Zapier AI is typically better for broad app automation, while Relevance AI is better for role-based multi-agent orchestration.",
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
    fitSignals: [
      "Your workflows require visible branching and conditional routing logic",
      "Operators need strong scenario-level debugging and execution transparency",
      "You can assign owners to maintain larger automation graphs over time",
    ],
    avoidSignals: [
      "Your team mostly needs lightweight one-step automations with minimal branching",
      "No one can own long-term scenario maintenance and logic documentation",
    ],
    implementationPlan: [
      "Week 1: document branching requirements for your top 2 cross-team workflows",
      "Week 2: build pilot scenarios and validate data mapping at each branch",
      "Week 3: add observability for failed modules and retry thresholds",
      "Week 4: templatize reusable modules and enforce change review",
    ],
    riskControls: [
      "Set operation consumption alerts per high-volume scenario",
      "Require peer review before publishing scenario updates to production",
      "Use environment-separated credentials to reduce accidental breakage",
    ],
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
        question: "Make vs n8n: which is better for workflow ownership?",
        answer:
          "Make is usually better for visual operations teams, while n8n is often stronger for developer-led ownership and custom integrations.",
      },
      {
        question: "Make vs Clay: how should GTM teams decide?",
        answer:
          "Make is broader for cross-functional automation, while Clay is stronger when enrichment quality and outbound execution are your primary goals.",
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
    fitSignals: [
      "Engineering or DevOps can manage hosting, security, and deployment workflows",
      "You need extensible automation logic with custom nodes or internal APIs",
      "Long-term cost control and platform ownership are strategic priorities",
    ],
    avoidSignals: [
      "No technical owner is available for operations, upgrades, and incident response",
      "Your team needs a fully managed no-maintenance automation environment",
    ],
    implementationPlan: [
      "Week 1: choose hosted vs self-hosted based on compliance and owner capacity",
      "Week 2: deploy baseline environment with secrets management and backup policy",
      "Week 3: ship one production workflow with monitoring and alerting hooks",
      "Week 4: harden uptime, document runbooks, and expand to adjacent workflows",
    ],
    riskControls: [
      "Patch and upgrade runtime dependencies on a fixed maintenance cadence",
      "Enforce role-based access and credential rotation for all connectors",
      "Track queue failures, retries, and latency budgets with alert thresholds",
    ],
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
      {
        question: "n8n vs Zapier AI: which is better for technical teams?",
        answer:
          "n8n is typically stronger for control and extensibility, while Zapier AI is usually faster to launch for mixed or non-technical teams.",
      },
      {
        question: "n8n vs Make: what is the practical difference?",
        answer:
          "n8n favors ownership and code-level extensibility, while Make favors visual scenario design and lower day-to-day maintenance for operators.",
      },
      {
        question: "n8n vs Relevance AI: when should teams choose each?",
        answer:
          "Choose n8n for workflow infrastructure control and choose Relevance AI when your scope is role-based agent orchestration with governance.",
      },
      {
        question: "What are the best n8n alternatives to benchmark first?",
        answer:
          "Start with Make and Zapier AI for managed workflow trade-offs, then include Relevance AI when agent orchestration is part of scope.",
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
    fitSignals: [
      "Your GTM motion depends on enrichment quality before outbound sequencing",
      "RevOps can enforce field standards and list hygiene across sales workflows",
      "Teams need fast signal-to-action execution for prospect prioritization",
    ],
    avoidSignals: [
      "Your use case is mostly back-office automation with little GTM focus",
      "No owner can monitor enrichment drift or credit usage economics",
    ],
    implementationPlan: [
      "Week 1: define ICP segments, required enrichment schema, and QA thresholds",
      "Week 2: pilot one enrichment-to-outreach flow with strict sample review",
      "Week 3: add routing rules and monitor response quality by segment",
      "Week 4: scale winning plays and freeze governance for field updates",
    ],
    riskControls: [
      "Set weekly credit budgets tied to outbound conversion checkpoints",
      "Audit enrichment accuracy by segment to catch provider drift early",
      "Block low-confidence records from auto-entering outreach sequences",
    ],
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
      {
        question: "Clay vs Make: what should GTM operators compare first?",
        answer:
          "Compare enrichment depth, signal freshness, and outbound workflow handoff quality rather than generic automation breadth.",
      },
      {
        question: "Clay vs Zapier AI: what is the better fit for sales ops?",
        answer:
          "Clay usually wins when enrichment quality drives targeting outcomes, while Zapier AI is stronger for broad cross-app automation speed.",
      },
      {
        question: "Clay vs n8n: when should outbound teams switch?",
        answer:
          "Use Clay when GTM data enrichment and sequencing are central; use n8n when deeper infrastructure control and custom workflow logic are priorities.",
      },
      {
        question: "What are the best Clay alternatives to evaluate for outbound teams?",
        answer:
          "Start with Apollo-style enrichment stacks and Make or Zapier AI when your workflow needs broader cross-functional automation.",
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
    fitSignals: [
      "You need role-based agent orchestration across multiple teams",
      "Workflow governance and repeatability matter more than one-off prompt speed",
      "Your organization can define clear QA standards for agent outputs",
    ],
    avoidSignals: [
      "Use cases are still ad-hoc with no repeatable task boundaries",
      "No owner is accountable for prompt quality, review, and escalation",
    ],
    implementationPlan: [
      "Week 1: define agent roles, handoffs, and approval boundaries",
      "Week 2: deploy one multi-agent pilot on a repeatable workflow",
      "Week 3: add quality scoring, human checkpoints, and failure alerts",
      "Week 4: expand coverage and standardize reusable agent templates",
    ],
    riskControls: [
      "Require citation and evidence checks for high-impact recommendations",
      "Track agent drift and prompt changes with versioned governance",
      "Enforce review gates for escalations and policy-sensitive tasks",
    ],
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
        question: "Relevance AI vs n8n: what should technical leaders compare?",
        answer:
          "Relevance AI is stronger for agent-workforce orchestration, while n8n is stronger for custom workflow infrastructure and integration ownership.",
      },
      {
        question: "Relevance AI vs Zapier AI: where is the dividing line?",
        answer:
          "Zapier AI is usually better for conventional app automation, while Relevance AI is better for role-based autonomous agent systems.",
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
    fitSignals: [
      "You want quick operator-led deployment for inbox and support workflows",
      "SMB teams need practical templates over heavy custom engineering",
      "You can monitor handoff quality and escalation reliability weekly",
    ],
    avoidSignals: [
      "You require enterprise-grade multi-agent governance across many departments",
      "Your workflows demand extensive custom infrastructure control from day one",
    ],
    implementationPlan: [
      "Week 1: define target inbox/support tasks and escalation rules",
      "Week 2: launch one production assistant with human approval steps",
      "Week 3: track response quality and handoff exceptions daily",
      "Week 4: templatize winning prompts and expand to adjacent teams",
    ],
    riskControls: [
      "Set guardrails for low-confidence responses and mandatory fallback routes",
      "Review handoff transcripts weekly to reduce repeated failure patterns",
      "Limit permissions by workflow to avoid over-broad agent actions",
    ],
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
        question: "Lindy vs Zapier AI: which is better for support-heavy teams?",
        answer:
          "Lindy is often better for agent-led inbox and support workflows, while Zapier AI is stronger for broad deterministic app automation.",
      },
      {
        question: "Lindy vs Make: what should operators benchmark first?",
        answer:
          "Benchmark handoff quality and agent usefulness for Lindy versus scenario control and routing depth for Make.",
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

function toDefaultFitSignals(input: ToolDetailSeoInput): string[] {
  return [
    `Your team needs repeatable ${input.categories[0] || "automation"} workflows with clear ownership`,
    "You can define quality gates before broad rollout across teams",
    "Operational metrics are tracked weekly and tied to workflow outcomes",
  ];
}

function toDefaultAvoidSignals(input: ToolDetailSeoInput): string[] {
  return [
    `${input.name} is a poor fit when process ownership is still unclear`,
    "Avoid rollout if baseline workflow metrics are missing or inconsistent",
  ];
}

function toDefaultImplementationPlan(input: ToolDetailSeoInput): string[] {
  return [
    `Week 1: baseline your current ${input.categories[0] || "automation"} workflow and map handoffs`,
    `Week 2: launch one production pilot using ${input.name} with explicit QA checkpoints`,
    "Week 3: add monitoring, alerting, and fallback paths for failure recovery",
    "Week 4: scale to adjacent workflows only after KPI stability is confirmed",
  ];
}

function toDefaultRiskControls(input: ToolDetailSeoInput): string[] {
  return [
    `Set weekly usage and spend guardrails before scaling ${input.name}`,
    "Define escalation ownership for workflow failures and exception handling",
    "Run a weekly audit on data quality, retries, and downstream handoff accuracy",
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
    fitSignals: toDefaultFitSignals(input),
    avoidSignals: toDefaultAvoidSignals(input),
    implementationPlan: toDefaultImplementationPlan(input),
    riskControls: toDefaultRiskControls(input),
    faqItems: toDefaultFaqItems(input),
    alternativeSlugs: toDefaultAlternativeSlugs(input),
    useCaseLinks: toDefaultUseCaseLinks(input),
  };
}
