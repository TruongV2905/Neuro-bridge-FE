import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import AppProvider from "@/providers/App";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Neuro Bridge",
  description: "Neuro Bridge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} h-full antialiased`}>
      <body className="min-h-screen font-sans">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}