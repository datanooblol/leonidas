import { FileData } from "../../../../types";
// interface FileData {
//   file_id: string;
//   filename: string;
//   file_size: number;
//   file_type: string;
//   created_at: string;
// }

interface FileManagerItemProps {
  file: FileData;
  onViewMetadata: (fileId: string) => void;
  onDelete: (fileId: string, filename: string) => void;
}

export const FileManagerItem = ({
  file,
  onViewMetadata,
  onDelete,
}: FileManagerItemProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {file.filename}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {file.file_size ? formatFileSize(file.file_size) : "Unknown size"} •{" "}
          {new Date(file.created_at).toLocaleDateString("th-TH")}
        </p>
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center space-x-2">
        <span>{file.file_type}</span>
        <button
          onClick={() => onViewMetadata(file.file_id)}
          className="text-blue-500 hover:text-blue-700"
          title="ดู metadata"
        >
          📊
        </button>
        <button
          onClick={() => onDelete(file.file_id, file.filename)}
          className="text-red-500 hover:text-red-700"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
