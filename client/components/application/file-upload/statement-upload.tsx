"use client";

import { useState, useCallback } from "react";
import { FileUpload } from "./file-upload-base";
import { uploadStatement } from "@/lib/actions/statements.action";

export function StatementUpload() {
  const [file, setFile] = useState<{
    file: File;
    progress: number;
    failed: boolean;
  } | null>(null);

  const handleDrop = useCallback(async (fileList: FileList) => {
    const dropped = fileList[0];
    if (!dropped) return;

    setFile({ file: dropped, progress: 0, failed: false });

    const formData = new FormData();
    formData.append("file", dropped);

    const result = await uploadStatement(formData);

    setFile((prev) =>
      prev?.file === dropped
        ? { ...prev, progress: result.error ? 0 : 100, failed: !!result.error }
        : prev,
    );
  }, []);

  return (
    <FileUpload.Root>
      <FileUpload.DropZone
        accept=".pdf,.csv"
        allowsMultiple={false}
        hint="Upload your bank statement (PDF or CSV)"
        onDropFiles={handleDrop}
      />
      {file && (
        <FileUpload.List>
          <FileUpload.ListItemProgressBar
            name={file.file.name}
            size={file.file.size}
            progress={file.progress}
            failed={file.failed}
            onDelete={() => setFile(null)}
          />
        </FileUpload.List>
      )}
    </FileUpload.Root>
  );
}
