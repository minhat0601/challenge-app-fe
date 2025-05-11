import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Xem lịch trình chuyến đi',
  description: 'Xem lịch trình chuyến đi công khai',
};

export default function TripsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="trips-layout">
      {children}
    </div>
  );
}
