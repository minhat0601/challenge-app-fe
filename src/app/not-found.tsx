import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-700 dark:text-gray-300">
        Không tìm thấy trang
      </h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <Link
        href="/"
        className="mt-6 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
      >
        Quay về trang chủ
      </Link>
    </div>
  );
}
