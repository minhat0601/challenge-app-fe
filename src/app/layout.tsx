import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Header from "@/components/ui/header";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Challenge App - Nền tảng thử thách học tập",
  description: "Nền tảng giúp bạn tạo và quản lý các thử thách học tập cá nhân",
};
const inter = Inter({ subsets: ['vietnamese'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* <Header></Header> */}
            {children}
            <Toaster closeButton/>

          </ThemeProvider>

      </body>
    </html>
  );
}
