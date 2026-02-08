import type { Id } from "@geoveda/backend/convex/_generated/dataModel";
import { LotDetailContent } from "@/components/lot-detail-content";

interface LotDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LotDetailPage({ params }: LotDetailPageProps) {
  const { id } = await params;
  return <LotDetailContent lotId={id as Id<"lots">} />;
}
