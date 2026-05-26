import { StatementUpload } from "@/components/application/file-upload/statement-upload";
import { GenerateSummaryLink } from "@/components/application/GenerateSummaryLink";

export default function StatementsPage() {
  return (
    <div className="flex w-full h-screen flex-col items-center justify-center p-6 gap-6">
      <h1 className="mb-6 text-2xl font-semibold">Generate your Statement Summary</h1>
      <div className="w-full max-w-lg text-white">
        <StatementUpload />
      </div>
      <GenerateSummaryLink className="cursor-pointer w-max h-max py-4 px-8 rounded-2xl border-2 border-border text-white transition-all hover:bg-primary/80 bg-primary" />
    </div>
  );
}
