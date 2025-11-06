import { useState } from 'react'
import { Modal } from '../atoms/Modal'
import { Card } from '../atoms/Card'
import { Input } from '../atoms/Input'
import { ModalHeader } from '../molecules/ModalHeader'

interface ColumnMetadata {
  column: string
  dtype: string
  input_type: string
  description?: string
  summary?: string
}

interface FileMetadata {
  file_id: string
  filename: string
  size: number
  name?: string
  description?: string
  columns?: ColumnMetadata[]
  rows?: number
  file_type?: string
}

interface MetadataModalProps {
  metadata: FileMetadata
  onClose: () => void
  onSave?: (updatedMetadata: FileMetadata) => void
}

export const MetadataModal = ({ metadata, onClose, onSave }: MetadataModalProps) => {
  const [editingColumns, setEditingColumns] = useState(metadata.columns || [])
  const [isEditing, setIsEditing] = useState(false)

  const updateColumn = (index: number, field: keyof ColumnMetadata, value: string) => {
    const updated = [...editingColumns]
    updated[index] = { ...updated[index], [field]: value }
    setEditingColumns(updated)
  }

  const handleSave = () => {
    const updatedMetadata = { ...metadata, columns: editingColumns }
    onSave?.(updatedMetadata)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditingColumns(metadata.columns || [])
    setIsEditing(false)
  }

  return (
    <Modal onClose={onClose}>
      <ModalHeader
        title={`ข้อมูลไฟล์: ${metadata.filename}`}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        onClose={onClose}
      />
      
      <div className="space-y-6">
        {/* File Info Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <Card className="p-3">
            <div className="font-medium">จำนวนแถว</div>
            <div className="text-lg">{metadata.rows?.toLocaleString()}</div>
          </Card>
          <Card className="p-3">
            <div className="font-medium">จำนวนคอลัมน์</div>
            <div className="text-lg">{editingColumns.length}</div>
          </Card>
          <Card className="p-3">
            <div className="font-medium">ประเภทไฟล์</div>
            <div className="text-lg uppercase">{metadata.file_type}</div>
          </Card>
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
                      <span className="font-medium">{col.column}</span>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 dark:border-gray-600">
                      <span className="font-mono text-sm bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                        {col.dtype}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 dark:border-gray-600">
                      {isEditing ? (
                        <select
                          value={col.input_type || 'input'}
                          onChange={(e) => updateColumn(idx, 'input_type', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm dark:bg-gray-600 dark:border-gray-500"
                        >
                          <option value="ID">ID</option>
                          <option value="input">input</option>
                          <option value="reject">reject</option>
                        </select>
                      ) : (
                        <span className={`text-sm px-2 py-1 rounded ${
                          col.input_type === 'ID' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          col.input_type === 'reject' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {col.input_type || 'input'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={col.description || ''}
                          onChange={(e) => updateColumn(idx, 'description', e.target.value)}
                          placeholder="คำอธิบายคอลัมน์..."
                          className="w-full text-sm"
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
      </div>
    </Modal>
  )
}