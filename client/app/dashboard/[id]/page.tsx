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
import { getSummary } from "@/lib/actions/statements.action";
import { generateStory } from "@/lib/actions/insights.action";
import { BadgeIndianRupee } from "lucide-react";
import { formatRedacted, formatTimestamp } from "@/utils/format";
import type { SummaryData } from "@/types";
import { p } from "motion/react-client";

interface DashboardPageProps {
  params: Promise<{ id: string }>;
}

const page = async ({ params }: DashboardPageProps) => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;

  const { summary, created_at } = await getSummary(user.id, id);
  const {
    transactions,
    category_expense,
    recurring_payments,
    recommendations,
  } = summary;

  let story = "";
  let fraudAlerts: string[] = [];
  try {
    const result = await generateStory(summary as SummaryData);
    story = result.story;
    fraudAlerts = result.fraud_alerts;
  } catch (e) {
    console.error("Story generation failed:", e);
  }

  return (
    <main className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-center">Statement Summary</h1>
        <p className="mt-4 text-lg">
          <span className="font-extrabold text-xl">Created At: </span>
          {formatTimestamp(created_at)}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <h2>AI Category of expenses</h2>
        <Table>
          <TableCaption>Table 1: AI Category of expenses</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Sl no.</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Debit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {category_expense.map((category, idx: number) => (
              <TableRow key={idx}>
                <TableCell className="text-left">{idx + 1}</TableCell>
                <TableCell>{category.ai_category}</TableCell>
                <TableCell className="text-right">
                  <span className="inline-flex items-center gap-1">
                    <BadgeIndianRupee className="size-4" />
                    {category.debit_value}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-4">
        <h2>Recurring Payments</h2>
        <Table>
          <TableCaption>Table 2: Recurring Payments</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-25">Sl no.</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Occurences</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recurring_payments.map((payment, idx: number) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{idx + 1}</TableCell>
                <TableCell>{formatRedacted(payment.merchant)}</TableCell>
                <TableCell>{payment.occurrences}</TableCell>
                <TableCell className="text-right">
                  <span className="inline-flex items-center gap-1">
                    <BadgeIndianRupee className="size-4" />
                    {payment.total_amount}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-4">
        <h2>Transaction History</h2>
        <Table>
          <TableCaption>Table: 3: Transaction History</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-25">Date</TableHead>
              <TableHead>Credit</TableHead>
              <TableHead>Debit</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction, idx: number) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">
                  {transaction.date}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1">
                    <BadgeIndianRupee className="size-4" /> {transaction.credit}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1">
                    <BadgeIndianRupee className="size-4" /> {transaction.debit}
                  </span>
                </TableCell>
                <TableHead>
                  {transaction.transaction_type}, {transaction.ai_category},{" "}
                  {transaction.transaction_amount}
                </TableHead>
                <TableCell className="text-right">
                  <span className="inline-flex items-center gap-1">
                    <BadgeIndianRupee className="size-4" />
                    {transaction.balance}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-4">
      <h2>Recomendations:</h2>
      <ul className="flex flex-col gap-4 list-disc ml-4" >
        {recommendations.map((recommendation, idx: number) => (
          <li key={idx} >{recommendation}</li>
        ))}
      </ul>
      <div className="flex flex-col gap-4">
        <h2>AI Advice: </h2>
      {story && (
        <div className="bg-green-pea-1900 border border-green-200 rounded-lg p-6 whitespace-pre-line leading-relaxed">
          {story}
        </div>
      )}
      {fraudAlerts.length > 0 ? (
        <div className="bg-red-900 border border-red-200 rounded-lg p-4">
          {fraudAlerts.map((a, i) => (
            <p key={i} className="text-red-700 font-medium">{a}</p>
          ))}
        </div>
      ):<p className="bg-green-pea-1900 border border-green-200 rounded-lg p-6 whitespace-pre-line text-green-pea-100 leading-relaxed " >Good News No Fraud has been detected</p>}
      </div>
      </div>
    </main>
  );
};

export default page;
