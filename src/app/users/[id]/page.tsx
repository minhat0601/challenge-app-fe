type Props = {
  params: { id: string };  // Lấy id từ URL
};

export default function UserDetail({ params }: Props) {
  // Lấy id từ params một cách an toàn
  const userId = typeof params?.id === 'string' ? params.id : '';

  return <h1>User ID: {userId}</h1>;
}