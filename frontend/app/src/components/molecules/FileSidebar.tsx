import { useRef } from "react";
import { Toggle } from "../atoms/Toggle";
import { Badge } from "../atoms/Badge";
import { FileItem } from "./FileItem";

// interface FileData {
//   file_id: string
//   filename: string
//   size: number
//   file_type?: string
//   selected?: boolean
// }
interface FileData {
  file_id: string;
  filename: string;
  size: number;
  file_type?: string;
  selected: boolean;
}

interface FileSidebarProps {
  isOpen: boolean;
  files: FileData[];
  chatWithData: boolean;
  onToggleChatWithData: (enabled: boolean) => void;
  onFileUpload: (files: FileList) => void;
  onToggleFileSelection: (fileId: string) => void;
  onViewMetadata: (fileId: string) => void;
  onViewPreview: (fileId: string) => void;
}

export const FileSidebar = ({
  isOpen,
  files,
  chatWithData,
  onToggleChatWithData,
  onFileUpload,
  onToggleFileSelection,
  onViewMetadata,
  onViewPreview,
}: FileSidebarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedCount = files.filter((f) => f.selected || false).length;

  return (
    <div
      className={`${
        isOpen ? "w-80" : "w-0"
      } transition-all duration-300 overflow-hidden bg-gray-100 border-r border-gray-300`}
    >
      <div className="p-4 border-b border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <Toggle
            enabled={chatWithData}
            onChange={onToggleChatWithData}
            label="Chat with Data"
          />
          <span className="text-xs text-gray-600">
            {chatWithData ? "เปิดใช้งาน" : "ปิดใช้งาน"}
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            เอกสารแหล่งข้อมูล
          </h2>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => e.target.files && onFileUpload(e.target.files)}
            className="hidden"
            accept=".txt,.pdf,.doc,.docx,.json,.csv,.md,.py,.js,.ts"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-800 hover:bg-gray-200 rounded-lg"
            title="อัปโหลดไฟล์"
          >
            📁
          </button>
        </div>

        {selectedCount > 0 && (
          <Badge count={selectedCount} text="เลือกแล้ว" variant="blue" />
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {files.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <div className="text-3xl mb-2">📄</div>
            <p className="text-sm">ยังไม่มีเอกสาร</p>
            <p className="text-xs mt-1">คลิก 📁 เพื่ออัปโหลด</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <FileItem
                key={file.file_id}
                file={file}
                chatWithData={chatWithData}
                onToggleSelection={onToggleFileSelection}
                onViewMetadata={onViewMetadata}
                onViewPreview={onViewPreview}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
