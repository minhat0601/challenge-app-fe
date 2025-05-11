import { PublicTripClient } from '@/components/trips/public-trip-client';

// Server component để lấy dữ liệu
export default function PublicTripPage({ params }: { params: { id: string } }) {
  // Lấy id từ params một cách an toàn
  const tripId = typeof params?.id === 'string' ? params.id : '';

  // Chuyển sang client component
  return <PublicTripClient tripId={tripId} />;
}
