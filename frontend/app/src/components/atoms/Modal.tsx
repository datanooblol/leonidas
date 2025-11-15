import React from 'react'

interface ModalProps {
  children: React.ReactNode
  onClose?: () => void
}

export const Modal = ({ children, onClose }: ModalProps) => (
  <div 
    className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <div 
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
)