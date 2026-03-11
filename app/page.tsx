import type { Metadata } from "next";
import HomepageClient from "./homepage-client";
import { getHomepageData } from "@/lib/homepage-data";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  return {
    alternates: {
      canonical: baseUrl,
    },
  };
}

export default async function Home() {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const data = await getHomepageData();
  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Atlas AI Directory",
        url: baseUrl,
      },
      {
        "@type": "WebSite",
        name: "Atlas AI Directory",
        url: baseUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: `${baseUrl}/tools?search={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <HomepageClient data={data} />
    </>
  );
}
