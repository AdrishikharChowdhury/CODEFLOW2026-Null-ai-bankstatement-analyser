import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BadgeIndianRupee } from "lucide-react";
import { formatRedacted } from "@/utils/format";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SelectStatement } from "@/components/SelectStatement";
import { getSummaries } from "@/lib/actions/statements.action";
import Loader from "@/components/Loader";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const summaries=await getSummaries(user.id);

  // Mock data for demonstration - replace with actual data fetching
  const mockData = {
    category_expense: [],
    transactions: [],
    recurring_payments: [],
    recommendations: [],
  };

  return (
    <div className="max-w-400 mx-auto flex flex-col">
      <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Detailed Transaction Analysis</p>
      <div className="py-6 self-end">
        <SelectStatement summaries={summaries} />
        
      </div>
      <div className="space-y-6">
          </div>
          <Loader />
        </div>
  );
}
