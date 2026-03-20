import type { Metadata } from "next";
import { EditorialHubPage } from "@/components/editorial-hub-page";
import {
  buildEditorialHubMetadata,
  getEditorialHubConfigOrThrow,
  parseEditorialHubVariant,
} from "@/lib/editorial-hubs";

const hubConfig = getEditorialHubConfigOrThrow("/hubspot-alternatives-for-startups");

export async function generateMetadata(): Promise<Metadata> {
  return buildEditorialHubMetadata(hubConfig);
}

type CommercialPageProps = {
  searchParams: Promise<{
    variant?: string;
    v?: string;
  }>;
};

export default async function CommercialPage({
  searchParams,
}: CommercialPageProps) {
  const query = await searchParams;
  const variant = parseEditorialHubVariant(query.variant || query.v);
  return <EditorialHubPage config={hubConfig} variant={variant} />;
}
