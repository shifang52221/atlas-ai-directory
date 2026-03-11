import type { Metadata } from "next";
import { EditorialHubPage } from "@/components/editorial-hub-page";
import {
  getEditorialHubConfigOrThrow,
  parseEditorialHubVariant,
} from "@/lib/editorial-hubs";

const hubConfig = getEditorialHubConfigOrThrow("/best-ai-agents-for-sales");

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  return {
    title: `${hubConfig.title} | Atlas AI Directory`,
    description: hubConfig.metadataDescription,
    alternates: {
      canonical: new URL(hubConfig.path, baseUrl).toString(),
    },
  };
}

type BestAiAgentsForSalesPageProps = {
  searchParams: Promise<{
    variant?: string;
    v?: string;
  }>;
};

export default async function BestAiAgentsForSalesPage({
  searchParams,
}: BestAiAgentsForSalesPageProps) {
  const query = await searchParams;
  const variant = parseEditorialHubVariant(query.variant || query.v);
  return <EditorialHubPage config={hubConfig} variant={variant} />;
}
