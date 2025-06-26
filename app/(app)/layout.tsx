import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/navbar";
import Providers from "./Providers";
import Sidebar from "@/components/navbar/sidebar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "TIKTIK",
  description: "Welcome to TIKTIK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`max-h-screen h-screen flex flex-col ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          <main className="flex">
            <div className="hidden md:inline">
              <Sidebar />
            </div>
            <div className="p-8 grow h-full overflow-auto max-h-[85vh]">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
