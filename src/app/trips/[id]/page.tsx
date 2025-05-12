import { PublicTripClient } from '@/components/trips/public-trip-client';
import { use } from 'react';
import { PageProps } from '@/types/page';

// Server component để lấy dữ liệu
export default function PublicTripPage({ params }: PageProps) {
  // Unwrap params Promise trong Next.js 15
  const resolvedParams = use(params);

  // Lấy id từ params một cách an toàn
  const tripId = typeof resolvedParams?.id === 'string' ? resolvedParams.id : '';

  // Chuyển sang client component
  return <PublicTripClient tripId={tripId} />;
}
