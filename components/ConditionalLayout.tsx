"use client";
import { usePathname } from 'next/navigation';
import Navbar from "@/components/navbar";
import Sidebar from "@/components/navbar/sidebar";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Hide navbar and sidebar on TikTok-style pages
  const isTikTokPage = pathname === '/' || pathname === '/create';
  
  if (isTikTokPage) {
    // Full screen layout for TikTok pages
    return (
      <div className="w-full h-full">
        {children}
      </div>
    );
  }
  
  // Default layout with navbar and sidebar for other pages
  return (
    <>
      <Navbar />
      <main className="flex">
        <div className="hidden md:inline">
          <Sidebar />
        </div>
        <div className="p-8 grow h-full overflow-auto max-h-[85vh]">
          {children}
        </div>
      </main>
    </>
  );
}
