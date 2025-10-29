'use client'

import { useState } from 'react'

interface ColumnMetadata {
  name: string
  dtype: string
  nullable: boolean
  unique_values?: number
  sample_values?: any[]
  description?: string
}

interface FileMetadata {
  file_id: string
  filename: string
  file_type: string
  rows?: number
  columns?: ColumnMetadata[]
  preview?: Record<string, any>[]
}

interface MetadataModalProps {
  metadata: FileMetadata
  onClose: () => void
  onSave?: (updatedMetadata: FileMetadata) => void
}

export default function MetadataModal({ metadata, onClose, onSave }: MetadataModalProps) {
  const [editingColumns, setEditingColumns] = useState(metadata.columns || [])
  const [isEditing, setIsEditing] = useState(false)

  const updateColumn = (index: number, field: keyof ColumnMetadata, value: string | boolean) => {
    const updated = [...editingColumns]
    updated[index] = { ...updated[index], [field]: value }
    setEditingColumns(updated)
  }

  const handleSave = () => {
    const updatedMetadata = { ...metadata, columns: editingColumns }
    onSave?.(updatedMetadata)
    setIsEditing(false)
  }

  const dtypeOptions = ['int64', 'float64', 'object', 'bool', 'datetime64']
  const inputTypeMap: Record<string, string> = {
    'int64': 'number',
    'float64': 'number', 
    'object': 'text',
    'bool': 'checkbox',
    'datetime64': 'datetime-local'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            ข้อมูลไฟล์: {metadata.filename}
          </h3>
          <div className="flex space-x-2">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                แก้ไข
              </button>
            ) : (
              <>
                <button 
                  onClick={handleSave}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  บันทึก
                </button>
                <button 
                  onClick={() => {
                    setEditingColumns(metadata.columns || [])
                    setIsEditing(false)
                  }}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                >
                  ยกเลิก
                </button>
              </>
            )}
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* File Info */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <div className="font-medium">จำนวนแถว</div>
              <div className="text-lg">{metadata.rows?.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <div className="font-medium">จำนวนคอลัมน์</div>
              <div className="text-lg">{editingColumns.length}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <div className="font-medium">ประเภทไฟล์</div>
              <div className="text-lg uppercase">{metadata.file_type}</div>
            </div>
          </div>
          
          {/* Columns Table */}
          <div>
            <h4 className="font-medium mb-3 text-gray-900 dark:text-white">คอลัมน์ข้อมูล</h4>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 dark:border-gray-600 rounded-lg">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="px-4 py-3 text-left font-medium border-r border-gray-200 dark:border-gray-600">Field Name</th>
                    <th className="px-4 py-3 text-left font-medium border-r border-gray-200 dark:border-gray-600">Data Type</th>
                    <th className="px-4 py-3 text-left font-medium border-r border-gray-200 dark:border-gray-600">Input Type</th>
                    <th className="px-4 py-3 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {editingColumns.map((col, idx) => (
                    <tr key={idx} className="border-t border-gray-200 dark:border-gray-600">
                      <td className="px-4 py-3 border-r border-gray-200 dark:border-gray-600">
                        {isEditing ? (
                          <input
                            type="text"
                            value={col.name}
                            onChange={(e) => updateColumn(idx, 'name', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-600 dark:border-gray-500"
                          />
                        ) : (
                          <span className="font-medium">{col.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200 dark:border-gray-600">
                        {isEditing ? (
                          <select
                            value={col.dtype}
                            onChange={(e) => updateColumn(idx, 'dtype', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-600 dark:border-gray-500"
                          >
                            {dtypeOptions.map(dtype => (
                              <option key={dtype} value={dtype}>{dtype}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="font-mono text-sm bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                            {col.dtype}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200 dark:border-gray-600">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {inputTypeMap[col.dtype] || 'text'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={col.description || ''}
                            onChange={(e) => updateColumn(idx, 'description', e.target.value)}
                            placeholder="คำอธิบายคอลัมน์..."
                            className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-600 dark:border-gray-500"
                          />
                        ) : (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {col.description || '-'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Preview */}
          {metadata.preview && (
            <div>
              <h4 className="font-medium mb-3 text-gray-900 dark:text-white">ตัวอย่างข้อมูล</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-200 dark:border-gray-600">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      {editingColumns.map((col) => (
                        <th key={col.name} className="px-3 py-2 text-left font-medium border-r border-gray-200 dark:border-gray-600">
                          {col.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metadata.preview.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="border-t border-gray-200 dark:border-gray-600">
                        {editingColumns.map((col) => (
                          <td key={col.name} className="px-3 py-2 border-r border-gray-200 dark:border-gray-600">
                            {row[col.name]?.toString() || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}