import { describe, expect, it } from "vitest";
import { getVisibleTools } from "../../lib/tool-query";

const tools = [
  {
    name: "Zapier AI",
    tag: "Workflow Automation",
    blurb: "Best for multi-app automations with low setup friction.",
    filters: ["Automation", "No-Code", "Sales Ops"],
    popularity: 98,
    updatedAt: "2026-02-18",
  },
  {
    name: "n8n",
    tag: "Open Source",
    blurb: "Flexible automation engine with strong self-hosting options.",
    filters: ["Automation", "No-Code"],
    popularity: 84,
    updatedAt: "2026-03-06",
  },
  {
    name: "Clay",
    tag: "Go-To-Market",
    blurb: "Data enrichment and outbound workflows for growth teams.",
    filters: ["Sales Ops", "Marketing"],
    popularity: 82,
    updatedAt: "2026-02-01",
  },
];

describe("getVisibleTools", () => {
  it("filters by search term", () => {
    const result = getVisibleTools(tools, {
      searchTerm: "n8n",
      activeFilter: "All",
      sortMode: "Popular",
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("n8n");
  });

  it("filters by active category", () => {
    const result = getVisibleTools(tools, {
      searchTerm: "",
      activeFilter: "No-Code",
      sortMode: "Popular",
    });

    expect(result.map((tool) => tool.name)).toEqual(["Zapier AI", "n8n"]);
  });

  it("sorts by newest when requested", () => {
    const result = getVisibleTools(tools, {
      searchTerm: "",
      activeFilter: "All",
      sortMode: "Newest",
    });

    expect(result[0]?.name).toBe("n8n");
    expect(result[1]?.name).toBe("Zapier AI");
  });
});
