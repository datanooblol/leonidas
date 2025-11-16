import { useState, useEffect, useRef } from "react";
import { Button } from "../atoms/Button";
import { FileUploadButton } from "../molecules/FileUploadButton";
import { FileUploadModal } from "../molecules/FileUploadModal";

interface FileData {
  file_id: string;
  filename: string;
  size: number;
  file_type: string;
  selected?: boolean;
}

interface SessionData {
  session_id: string;
  name: string;
}

interface ProjectChatSidebarProps {
  collapsed: boolean;
  selectedFiles: string[];
  files: FileData[];
  sessions: SessionData[];
  currentSessionId: string | null;
  userEmail: string;
  isUploading: boolean;
  useFileData: boolean;
  onFileSelect: (fileId: string) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onSessionSelect: (sessionId: string) => void;
  onLogout: () => void;
  onFileUpload: (files: FileList) => void;
  onUpdateSession?: (sessionId: string, name: string) => void;
  onDeleteSession?: (sessionId: string) => void;
  onViewMetadata?: (fileId: string) => void;
}

export const ProjectChatSidebar = ({
  collapsed,
  selectedFiles,
  files,
  sessions,
  currentSessionId,
  userEmail,
  isUploading,
  useFileData,
  onFileSelect,
  onNewChat,
  onToggleSidebar,
  onSessionSelect,
  onLogout,
  onFileUpload,
  onUpdateSession,
  onDeleteSession,
  onViewMetadata,
}: ProjectChatSidebarProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSessionMenu, setShowSessionMenu] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
      if (
        sessionMenuRef.current &&
        !sessionMenuRef.current.contains(event.target as Node)
      ) {
        setShowSessionMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Freeze all scrolling when session menu is open
  useEffect(() => {
    if (showSessionMenu) {
      const preventDefault = (e: Event) => e.preventDefault();
      document.body.style.overflow = "hidden";
      document.addEventListener("wheel", preventDefault, { passive: false });
      document.addEventListener("touchmove", preventDefault, {
        passive: false,
      });
      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("wheel", preventDefault);
        document.removeEventListener("touchmove", preventDefault);
      };
    }
  }, [showSessionMenu]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      onFileUpload(files);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSessionMenuClick = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.top,
      left: rect.left - 112, // 28 * 4 = 112px (width of menu)
    });

    setShowSessionMenu(showSessionMenu === sessionId ? null : sessionId);
  };

  const handleRenameSession = (sessionId: string, currentName: string) => {
    setEditingSession(sessionId);
    setEditName(currentName);
    setShowSessionMenu(null);
  };

  const handleDeleteSession = (sessionId: string, sessionName: string) => {
    if (confirm(`ต้องการลบแชท "${sessionName}" หรือไม่?`)) {
      onDeleteSession?.(sessionId);
    }
    setShowSessionMenu(null);
  };

  const handleSaveSessionEdit = () => {
    if (editName.trim() && editingSession && onUpdateSession) {
      onUpdateSession(editingSession, editName.trim());
    }
    setEditingSession(null);
    setEditName("");
  };

  return (
    <div
      className={`bg-gray-50 border-r border-gray-200 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } relative h-full`}
    >
      {collapsed ? (
        <div className="p-4 space-y-2">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded w-full flex justify-center"
          >
            ☰
          </button>
          <button
            onClick={onNewChat}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded w-full flex justify-center"
            title="New Chat"
          >
            ✏️
          </button>
        </div>
      ) : (
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
            >
              ☰
            </button>
          </div>

          <button
            onClick={onNewChat}
            className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors"
          >
            ✏️ New Chat
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            disabled={isUploading}
            className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
          >
            {isUploading ? "กำลังอัปโหลด..." : "📂 Upload Files"}
          </button>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">📂 Files</h3>
            <div className="max-h-24 overflow-y-auto space-y-2">
              {files.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">
                  No files
                </div>
              ) : (
                files.map((file) => (
                  <div
                    key={file.file_id}
                    className="p-2 rounded group hover:bg-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex items-center space-x-2 flex-1 cursor-pointer ${
                          !useFileData ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={async () => {
                          if (!useFileData) return;

                          const isCurrentlySelected = file.selected || false;
                          const newSelected = !isCurrentlySelected;

                          try {
                            const { apiService } = await import(
                              "../../../api/api"
                            );
                            await apiService.updateFileSelection(
                              file.file_id,
                              newSelected
                            );
                          } catch (error) {
                            console.error("❌ API call failed:", error);
                          }

                          onFileSelect(file.file_id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={file.selected || false}
                          onChange={() => {}}
                          disabled={!useFileData}
                          className="w-4 h-4 accent-blue-500 pointer-events-none"
                        />
                        <span className="text-sm truncate">
                          {file.filename}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewMetadata?.(file.file_id);
                        }}
                        className="ml-2 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-600 rounded transition-colors"
                        title="View metadata"
                      >
                        Info
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 border-t pt-4">
            <h3 className="font-medium mb-2">💬 Chat History</h3>
            <div className="flex-1 overflow-y-auto space-y-1">
              {sessions.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">
                  No chat sessions
                </div>
              ) : (
                sessions.map((session) => (
                  <div key={session.session_id}>
                    <div
                      className={`flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer text-sm group ${
                        currentSessionId === session.session_id
                          ? "bg-gray-200 border-l-4 border-gray-500"
                          : ""
                      }`}
                      onClick={() =>
                        !editingSession && onSessionSelect(session.session_id)
                      }
                    >
                      {editingSession === session.session_id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={handleSaveSessionEdit}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveSessionEdit();
                            if (e.key === "Escape") {
                              setEditingSession(null);
                              setEditName("");
                            }
                          }}
                          className="flex-1 text-sm border border-blue-500 rounded px-2 py-1 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <>
                          <span className="flex-1 truncate">
                            {session.name}
                          </span>
                          <button
                            onClick={(e) =>
                              handleSessionMenuClick(e, session.session_id)
                            }
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-1 text-xs"
                          >
                            ⋮
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t pt-4 mt-auto">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded w-full"
              >
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm">
                  👤
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">
                    {userEmail || "User"}
                  </div>
                </div>
              </button>

              {showDropdown && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border rounded-md shadow-lg z-10">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm">{userEmail}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Session Menu */}
      {showSessionMenu && (
        <div
          ref={sessionMenuRef}
          className="fixed w-28 bg-white border rounded-md shadow-lg z-50"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <button
            onClick={() =>
              handleRenameSession(
                showSessionMenu,
                sessions.find((s) => s.session_id === showSessionMenu)?.name ||
                  ""
              )
            }
            className="w-full text-center px-3 py-2 text-xs hover:bg-gray-100"
          >
            ✏️ เปลี่ยนชื่อ
          </button>
          <button
            onClick={() =>
              handleDeleteSession(
                showSessionMenu,
                sessions.find((s) => s.session_id === showSessionMenu)?.name ||
                  ""
              )
            }
            className="w-full text-center px-3 py-2 text-xs hover:bg-red-50 hover:text-red-600"
          >
            🗑️ ลบ
          </button>
        </div>
      )}

      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={onFileUpload}
        isUploading={isUploading}
      />
    </div>
  );
};
