import { StatementUpload } from "@/components/application/file-upload/statement-upload";
import { GenerateSummaryLink } from "@/components/application/GenerateSummaryLink";

export default function StatementsPage() {
  return (
    <div className="flex w-full flex-col items-center justify-center min-h-[calc(100dvh-8rem)] p-4 md:p-6 gap-6">
      <h1 className="text-xl md:text-2xl font-semibold text-center">Generate your Statement Summary</h1>
      <div className="w-full max-w-lg">
        <StatementUpload />
      </div>
      <GenerateSummaryLink className="cursor-pointer w-max h-max py-3 md:py-4 px-6 md:px-8 rounded-2xl border-2 border-border text-white transition-all hover:bg-primary/80 bg-primary text-sm md:text-base" />
    </div>
  );
}
