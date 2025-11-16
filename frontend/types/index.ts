export interface FileData {
  file_id: string;
  project_id: string;
  filename: string;
  file_size: number; // Use file_size to match API
  file_type: string;
  selected?: boolean;
  created_at: string;
}
export interface FileMetadata {
  file_id: string;
  filename: string;
  file_type: string;
  size: number;
  rows?: number;
  columns?: any[];
  preview?: Record<string, any>[];
  name?: string;
  description?: string;
}
