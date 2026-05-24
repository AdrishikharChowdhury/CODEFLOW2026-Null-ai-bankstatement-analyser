import type { ParseResponse } from "./parse";

export interface UploadState {
  file: File;
  progress: number;
  failed: boolean;
}

export interface UploadResult {
  success?: boolean;
  url?: string;
  data?: ParseResponse | null;
  parseError?: string;
  error?: string;
}
