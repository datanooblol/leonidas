import { useState, useEffect } from "react";
import { apiService } from "../../../api/api";

interface Column {
  column: string;
  dtype: string;
  input_type: string;
  description: string | null;
  summary: string | null;
}

interface FileMetadata {
  // file_id: string
  // project_id: string
  // filename: string
  // size: number
  // status: string
  // source: string
  // selected: boolean
  // created_at: string
  // updated_at: string
  // name: string
  description?: string;
  columns?: Column[];
  tags?: string[];
  [key: string]: any;
}

interface FileMetadataModalProps {
  metadata: FileMetadata | null;
  onClose: () => void;
  onSave: (metadata: FileMetadata) => void;
}

export const FileMetadataModal = ({
  metadata,
  onClose,
  onSave,
}: FileMetadataModalProps) => {
  const [editedMetadata, setEditedMetadata] = useState<FileMetadata | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (metadata) {
      setEditedMetadata({ ...metadata });
      setIsEditing(false);
    }
  }, [metadata]);

  if (!metadata || !editedMetadata) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiService.updateFileMetadata(
        // editedMetadata.file_id,
        "fileId",
        editedMetadata
      );
      onSave(editedMetadata);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save metadata:", error);
      alert("Failed to save metadata");
    } finally {
      setIsSaving(false);
    }
  };

  const updateColumn = (index: number, field: keyof Column, value: string) => {
    setEditedMetadata((prev) => {
      if (!prev) return prev;
      const newColumns = [...(prev.columns || [])];
      newColumns[index] = { ...newColumns[index], [field]: value || null };
      return { ...prev, columns: newColumns };
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl max-h-[80vh] overflow-y-auto w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">File Metadata</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedMetadata.name}
                  onChange={(e) =>
                    setEditedMetadata((prev) =>
                      prev ? { ...prev, name: e.target.value } : prev
                    )
                  }
                  className="w-full border rounded px-3 py-2"
                />
              ) : (
                <div className="w-full border rounded px-3 py-2 bg-gray-50">
                  {editedMetadata.name}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Size</label>
              <div className="w-full border rounded px-3 py-2 bg-gray-100">
                {metadata.size} bytes
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            {isEditing ? (
              <textarea
                value={editedMetadata.description}
                onChange={(e) =>
                  setEditedMetadata((prev) =>
                    prev ? { ...prev, description: e.target.value } : prev
                  )
                }
                className="w-full border rounded px-3 py-2 h-20"
                placeholder="Enter file description..."
              />
            ) : (
              <div className="w-full border rounded px-3 py-2 bg-gray-50 h-20 overflow-y-auto">
                {editedMetadata.description || "No description"}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium mb-2">
              Columns ({metadata.columns?.length || 0})
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">
                      Column
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left">
                      Type
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left">
                      Input Type
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {editedMetadata.columns?.map((col, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-3 py-2 font-medium">
                        {col.column}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {col.dtype}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {isEditing ? (
                          <select
                            value={col.input_type || "INPUT"}
                            onChange={(e) =>
                              updateColumn(index, "input_type", e.target.value)
                            }
                            className="w-full border rounded px-2 py-1 text-sm"
                          >
                            <option value="INPUT">INPUT</option>
                            <option value="REJECT">REJECT</option>
                            <option value="ID">ID</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              col.input_type === "ID"
                                ? "bg-gray-100 text-gray-800"
                                : col.input_type === "REJECT"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {col.input_type || "INPUT"}
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {isEditing ? (
                          <input
                            type="text"
                            value={col.description || ""}
                            onChange={(e) =>
                              updateColumn(index, "description", e.target.value)
                            }
                            className="w-full border rounded px-2 py-1 text-sm"
                            placeholder="Add description..."
                          />
                        ) : (
                          <span className="text-sm">
                            {col.description || "-"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            disabled={isSaving}
          >
            Cancel
          </button>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
