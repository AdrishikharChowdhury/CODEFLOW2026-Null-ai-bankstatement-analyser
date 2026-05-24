import { Sidebar } from "@/components/Sidebar";
import Chatbot from "@/components/Chatbot";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
    

      <div className="flex-1 relative"> <Sidebar />
        {children}
        <Chatbot />
      </div>
    </>
  )
}
