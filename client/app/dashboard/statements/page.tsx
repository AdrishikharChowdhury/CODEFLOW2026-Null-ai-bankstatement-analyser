import { StatementUpload } from "@/components/application/file-upload/statement-upload";

export default function StatementsPage() {
  return (
    <main className="flex w-full flex-col items-center justify-center p-6">
      <h1 className="mb-6 text-2xl font-semibold">Track your Statement</h1>
      <div className="w-full max-w-lg">
        <StatementUpload />
      </div>
      
    </main>
  );
}
