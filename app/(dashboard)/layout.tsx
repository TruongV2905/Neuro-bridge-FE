import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

// Next.js layout bắt buộc nhận children prop
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto p-6">
          {children} 
        </main>
      </div>
    </div>
  );
}