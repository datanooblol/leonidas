import React from 'react'

interface ModalProps {
  children: React.ReactNode
  onClose?: () => void
}

export const Modal = ({ children, onClose }: ModalProps) => (
  <div 
    className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50"
    onClick={onClose}
  >
    <div 
      className="bg-white rounded-lg p-6 max-w-6xl max-h-[90vh] overflow-y-auto shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
)