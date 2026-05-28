import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getSummaries } from "@/lib/actions/statements.action";
import { SelectStatement } from "@/components/SelectStatement";

export default async function HistoryListPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const summaries = await getSummaries(user.id);

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col items-center justify-center min-h-[calc(100dvh-8rem)]">
      <h1 className="text-3xl font-bold text-foreground mb-2">Transaction History</h1>
      <p className="text-muted-foreground mb-8">Detailed Transaction Analysis</p>
      <SelectStatement url='/dashboard/history' summaries={summaries} />
    </div>
  );
}
