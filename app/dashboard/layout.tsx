// app/dashboard/layout.tsx
import { AdminSidebar } from "@/components/layout/admin/sidebar/Sidebar"; // Sửa lại đường dẫn nếu cần

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AdminSidebar />
      
      <main className="flex-1 h-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}