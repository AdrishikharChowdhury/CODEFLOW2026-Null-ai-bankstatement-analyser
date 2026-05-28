"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { pdf, Document } from "@react-pdf/renderer";

interface PdfDownloadButtonProps {
  pdfDoc: React.ReactElement<React.ComponentProps<typeof Document>>;
  filename?: string;
}

export function PdfDownloadButton({
  pdfDoc,
  filename = "document",
}: PdfDownloadButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleClick = async () => {
    setExporting(true);
    try {
      const blob = await pdf(pdfDoc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      {exporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-lg font-semibold text-foreground">Generating PDF...</p>
          </div>
        </div>
      )}
      <button
        onClick={handleClick}
        disabled={exporting}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        <FileDown className="size-4" />
        {exporting ? "Generating..." : "Download PDF"}
      </button>
    </>
  );
}
