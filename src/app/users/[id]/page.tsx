type Props = {
    params: { d: string };  // Lấy id từ URL
  };
  
  export default function ProductDetail({ params }: Props) {
    const { d } = params; // Lấy ID từ route
  
    return <h1>Product ID: {d}</h1>;
  }