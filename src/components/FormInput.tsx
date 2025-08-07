import { Icon } from '@iconify/react/dist/iconify.js'
import React, { useState } from 'react'

interface FormInputProps {
  label?: string
  id: string
  value: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  error?: string
  type: 'text' | 'password' | 'textarea' | 'file'
  readOnly?: boolean
  download?: boolean
  copyToClipboard?: boolean
  onDownload?: (content: string) => void
  onCopyToClipboard?: () => void
  minRows?: number
  maxRows?: number
  placeholder?: string
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  id,
  value,
  onChange,
  error,
  type = 'text',
  readOnly = false,
  download = false,
  copyToClipboard = false,
  onDownload,
  onCopyToClipboard,
  minRows = 4,
  maxRows = 10,
  placeholder,
}) => {
  const [showTooltip, setShowTooltip] = useState(false)

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(value).then(
      () => {
        setShowTooltip(true)
        setTimeout(() => {
          setShowTooltip(false)
        }, 1200)
        // Call the custom callback if provided
        onCopyToClipboard?.()
      },
      () => {
        alert('Failed to copy to clipboard')
      }
    )
  }

  const handleDownloadText = () => {
    onDownload?.(value)
  }

  return (
    <div className="mb-4 relative">
      {label && (
        <label htmlFor={id} className="block mb-2 text-md font-medium text-gray-900">
          {label}
        </label>
      )}
      {(() => {
        switch (type) {
          case 'textarea':
            return (
              <div className="relative">
                <textarea
                  id={id}
                  rows={minRows}
                  className="outline-none block p-4 w-full text-lg text-gray-900 bg-gray-50/80 rounded-3xl border border-gray-200 focus:ring-primary-ornament focus:border-primary-ornament backdrop-blur-md transition-all"
                  value={value}
                  onChange={onChange}
                  placeholder={placeholder}
                  readOnly={readOnly}
                  style={{
                    minHeight: `${minRows * 24}px`,
                    maxHeight: `${maxRows * 24}px`,
                  }}
                ></textarea>
                {copyToClipboard && (
                  <button
                    type="button"
                    className="transition-all backdrop-blur-md absolute top-2 right-6 bg-slate-500/60 hover:bg-slate-500/80 text-white h-10 w-10 flex items-center justify-center rounded-2xl text-sm"
                    onClick={handleCopyToClipboard}
                  >
                    <Icon icon="fluent:copy-24-filled" className="text-white h-6 w-6" />
                  </button>
                )}
                {download && (
                  <button
                    type="button"
                    className="transition-all backdrop-blur-md absolute top-14 right-6 bg-slate-500/60 hover:bg-slate-500/80 text-white h-10 w-10 flex items-center justify-center rounded-2xl text-sm"
                    onClick={handleDownloadText}
                  >
                    <Icon icon="fluent:arrow-download-16-filled" className="text-white h-6 w-6" />
                  </button>
                )}
                <div
                  className={`absolute top-2.5 right-20 bg-black/70 backdrop-blur-sm text-white text-xs rounded-3xl py-2 px-4 transition-opacity duration-300 ${
                    showTooltip ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  Copied to clipboard!
                </div>
              </div>
            )
          case 'text':
          case 'password':
            return (
              <input
                type={type}
                id={id}
                className="outline-none bg-gray-50/80 border border-gray-200 text-gray-900 text-lg rounded-3xl focus:ring-primary-ornament focus:border-primary-ornament block w-full p-4 backdrop-blur-md transition-all"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                readOnly={readOnly}
                required
              />
            )
          case 'file':
            return (
              <input
                type="file"
                id={id}
                className="outline-none bg-gray-50/80 border border-gray-200 text-gray-900 text-lg rounded-3xl focus:ring-primary-ornament focus:border-primary-ornament block w-full p-4 backdrop-blur-md transition-all"
                onChange={onChange}
                readOnly={readOnly}
                required
              />
            )
        }
      })()}
      {error && <p className="text-red-500 text-sm pt-2 px-4">{error}</p>}
    </div>
  )
}
