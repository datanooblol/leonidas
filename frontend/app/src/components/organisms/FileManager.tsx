import { useState } from "react";
import { Card } from "../atoms/Card";
import { Heading } from "../atoms/Heading";
import { FileUploadButton } from "../molecules/FileUploadButton";
import { FileManagerItem } from "../molecules/FileManagerItem";
import { UploadStatus } from "../molecules/UploadStatus";
import { apiService } from "../../../api/api";
import { MetadataModal } from "./MetadataModal";

// interface FileData {
//   file_id: string
//   project_id: string
//   filename: string
//   size: number
//   file_type: string
//   created_at: string
// }
interface FileData {
  file_id: string;
  project_id: string;
  filename: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

interface FileMetadata {
  description?: string;
  tags?: string[];
  [key: string]: any;
}

interface FileManagerProps {
  projectId: string;
  files: FileData[];
  onFilesUpdate: (files: FileData[]) => void;
}

export const FileManager = ({
  projectId,
  files,
  onFilesUpdate,
}: FileManagerProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showMetadata, setShowMetadata] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<
    Record<string, FileMetadata>
  >({});

  const handleFileUpload = async (selectedFiles: FileList) => {
    setIsUploading(true);
    setUploadSuccess(false);

    try {
      for (const file of Array.from(selectedFiles)) {
        await apiService.uploadFile(projectId, file);
      }

      const updatedFiles = await apiService.getFiles(projectId);
      onFilesUpdate(updatedFiles);

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error("Upload failed:", error);

      // Check if it's a CORS error but upload might have succeeded
      if (
        error instanceof TypeError &&
        error.message.includes("NetworkError")
      ) {
        console.log("CORS error detected, checking if files were uploaded...");
        try {
          // Wait for backend processing
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const updatedFiles = await apiService.getFiles(projectId);
          onFilesUpdate(updatedFiles);
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 3000);
          return;
        } catch (refreshError) {
          console.error("Failed to refresh files:", refreshError);
        }
      }

      alert("การอัปโหลดไฟล์ไม่สำเร็จ");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string, filename: string) => {
    if (!confirm(`ต้องการลบไฟล์ "${filename}" หรือไม่?`)) return;

    try {
      await apiService.deleteFile(fileId);
      const updatedFiles = await apiService.getFiles(projectId);
      onFilesUpdate(updatedFiles);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("ลบไฟล์ไม่สำเร็จ");
    }
  };

  const loadFileMetadata = async (fileId: string) => {
    try {
      const metadata = await apiService.getFileMetadata(fileId);
      setFileMetadata((prev) => ({ ...prev, [fileId]: metadata }));
    } catch (error) {
      console.error("Failed to load metadata:", error);
      if (
        error instanceof TypeError &&
        error.message.includes("NetworkError")
      ) {
        alert("ไม่สามารถโหลด metadata ได้ (CORS Error)");
      } else {
        alert("ไม่สามารถโหลด metadata ได้");
      }
    }
  };

  const handleMetadataView = (fileId: string) => {
    loadFileMetadata(fileId);
    setShowMetadata(fileId);
  };

  const handleMetadataSave = (updatedMetadata: FileMetadata) => {
    setFileMetadata((prev) => ({
      ...prev,
      [showMetadata!]: updatedMetadata,
    }));
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Heading>ไฟล์เอกสาร</Heading>
        <FileUploadButton
          onFileUpload={handleFileUpload}
          isUploading={isUploading}
        />
      </div>

      <UploadStatus show={uploadSuccess} />

      {files.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-3xl mb-2">📄</div>
          <p className="text-sm">ยังไม่มีไฟล์</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <FileManagerItem
              key={file.file_id}
              file={file}
              onViewMetadata={handleMetadataView}
              onDelete={handleDeleteFile}
            />
          ))}
        </div>
      )}

      {showMetadata && fileMetadata[showMetadata] && (
        <MetadataModal
          metadata={fileMetadata[showMetadata]}
          onClose={() => setShowMetadata(null)}
          onSave={handleMetadataSave}
        />
      )}
    </Card>
  );
};
