import type { Metadata } from "next";
import "./globals.css";
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });


export const metadata: Metadata = {
  title: "ToyoQuest",
  description: "Find your dream car with ToyoQuest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body

        className={`${inter.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
