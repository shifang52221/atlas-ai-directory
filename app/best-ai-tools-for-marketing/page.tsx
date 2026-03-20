import type { Metadata } from "next";
import { EditorialHubPage } from "@/components/editorial-hub-page";
import {
  buildEditorialHubMetadata,
  getEditorialHubConfigOrThrow,
  parseEditorialHubVariant,
} from "@/lib/editorial-hubs";

const hubConfig = getEditorialHubConfigOrThrow("/best-ai-tools-for-marketing");

export async function generateMetadata(): Promise<Metadata> {
  return buildEditorialHubMetadata(hubConfig);
}

type BestAiToolsForMarketingPageProps = {
  searchParams: Promise<{
    variant?: string;
    v?: string;
  }>;
};

export default async function BestAiToolsForMarketingPage({
  searchParams,
}: BestAiToolsForMarketingPageProps) {
  const query = await searchParams;
  const variant = parseEditorialHubVariant(query.variant || query.v);
  return <EditorialHubPage config={hubConfig} variant={variant} />;
}

