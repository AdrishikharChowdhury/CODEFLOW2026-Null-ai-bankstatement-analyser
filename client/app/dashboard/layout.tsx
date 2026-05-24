import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
     <Sidebar />

      <div className="flex-1">
        
        {children}
        </div>
    </>
  )
}
