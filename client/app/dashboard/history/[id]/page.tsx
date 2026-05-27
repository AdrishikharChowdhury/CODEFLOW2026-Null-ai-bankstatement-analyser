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
import { formatRedacted, formatTimestamp } from "@/utils/format";
import { getSummaries, getSummary } from "@/lib/actions/statements.action";
import { SelectStatement } from "@/components/SelectStatement";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HistoryPage({ params }: PageProps) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const { id } = await params;
  const [summaries, { summary, created_at }] = await Promise.all([
    getSummaries(user.id),
    getSummary(user.id, id),
  ]);

  const { transactions, category_expense, recurring_payments } = summary;

  return (
    <div className="max-w-400 mx-auto flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">Transaction History</h1>
      <p className="text-muted-foreground mb-8">Detailed Transaction Analysis</p>
      <div className="py-6 self-end">
        <SelectStatement url='/dashboard/history' summaries={summaries} />
      </div>
      <p className="text-muted-foreground -mt-6">
        <span className="font-extrabold">Statement: </span>
        {formatTimestamp(created_at)}
      </p>

      {/* AI Category of expenses */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <h2 className="text-xl font-semibold mb-4 text-foreground">AI Category of Expenses</h2>
        <Table>
          <TableCaption>AI Category of expenses</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Sl no.</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Debit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {category_expense.length > 0 ? (
              category_expense.map((category: any, idx: number) => (
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No expense data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Recurring Payments */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Recurring Payments</h2>
        <Table>
          <TableCaption>Recurring Payments</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-25">Sl no.</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Occurences</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recurring_payments.length > 0 ? (
              recurring_payments.map((payment: any, idx: number) => (
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No recurring payment data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Transaction History */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Transaction History</h2>
        <Table>
          <TableCaption>Transaction History</TableCaption>
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
            {transactions.length > 0 ? (
              transactions.map((transaction: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">
                    {transaction.date}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1">
                      <BadgeIndianRupee className="size-4" />
                      {transaction.credit}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1">
                      <BadgeIndianRupee className="size-4" />
                      {transaction.debit}
                    </span>
                  </TableCell>
                  <TableCell>
                    {transaction.transaction_type}, {transaction.ai_category}, {transaction.transaction_amount}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1">
                      <BadgeIndianRupee className="size-4" />
                      {transaction.balance}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No transaction data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
