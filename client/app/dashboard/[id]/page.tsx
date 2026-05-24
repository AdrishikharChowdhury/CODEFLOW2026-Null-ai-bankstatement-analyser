import { Sidebar } from "@/components/Sidebar";
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
import { getSummaries, getSummary } from "@/lib/actions/statements.action";
import { SelectStatementAnalytical } from "@/components/SelectStatementAnalytical";
import { SelectStatement } from "@/components/SelectStatement";

interface AnalyticsPageProps {
  params: Promise<{ id: string }>;
}

export default async function page({ params }: AnalyticsPageProps) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const summaries=await getSummaries(user.id);
  const { id } = await params;

  const { summary, created_at } = await getSummary(user.id, id);
  const {
    transactions,
    category_expense,
    recurring_payments,
  } = summary;

  return (
    <div className="min-h-screen bg-background">
      
      <div className="ml-64 p-8">
        <div className="max-w-400 mx-auto flex flex-col">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground mb-8">Financial Analytics Overview</p>
          <div className="py-6 self-end">
            <SelectStatement summaries={summaries} />
          </div>
          <div className="space-y-6">
            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-2xl">AI Category of expenses</AccordionTrigger>
                <AccordionContent>
                  <div className="bg-card rounded-2xl p-6 shadow-sm border border-gray-200">
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible defaultValue="item-2">
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-2xl">Recurring Payments</AccordionTrigger>
                <AccordionContent>
                  <div className="bg-card rounded-2xl p-6 shadow-sm border border-gray-200">
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible defaultValue="item-3">
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-2xl">Transaction History</AccordionTrigger>
                <AccordionContent>
                  <div className="bg-card rounded-2xl p-6 shadow-sm border border-gray-200">
                    <Table>
                      <TableCaption>Table 3: Transaction History</TableCaption>
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
