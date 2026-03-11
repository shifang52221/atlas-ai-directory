export type ToolSortMode = "Popular" | "Newest";

export type ToolForQuery = {
  name: string;
  tag: string;
  blurb: string;
  filters: string[];
  popularity: number;
  updatedAt: string;
};

type QueryOptions = {
  searchTerm: string;
  activeFilter: string;
  sortMode: ToolSortMode;
};

export function getVisibleTools<T extends ToolForQuery>(
  tools: T[],
  options: QueryOptions,
): T[] {
  const query = options.searchTerm.trim().toLowerCase();

  const filtered = tools.filter((tool) => {
    const searchableText = `${tool.name} ${tool.tag} ${tool.blurb}`.toLowerCase();
    const matchesQuery = query.length === 0 || searchableText.includes(query);
    const matchesFilter =
      options.activeFilter === "All" || tool.filters.includes(options.activeFilter);

    return matchesQuery && matchesFilter;
  });

  return filtered.sort((a, b) => {
    if (options.sortMode === "Newest") {
      return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
    }

    return b.popularity - a.popularity;
  });
}
