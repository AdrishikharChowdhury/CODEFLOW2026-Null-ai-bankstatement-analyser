"use client";

import { useState, useCallback } from "react";
import { FileUpload } from "./file-upload-base";
import { uploadStatement } from "@/lib/actions/statements.action";
import posthog from "posthog-js";

export function StatementUpload() {
  const [file, setFile] = useState<{
    file: File;
    progress: number;
    failed: boolean;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDrop = useCallback(async (fileList: FileList) => {
    const dropped = fileList[0];
    if (!dropped) return;

    posthog.capture("statement_file_dropped", {
      file_type: dropped.name.endsWith(".csv") ? "csv" : "pdf",
      file_size: dropped.size,
    });

    setErrorMessage(null);
    setFile({ file: dropped, progress: 0, failed: false });

    const formData = new FormData();
    formData.append("file", dropped);

    const result = await uploadStatement(formData);

    if ("error" in result) {
      posthog.capture("statement_upload_failed", {
        error: result.error,
        file_type: dropped.name.endsWith(".csv") ? "csv" : "pdf",
      });
      setErrorMessage(result.error);
      setFile((prev) =>
        prev?.file === dropped ? { ...prev, progress: 0, failed: true } : prev,
      );
      return;
    }

    if (result.parseError) {
      posthog.capture("statement_upload_failed", {
        error: result.parseError,
        file_type: dropped.name.endsWith(".csv") ? "csv" : "pdf",
      });
      setErrorMessage(result.parseError);
      setFile((prev) =>
        prev?.file === dropped ? { ...prev, progress: 0, failed: true } : prev,
      );
      return;
    }

    if (result.data && !result.data.success) {
      const errMsg = result.data.error ?? "Parsing failed";
      posthog.capture("statement_upload_failed", {
        error: errMsg,
        file_type: dropped.name.endsWith(".csv") ? "csv" : "pdf",
      });
      setErrorMessage(errMsg);
      setFile((prev) =>
        prev?.file === dropped ? { ...prev, progress: 0, failed: true } : prev,
      );
      return;
    }

    posthog.capture("statement_upload_succeeded", {
      file_type: dropped.name.endsWith(".csv") ? "csv" : "pdf",
      file_size: dropped.size,
    });
    setFile((prev) =>
      prev?.file === dropped ? { ...prev, progress: 100, failed: false } : prev,
    );
  }, []);

  const handleRetry = useCallback(() => {
    if (file) {
      posthog.capture("statement_upload_retried", {
        file_type: file.file.name.endsWith(".csv") ? "csv" : "pdf",
      });
      setErrorMessage(null);
      setFile({ ...file, progress: 0, failed: false });
      const formData = new FormData();
      formData.append("file", file.file);
      uploadStatement(formData).then((result) => {
        if ("error" in result) {
          setErrorMessage(result.error);
          setFile((prev) =>
            prev?.file === file.file
              ? { ...prev, progress: 0, failed: true }
              : prev,
          );
          return;
        }
        posthog.capture("statement_upload_succeeded", {
          file_type: file.file.name.endsWith(".csv") ? "csv" : "pdf",
          file_size: file.file.size,
          retried: true,
        });
        setFile((prev) =>
          prev?.file === file.file
            ? { ...prev, progress: 100, failed: false }
            : prev,
        );
      });
    }
  }, [file]);

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
            onDelete={() => {
              posthog.capture("statement_file_deleted", {
                file_type: file.file.name.endsWith(".csv") ? "csv" : "pdf",
              });
              setFile(null);
              setErrorMessage(null);
            }}
            onRetry={handleRetry}
          />
        </FileUpload.List>
      )}
      {errorMessage && (
        <p className="text-red-400 text-sm mt-1">{errorMessage}</p>
      )}
    </FileUpload.Root>
  );
}
