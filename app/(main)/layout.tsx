import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      
      {/* Wrapper bọc Header để tạo khoảng cách (padding) cho nó nổi lên */}
      <div className="pt-6 px-6 mb-6">
        <Header />
      </div>

      <main className="flex-1 p-6">
        {children}
      </main>
      
    </div>
  );
}