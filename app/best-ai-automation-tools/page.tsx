import type { Metadata } from "next";
import { EditorialHubPage } from "@/components/editorial-hub-page";
import {
  buildEditorialHubMetadata,
  getEditorialHubConfigOrThrow,
  parseEditorialHubVariant,
} from "@/lib/editorial-hubs";

const hubConfig = getEditorialHubConfigOrThrow("/best-ai-automation-tools");

export async function generateMetadata(): Promise<Metadata> {
  return buildEditorialHubMetadata(hubConfig);
}

type BestAiAutomationToolsPageProps = {
  searchParams: Promise<{
    variant?: string;
    v?: string;
  }>;
};

export default async function BestAiAutomationToolsPage({
  searchParams,
}: BestAiAutomationToolsPageProps) {
  const query = await searchParams;
  const variant = parseEditorialHubVariant(query.variant || query.v);
  return <EditorialHubPage config={hubConfig} variant={variant} />;
}

