import { getFallbackToolProfiles } from "./tool-profile-data";

export type ToolVsComparisonRow = {
  label: string;
  toolASummary: string;
  toolBSummary: string;
};

export type ToolVsSection = {
  title: string;
  body: string;
};

export type ToolVsFaqItem = {
  question: string;
  answer: string;
};

export type ToolVsRelatedLink = {
  label: string;
  href: string;
};

export type ToolVsPage = {
  pairSlug: string;
  toolASlug: string;
  toolBSlug: string;
  toolAName: string;
  toolBName: string;
  title: string;
  metaDescription: string;
  heroVerdict: string;
  quickVerdicts: string[];
  comparisonRows: ToolVsComparisonRow[];
  chooseToolA: string[];
  chooseToolB: string[];
  sections: ToolVsSection[];
  finalRecommendation: string;
  faqItems: ToolVsFaqItem[];
  relatedLinks: ToolVsRelatedLink[];
};

type ToolVsPageSeed = {
  pairSlug: string;
  toolASlug: string;
  toolBSlug: string;
  metaDescription: string;
  heroVerdict: string;
  quickVerdicts: string[];
  comparisonRows: ToolVsComparisonRow[];
  chooseToolA: string[];
  chooseToolB: string[];
  sections: ToolVsSection[];
  finalRecommendation: string;
  faqItems: ToolVsFaqItem[];
  relatedLinks: ToolVsRelatedLink[];
};

const toolBySlug = new Map(
  getFallbackToolProfiles().map((tool) => [tool.slug, tool]),
);

function buildToolVsPage(seed: ToolVsPageSeed): ToolVsPage {
  const toolA = toolBySlug.get(seed.toolASlug);
  const toolB = toolBySlug.get(seed.toolBSlug);

  if (!toolA || !toolB) {
    throw new Error(`Missing tool profile for compare page: ${seed.pairSlug}`);
  }

  return {
    ...seed,
    toolAName: toolA.name,
    toolBName: toolB.name,
    title: `${toolA.name} vs ${toolB.name}`,
  };
}

const pageSeeds: ToolVsPageSeed[] = [
  {
    pairSlug: "zapier-ai-vs-make",
    toolASlug: "zapier-ai",
    toolBSlug: "make",
    metaDescription:
      "Compare Zapier AI vs Make on setup speed, workflow depth, pricing risk, and operator fit before you choose an automation platform.",
    heroVerdict:
      "Zapier AI is the stronger fit when speed, broad app coverage, and low-friction rollout matter most. Make is the better choice once visual scenario control, branching depth, and debugging transparency become more important than launch speed alone.",
    quickVerdicts: [
      "Choose Zapier AI for faster non-technical rollout.",
      "Choose Make for deeper branching and workflow visibility.",
      "Zapier AI is usually easier to hand off across mixed teams.",
      "Make is usually stronger for operators managing more complex scenarios.",
    ],
    comparisonRows: [
      {
        label: "Best for",
        toolASummary: "Teams that need broad app automation running quickly.",
        toolBSummary: "Teams that need visual process control and branching depth.",
      },
      {
        label: "Setup speed",
        toolASummary: "~45 min to first workflow with low setup friction.",
        toolBSummary: "~60 min to first production scenario with heavier configuration.",
      },
      {
        label: "Workflow complexity",
        toolASummary: "Best for simple-to-moderate automation depth.",
        toolBSummary: "Stronger when routing, transforms, and condition trees grow.",
      },
      {
        label: "Pricing risk",
        toolASummary: "Task-volume growth can become expensive if not monitored early.",
        toolBSummary: "Entry price is low, but complex scenarios can raise operational overhead.",
      },
      {
        label: "Ownership model",
        toolASummary: "Fits mixed technical and non-technical operations teams.",
        toolBSummary: "Works best when scenario owners can maintain larger automation graphs.",
      },
    ],
    chooseToolA: [
      "Your team wants production automation running within days, not weeks.",
      "Connector breadth matters more than advanced workflow branching.",
      "You need a platform non-technical operators can adopt with minimal friction.",
    ],
    chooseToolB: [
      "Your workflows require visible branching, transforms, and scenario logic.",
      "You need better debugging visibility across multi-step automations.",
      "A process owner can maintain and document larger scenario maps over time.",
    ],
    sections: [
      {
        title: "Ease of setup",
        body:
          "Zapier AI usually wins the first-week rollout test because the trigger-action model is easier for mixed teams to ship without specialist ownership. Make can still launch quickly, but it asks operators to think more carefully about branches, modules, and long-term scenario design from the start.",
      },
      {
        title: "Flexibility and control",
        body:
          "Make pulls ahead when your automation needs start resembling a process map instead of a simple handoff. Teams that need deeper branching, nested logic, and better visibility into each scenario step usually find Make easier to tune once complexity rises.",
      },
      {
        title: "Pricing and scaling risk",
        body:
          "Neither tool should be chosen on headline entry price alone. Zapier AI can become expensive when task volume spikes after early success, while Make can stay cost-effective longer but may require more operational discipline as scenarios become harder to maintain.",
      },
      {
        title: "Operational fit",
        body:
          "Zapier AI is the safer default for RevOps, support ops, and SMB operations teams that value low-friction collaboration. Make is a stronger match for operator-led teams that already think in systems, dependencies, and reusable workflow building blocks.",
      },
    ],
    finalRecommendation:
      "Choose Zapier AI if your immediate priority is speed-to-value and broad operational adoption. Choose Make if you already know your workflows will require richer branching, stronger debugging, and tighter scenario-level control.",
    faqItems: [
      {
        question: "Zapier AI vs Make: which is better for beginners?",
        answer:
          "Zapier AI is usually easier for beginners because it reduces setup friction and gets non-technical teams to a first live workflow faster.",
      },
      {
        question: "Which tool is better for complex automations?",
        answer:
          "Make is typically stronger once you need visual branching, data transforms, and more advanced process logic across multiple steps.",
      },
      {
        question: "How should teams compare pricing?",
        answer:
          "Model monthly workflow volume first. Zapier AI pricing pressure usually appears through task growth, while Make risk tends to come from complexity and maintenance overhead.",
      },
      {
        question: "Should teams shortlist both before buying?",
        answer:
          "Yes. This is one of the strongest head-to-head pairings on the site and is worth piloting side by side on the same real workflow.",
      },
    ],
    relatedLinks: [
      { label: "Zapier AI profile", href: "/tools/zapier-ai" },
      { label: "Make profile", href: "/tools/make" },
      { label: "Internal Ops", href: "/use-cases/internal-ops" },
      { label: "Best AI Automation Tools", href: "/best-ai-automation-tools" },
      { label: "Compare AI tools", href: "/compare" },
    ],
  },
  {
    pairSlug: "zapier-ai-vs-n8n",
    toolASlug: "zapier-ai",
    toolBSlug: "n8n",
    metaDescription:
      "Compare Zapier AI vs n8n for launch speed, ownership model, workflow control, and cost at scale before you commit.",
    heroVerdict:
      "Zapier AI is the better fit for teams that want managed convenience and faster rollout across many SaaS tools. n8n becomes the stronger option when ownership, extensibility, and infrastructure control outweigh convenience.",
    quickVerdicts: [
      "Choose Zapier AI for managed speed and broad connectors.",
      "Choose n8n for self-hosting and extensibility.",
      "Zapier AI is easier for mixed operator teams.",
      "n8n is better when technical ownership is already in place.",
    ],
    comparisonRows: [
      {
        label: "Best for",
        toolASummary: "Managed automation for fast launch across business apps.",
        toolBSummary: "Technical teams that value ownership and extensibility.",
      },
      {
        label: "Setup speed",
        toolASummary: "~45 min to first workflow with low ops burden.",
        toolBSummary: "~75 min hosted or ~120 min self-hosted depending on setup.",
      },
      {
        label: "Control",
        toolASummary: "Managed experience with less infrastructure involvement.",
        toolBSummary: "Higher control across runtime, custom logic, and hosting choices.",
      },
      {
        label: "Scaling risk",
        toolASummary: "Costs rise with workflow success and usage growth.",
        toolBSummary: "Maintenance and upgrade burden rise with control and scale.",
      },
      {
        label: "Team fit",
        toolASummary: "Mixed teams that want predictable launch speed.",
        toolBSummary: "Developer-led teams that can absorb operational ownership.",
      },
    ],
    chooseToolA: [
      "Your team needs a managed platform with low infrastructure complexity.",
      "Non-technical operators need to own most day-to-day automation work.",
      "Connector breadth and rollout speed matter more than platform ownership.",
    ],
    chooseToolB: [
      "You need self-hosting or stronger workflow extensibility.",
      "Technical teams can own runtime, credentials, and incident response.",
      "Long-term cost control matters more than convenience.",
    ],
    sections: [
      {
        title: "Launch speed versus ownership",
        body:
          "Zapier AI usually delivers value faster because it keeps infrastructure choices off the critical path. n8n asks for more operational thinking up front, but that trade can pay off when ownership and extensibility are strategic rather than optional.",
      },
      {
        title: "Workflow control",
        body:
          "Teams comparing these two tools should focus less on surface-level builder differences and more on how much execution control they actually need. n8n offers a stronger long-term control model, but that only matters if the team can support it operationally.",
      },
      {
        title: "Cost profile",
        body:
          "Zapier AI usually carries cost risk through successful usage growth, especially when high-frequency workflows scale beyond starter assumptions. n8n can become cheaper at scale, but only if the team prices in hosting, upgrades, alerting, and technical maintenance honestly.",
      },
      {
        title: "Best team fit",
        body:
          "Choose based on operating model, not ideology. Teams with mixed operators usually move faster with Zapier AI, while engineering-led teams often get more durable leverage from n8n once custom integrations and platform control matter.",
      },
    ],
    finalRecommendation:
      "Choose Zapier AI if you need low-friction operational rollout. Choose n8n if technical ownership and platform flexibility are part of the buying criteria from day one.",
    faqItems: [
      {
        question: "Zapier AI vs n8n: which is better for technical teams?",
        answer:
          "n8n is usually the better fit for technical teams because it offers stronger extensibility and ownership over the automation stack.",
      },
      {
        question: "Which platform is easier for non-technical users?",
        answer:
          "Zapier AI is usually easier for non-technical operators because setup and maintenance are more managed.",
      },
      {
        question: "Is self-hosting the deciding factor?",
        answer:
          "Only if ownership, compliance, or internal platform control are already important requirements. Otherwise it can distract from faster paths to value.",
      },
      {
        question: "Should teams compare both on a live workflow?",
        answer:
          "Yes. A controlled pilot on one real workflow reveals whether control or convenience matters more in practice.",
      },
    ],
    relatedLinks: [
      { label: "Zapier AI profile", href: "/tools/zapier-ai" },
      { label: "n8n profile", href: "/tools/n8n" },
      { label: "Internal Ops", href: "/use-cases/internal-ops" },
      { label: "Best AI Automation Tools", href: "/best-ai-automation-tools" },
      { label: "Compare AI tools", href: "/compare" },
    ],
  },
  {
    pairSlug: "make-vs-n8n",
    toolASlug: "make",
    toolBSlug: "n8n",
    metaDescription:
      "Compare Make vs n8n on visual workflow control, ownership model, setup burden, and long-term maintenance before you choose.",
    heroVerdict:
      "Make is usually better for operator-led teams that want visible scenario control without taking on full platform ownership. n8n is stronger when the team wants infrastructure control, custom extensibility, and a more technical long-term stack.",
    quickVerdicts: [
      "Choose Make for visual scenario management.",
      "Choose n8n for deeper control and extensibility.",
      "Make is easier for non-developer operators.",
      "n8n is stronger for technical teams that expect complexity to grow.",
    ],
    comparisonRows: [
      {
        label: "Best for",
        toolASummary: "Visual automation teams that need branching clarity.",
        toolBSummary: "Technical teams that want platform ownership.",
      },
      {
        label: "Setup burden",
        toolASummary: "Fast to launch, but scenario governance matters quickly.",
        toolBSummary: "Heavier initial setup, especially when self-hosted.",
      },
      {
        label: "Workflow control",
        toolASummary: "Strong visual routing and debugging for operators.",
        toolBSummary: "Stronger extensibility and integration control.",
      },
      {
        label: "Maintenance model",
        toolASummary: "Lower platform burden, higher scenario-sprawl risk.",
        toolBSummary: "Higher platform burden, lower vendor dependence.",
      },
      {
        label: "Scaling fit",
        toolASummary: "Great for teams standardizing shared visual automations.",
        toolBSummary: "Great for teams building a more owned automation layer.",
      },
    ],
    chooseToolA: [
      "Operators need to inspect routing logic visually without writing custom code.",
      "You want faster workflow deployment without owning infrastructure.",
      "Scenario-level debugging is more important than full runtime control.",
    ],
    chooseToolB: [
      "Your team expects automation needs to become more custom over time.",
      "Self-hosting or platform ownership is already a realistic option.",
      "Developers can support upgrades, incidents, and connector maintenance.",
    ],
    sections: [
      {
        title: "Visual operations versus platform ownership",
        body:
          "This pairing is really about where you want complexity to live. Make keeps more complexity inside visual scenarios that operators can inspect, while n8n shifts more responsibility into a platform your team can control directly.",
      },
      {
        title: "Workflow debugging",
        body:
          "Make is easier for teams that want a visual read on how a workflow moves from trigger to output. n8n can be more powerful, but the debugging experience usually makes more sense when technical teams already own the automation environment.",
      },
      {
        title: "Maintenance burden",
        body:
          "Make reduces platform-level burden but can become messy if scenario governance is weak. n8n avoids some vendor dependence, but only by asking the team to absorb upgrades, hosting, and reliability concerns more directly.",
      },
      {
        title: "Buying decision",
        body:
          "Teams should choose based on who will own production automation in six months. If that answer is operators, Make is often the safer buy. If the answer is developers or a platform-minded automation lead, n8n can be the better long-term fit.",
      },
    ],
    finalRecommendation:
      "Choose Make if you want strong visual control without becoming your own automation platform team. Choose n8n if ownership and extensibility are worth the extra operational burden.",
    faqItems: [
      {
        question: "Make vs n8n: which is easier for non-technical teams?",
        answer:
          "Make is usually easier for non-technical teams because it emphasizes visual scenario building without requiring infrastructure ownership.",
      },
      {
        question: "Which is better for custom automation stacks?",
        answer:
          "n8n is usually better when your team needs custom integrations, stronger runtime control, and a more owned automation layer.",
      },
      {
        question: "Which tool has lower maintenance overhead?",
        answer:
          "Make generally has lower platform overhead, but poor scenario governance can still create maintenance problems over time.",
      },
      {
        question: "Should technical teams still test Make?",
        answer:
          "Yes. Some technical teams still find Make more efficient when the workflow scope does not justify a more owned stack.",
      },
    ],
    relatedLinks: [
      { label: "Make profile", href: "/tools/make" },
      { label: "n8n profile", href: "/tools/n8n" },
      { label: "Internal Ops", href: "/use-cases/internal-ops" },
      { label: "Make Alternatives", href: "/make-alternatives" },
      { label: "Compare AI tools", href: "/compare" },
    ],
  },
  {
    pairSlug: "make-vs-clay",
    toolASlug: "make",
    toolBSlug: "clay",
    metaDescription:
      "Compare Make vs Clay for workflow orchestration, GTM enrichment, setup speed, and team fit before choosing a growth operations stack.",
    heroVerdict:
      "Make is the better fit when you need broader workflow orchestration across channels, systems, and process branches. Clay wins when enrichment quality, signal-driven targeting, and GTM execution are the real bottleneck.",
    quickVerdicts: [
      "Choose Make for broader automation orchestration.",
      "Choose Clay for enrichment-led GTM workflows.",
      "Make is better for cross-functional process routing.",
      "Clay is better when targeting quality drives conversion outcomes.",
    ],
    comparisonRows: [
      {
        label: "Best for",
        toolASummary: "Cross-functional automation and branching workflows.",
        toolBSummary: "GTM enrichment and outbound execution workflows.",
      },
      {
        label: "Setup focus",
        toolASummary: "Scenario-building for broad operational flows.",
        toolBSummary: "Signal-to-action workflows for sales and growth teams.",
      },
      {
        label: "Core strength",
        toolASummary: "Visual orchestration across tools and processes.",
        toolBSummary: "Data enrichment, targeting precision, and sequencing fit.",
      },
      {
        label: "Cost risk",
        toolASummary: "Maintenance overhead grows with workflow complexity.",
        toolBSummary: "Credit consumption can grow quickly with high-volume usage.",
      },
      {
        label: "Primary buyer",
        toolASummary: "Ops or marketing teams orchestrating repeatable processes.",
        toolBSummary: "RevOps and outbound teams optimizing targeting and execution.",
      },
    ],
    chooseToolA: [
      "You need branching workflows across multiple business systems.",
      "Your team wants one orchestration layer for more than GTM use cases.",
      "Scenario visibility and process control matter more than enrichment depth.",
    ],
    chooseToolB: [
      "Enrichment quality is the main lever behind pipeline or campaign performance.",
      "Your workflows start with data signals and lead prioritization.",
      "The buying decision is mainly about outbound and GTM execution quality.",
    ],
    sections: [
      {
        title: "Automation breadth versus GTM depth",
        body:
          "Make and Clay only look interchangeable if you compare them at the feature-list level. In practice, Make is broader and more orchestration-oriented, while Clay is deeper in the specific lane of enrichment-led GTM execution.",
      },
      {
        title: "Workflow design",
        body:
          "Make is stronger when workflows span multiple systems and require branching, transforms, and routing across operational steps. Clay is stronger when the core workflow is really about building high-signal records and moving them into outbound execution with as little friction as possible.",
      },
      {
        title: "Commercial fit",
        body:
          "For teams buying against a revenue bottleneck, Clay often provides a clearer path to measurable GTM impact. For teams buying against operational complexity, Make usually offers better leverage because it can sit across a much broader process surface.",
      },
      {
        title: "Decision rule",
        body:
          "Choose based on what the workflow is trying to optimize. If the answer is process orchestration, choose Make. If the answer is targeting quality and GTM execution, choose Clay.",
      },
    ],
    finalRecommendation:
      "Choose Make for broader automation orchestration across teams and systems. Choose Clay when GTM enrichment and outbound precision are the real buying criteria.",
    faqItems: [
      {
        question: "Make vs Clay: which is better for growth operations?",
        answer:
          "Clay is usually better when enrichment and outbound precision are central, while Make is better when growth ops also needs broader process orchestration.",
      },
      {
        question: "Can Make replace Clay?",
        answer:
          "Not directly. Make can orchestrate workflows around GTM systems, but it does not replace Clay's enrichment-first operating model.",
      },
      {
        question: "Which tool is better for cross-functional teams?",
        answer:
          "Make is generally stronger for cross-functional automation because its workflow model is broader than GTM-specific enrichment.",
      },
      {
        question: "Should GTM teams pilot both?",
        answer:
          "Yes. Teams with mixed needs often discover they need Clay for signal quality and Make for broader orchestration around that workflow.",
      },
    ],
    relatedLinks: [
      { label: "Make profile", href: "/tools/make" },
      { label: "Clay profile", href: "/tools/clay" },
      { label: "Lead Enrichment", href: "/use-cases/lead-enrichment" },
      { label: "AI Sales", href: "/use-cases/ai-sales" },
      { label: "Compare AI tools", href: "/compare" },
    ],
  },
  {
    pairSlug: "relevance-ai-vs-lindy",
    toolASlug: "relevance-ai",
    toolBSlug: "lindy",
    metaDescription:
      "Compare Relevance AI vs Lindy on agent orchestration depth, operational simplicity, setup speed, and team fit before you choose an AI agent platform.",
    heroVerdict:
      "Relevance AI is the stronger platform when role-based orchestration, governance, and multi-agent workflows are the real buying criteria. Lindy is usually the faster option for SMB-style operator workflows where fast wins matter more than orchestration depth.",
    quickVerdicts: [
      "Choose Relevance AI for multi-agent depth and governance.",
      "Choose Lindy for faster SMB-friendly rollout.",
      "Relevance AI is better for structured team-wide orchestration.",
      "Lindy is better for practical operator workflows and inbox tasks.",
    ],
    comparisonRows: [
      {
        label: "Best for",
        toolASummary: "Teams building role-based multi-agent workflows.",
        toolBSummary: "SMB teams deploying operator-first agents quickly.",
      },
      {
        label: "Setup speed",
        toolASummary: "~70 min to first team-ready workflow.",
        toolBSummary: "~40 min to first usable agent.",
      },
      {
        label: "Agent model",
        toolASummary: "Stronger for orchestration and role boundaries.",
        toolBSummary: "Stronger for practical narrow-scope operator assistance.",
      },
      {
        label: "Governance fit",
        toolASummary: "Better for workflows needing review gates and structure.",
        toolBSummary: "Better for fast wins where lightweight control is enough.",
      },
      {
        label: "Team size fit",
        toolASummary: "Better for multi-team coordination and scaling.",
        toolBSummary: "Better for lean teams and SMB operations.",
      },
    ],
    chooseToolA: [
      "You need role-based agent coordination across multiple teams.",
      "Governance and workflow structure matter as much as raw automation speed.",
      "Your team can define quality controls, handoffs, and review checkpoints.",
    ],
    chooseToolB: [
      "You want quick operator-led deployment for support, inbox, or assistant workflows.",
      "SMB speed matters more than deep orchestration architecture.",
      "You want practical AI agent wins before building a larger workforce model.",
    ],
    sections: [
      {
        title: "Agent depth versus rollout simplicity",
        body:
          "Relevance AI and Lindy often serve different maturity levels even when they appear in the same shortlist. Relevance AI is better when teams want a more structured agent operating model, while Lindy is better when they want quick workflow wins with less setup weight.",
      },
      {
        title: "Governance model",
        body:
          "Relevance AI is more useful when agent output quality, role separation, and workflow governance all need explicit controls. Lindy is usually enough when the workflow is narrower and the main question is whether an agent can help operators move faster right now.",
      },
      {
        title: "Team fit",
        body:
          "Lindy is often easier for SMB teams because it maps naturally to communication-heavy operator tasks. Relevance AI becomes more valuable once the organization needs structured coordination between agent roles rather than isolated assistant behavior.",
      },
      {
        title: "Buying decision",
        body:
          "Teams should decide whether they are buying an AI assistant workflow layer or an agent orchestration platform. That distinction usually matters more than UI preference or setup speed in the long run.",
      },
    ],
    finalRecommendation:
      "Choose Relevance AI if your buying criteria center on orchestration, structure, and multi-agent governance. Choose Lindy if you want faster operator wins with less setup burden.",
    faqItems: [
      {
        question: "Relevance AI vs Lindy: which is better for SMB teams?",
        answer:
          "Lindy is usually the better first choice for SMB teams because it is faster to launch and better aligned to practical operator workflows.",
      },
      {
        question: "Which platform is better for multi-agent orchestration?",
        answer:
          "Relevance AI is usually better for multi-agent orchestration because it emphasizes role boundaries, governance, and repeatable workflow structure.",
      },
      {
        question: "Does faster setup always mean better fit?",
        answer:
          "No. Faster setup helps early wins, but teams that need structured orchestration can outgrow a lighter agent workflow model quickly.",
      },
      {
        question: "Should teams pilot both for support and sales use cases?",
        answer:
          "Yes. The contrast between fast operator deployment and deeper orchestration is easiest to judge on a real workflow pilot.",
      },
    ],
    relatedLinks: [
      { label: "Relevance AI profile", href: "/tools/relevance-ai" },
      { label: "Lindy profile", href: "/tools/lindy" },
      { label: "Support Automation", href: "/use-cases/support-automation" },
      { label: "Research Agents", href: "/use-cases/research-agents" },
      { label: "Compare AI tools", href: "/compare" },
    ],
  },
  {
    pairSlug: "relevance-ai-vs-clay",
    toolASlug: "relevance-ai",
    toolBSlug: "clay",
    metaDescription:
      "Compare Relevance AI vs Clay on agent orchestration, GTM execution, team fit, and implementation risk before choosing an AI workflow platform.",
    heroVerdict:
      "Relevance AI is the better fit when the buying decision is really about role-based agent orchestration and cross-team workflow governance. Clay is the stronger option when the bottleneck is GTM enrichment, targeting quality, and outbound execution speed.",
    quickVerdicts: [
      "Choose Relevance AI for orchestration-heavy agent workflows.",
      "Choose Clay for enrichment-led GTM execution.",
      "Relevance AI is better for structured multi-role workflows.",
      "Clay is better when revenue teams need higher-signal targeting fast.",
    ],
    comparisonRows: [
      {
        label: "Best for",
        toolASummary: "Role-based AI workflows across teams and functions.",
        toolBSummary: "GTM teams improving targeting and outbound execution.",
      },
      {
        label: "Primary value",
        toolASummary: "Agent orchestration, governance, and repeatable handoffs.",
        toolBSummary: "Enrichment depth and signal-to-action execution.",
      },
      {
        label: "Implementation model",
        toolASummary: "Heavier setup for structured workflows and agent roles.",
        toolBSummary: "Faster GTM-focused setup around enrichment and lists.",
      },
      {
        label: "Commercial fit",
        toolASummary: "Broader operational transformation across roles.",
        toolBSummary: "Revenue execution and outbound pipeline improvement.",
      },
      {
        label: "Buyer profile",
        toolASummary: "Ops or AI leaders building agent systems.",
        toolBSummary: "RevOps, SDR, and growth teams buying for conversion lift.",
      },
    ],
    chooseToolA: [
      "Your workflow spans multiple roles and needs structured agent handoffs.",
      "Governance and repeatability matter more than immediate GTM throughput.",
      "The buying decision involves support, research, or internal workflows beyond sales.",
    ],
    chooseToolB: [
      "Your main problem is targeting quality or outbound execution.",
      "Revenue teams need enrichment precision before sequence launch.",
      "You want fast GTM impact rather than a broader agent operating model.",
    ],
    sections: [
      {
        title: "Agent orchestration versus GTM execution",
        body:
          "This comparison only becomes clear when teams define the real buying problem. Relevance AI is stronger for role-based orchestration and cross-team agent workflows, while Clay is stronger for enrichment-led GTM systems where better signals improve revenue outcomes directly.",
      },
      {
        title: "Implementation scope",
        body:
          "Relevance AI often asks for more upfront thinking because it is closer to a workflow system than a single-function GTM tool. Clay can get to practical value faster for revenue teams because its workflow is tightly aligned with enrichment, targeting, and outbound activation.",
      },
      {
        title: "Commercial ROI path",
        body:
          "Clay usually has the clearer ROI story when the business case is pipeline generation or outbound precision. Relevance AI can create broader leverage, but that leverage depends on whether the team is truly ready to operationalize multi-role agent workflows.",
      },
      {
        title: "Decision rule",
        body:
          "If your shortlist is still centered on sales and growth execution, Clay usually deserves priority. If your scope already includes broader role-based agent systems, Relevance AI is the more natural path.",
      },
    ],
    finalRecommendation:
      "Choose Relevance AI for broader orchestration and agent-governance goals. Choose Clay for GTM-centric enrichment and outbound execution where revenue impact is the main target.",
    faqItems: [
      {
        question: "Relevance AI vs Clay: which is better for sales teams?",
        answer:
          "Clay is usually better for sales teams when enrichment, targeting, and outbound execution are the core priorities.",
      },
      {
        question: "Which platform is better for multi-role workflows?",
        answer:
          "Relevance AI is usually better for multi-role workflows because it is designed around role-based orchestration and workflow structure.",
      },
      {
        question: "Can Clay replace an agent orchestration platform?",
        answer:
          "Not usually. Clay is excellent in GTM execution, but it is not the same kind of orchestration layer as Relevance AI.",
      },
      {
        question: "Should GTM leaders still evaluate Relevance AI?",
        answer:
          "Yes, especially if the roadmap extends beyond outbound and into broader cross-team agent workflows.",
      },
    ],
    relatedLinks: [
      { label: "Relevance AI profile", href: "/tools/relevance-ai" },
      { label: "Clay profile", href: "/tools/clay" },
      { label: "AI Sales", href: "/use-cases/ai-sales" },
      { label: "Lead Enrichment", href: "/use-cases/lead-enrichment" },
      { label: "Compare AI tools", href: "/compare" },
    ],
  },
];

const pages = pageSeeds.map(buildToolVsPage);
const pageBySlug = new Map(pages.map((page) => [page.pairSlug, page]));
const pageByPairKey = new Map(
  pages.map((page) => [[page.toolASlug, page.toolBSlug].sort().join("::"), page]),
);

export function getToolVsPageSlugs(): string[] {
  return pages.map((page) => page.pairSlug);
}

export function getToolVsPageBySlug(pairSlug: string): ToolVsPage | null {
  return pageBySlug.get(pairSlug) ?? null;
}

export function getToolVsPageByPairSlugs(
  firstToolSlug: string,
  secondToolSlug: string,
): ToolVsPage | null {
  if (!firstToolSlug || !secondToolSlug || firstToolSlug === secondToolSlug) {
    return null;
  }

  return (
    pageByPairKey.get([firstToolSlug, secondToolSlug].sort().join("::")) ?? null
  );
}

export function getCanonicalToolVsHref(
  firstToolSlug: string,
  secondToolSlug: string,
): string | null {
  const page = getToolVsPageByPairSlugs(firstToolSlug, secondToolSlug);
  return page ? `/compare/${page.pairSlug}` : null;
}
