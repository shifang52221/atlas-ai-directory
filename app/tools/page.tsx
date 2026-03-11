import type { Metadata } from "next";
import ToolsDirectoryClient from "./tools-directory-client";
import { getToolsDirectoryData } from "@/lib/tools-directory-data";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  return {
    alternates: {
      canonical: new URL("/tools", baseUrl).toString(),
    },
  };
}

export default async function ToolsPage() {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const data = await getToolsDirectoryData();
  const toolsJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "AI Tools Directory",
        description:
          "Curated AI tools with filters and profile-first navigation for quick shortlisting.",
        url: new URL("/tools", baseUrl).toString(),
        isPartOf: {
          "@type": "WebSite",
          name: "Atlas AI Directory",
          url: baseUrl,
        },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: data.tools.slice(0, 20).map((tool, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: tool.name,
            url: new URL(tool.href, baseUrl).toString(),
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tools",
            item: new URL("/tools", baseUrl).toString(),
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsJsonLd) }}
      />
      <ToolsDirectoryClient data={data} />
    </>
  );
}
