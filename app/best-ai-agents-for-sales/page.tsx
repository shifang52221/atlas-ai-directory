import type { Metadata } from "next";
import { EditorialHubPage } from "@/components/editorial-hub-page";
import {
  buildEditorialHubMetadata,
  getEditorialHubConfigOrThrow,
  parseEditorialHubVariant,
} from "@/lib/editorial-hubs";

const hubConfig = getEditorialHubConfigOrThrow("/best-ai-agents-for-sales");

export async function generateMetadata(): Promise<Metadata> {
  return buildEditorialHubMetadata(hubConfig);
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

