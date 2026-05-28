import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSummaries } from "@/lib/actions/statements.action";
import { DashboardContent } from "@/components/DashboardContent";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const summaries = await getSummaries(user.id);

  return <DashboardContent summaries={summaries} />;
}
