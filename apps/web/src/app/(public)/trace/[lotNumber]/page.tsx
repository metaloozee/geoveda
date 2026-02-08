import { TraceContent } from "@/components/trace-content";

interface TracePageProps {
  params: Promise<{ lotNumber: string }>;
}

export default async function TracePage({ params }: TracePageProps) {
  const { lotNumber } = await params;
  const decodedLotNumber = decodeURIComponent(lotNumber);

  return <TraceContent lotNumber={decodedLotNumber} />;
}
