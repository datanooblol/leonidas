import React from 'react'
import { CopyButton } from '../atoms/CopyButton'

interface CodeBlockProps {
  children: React.ReactNode
}

export const CodeBlock = ({ children }: CodeBlockProps) => {
  // Extract text from nested code element
  let codeText = ''
  if (React.isValidElement(children) && children.props.children) {
    codeText = children.props.children
  } else {
    codeText = children?.toString() || ''
  }

  return (
    <div className="relative group">
      <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-x-auto pr-12">
        {children}
      </pre>
      <CopyButton
        text={codeText}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
      />
    </div>
  )
}