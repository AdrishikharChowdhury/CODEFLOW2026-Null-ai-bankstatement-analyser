import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getSummaries } from "@/lib/actions/statements.action";
import { SelectStatement } from "@/components/SelectStatement";
import { Loader } from "@react-three/drei";

export default async function HistoryListPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const summaries = await getSummaries(user.id);

  return (
    <div className="max-w-400 mx-auto flex flex-col">
      <h1 className="text-3xl font-bold text-foreground mb-2">Transaction History</h1>
      <p className="text-muted-foreground mb-8">Detailed Transaction Analysis</p>
      <div className="py-6 self-end">
        <SelectStatement url='/dashboard/history' summaries={summaries} />
        
      </div>
        </div>
  );
}
