import { FileData } from "../../../../types";
import { FileSidebar } from "../molecules/FileSidebar";

// interface FileData {
//   file_id: string;
//   project_id: string;
//   filename: string;
//   size: number;
//   file_type?: string;
//   status: string;
//   source: string;
//   selected: boolean;
//   created_at: string;
//   updated_at: string;
// }

interface FileManagerSectionProps {
  isOpen: boolean;
  files: FileData[];
  chatWithData: boolean;
  projectId: string;
  onToggleChatWithData: (enabled: boolean) => void;
  onFilesUpdate: (files: FileData[]) => void;
  onViewMetadata: (fileId: string) => void;
  onViewPreview: (fileId: string) => void;
}

export const FileManagerSection = ({
  isOpen,
  files,
  chatWithData,
  projectId,
  onToggleChatWithData,
  onFilesUpdate,
  onViewMetadata,
  onViewPreview,
}: FileManagerSectionProps) => {
  const handleFileUpload = async (uploadedFiles: FileList) => {
    try {
      const { apiService } = await import("../../../api/api");

      for (const file of Array.from(uploadedFiles)) {
        await apiService.uploadFile(projectId, file);
      }
      const filesData = await apiService.getFiles(projectId);

      // Map API response to component interface
      const formattedFiles: FileData[] = filesData.map((file) => ({
        file_id: file.file_id,
        project_id: file.project_id,
        filename: file.filename,
        file_size: file.file_size, // Map file_size to size
        file_type: file.file_type,
        status: "active",
        source: "upload",
        selected: file.selected || false, // Use value from API
        created_at: file.created_at,
        updated_at: file.created_at,
      }));

      onFilesUpdate(formattedFiles);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleToggleFileSelection = async (fileId: string) => {
    if (!chatWithData) return;

    try {
      console.log("This is before hendleToggleFile");

      const { apiService } = await import("../../../api/api");
      const file = files.find((f) => f.file_id === fileId);
      const newSelected = !file?.selected;

      await apiService.updateFileSelection(fileId, newSelected);

      const updatedFiles = files.map((f) =>
        f.file_id === fileId ? { ...f, selected: newSelected } : f
      );
      onFilesUpdate(updatedFiles);

      console.log(
        newSelected ? "✅ เลือกไฟล์:" : "❌ ยกเลิกเลือกไฟล์:",
        file?.filename
      );
    } catch (error) {
      console.error("Error updating file selection:", error);
    }
  };

  return (
    <FileSidebar
      isOpen={isOpen}
      files={files}
      chatWithData={chatWithData}
      onToggleChatWithData={onToggleChatWithData}
      onFileUpload={handleFileUpload}
      onToggleFileSelection={handleToggleFileSelection}
      onViewMetadata={onViewMetadata}
      onViewPreview={onViewPreview}
    />
  );
};
