// Định nghĩa kiểu dữ liệu cho props của các page trong Next.js 15
export interface PageProps {
  params: Promise<Record<string, string>>;
  searchParams?: Promise<Record<string, string | string[]>>;
}
