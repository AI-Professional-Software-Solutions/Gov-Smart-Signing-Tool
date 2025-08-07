import React from 'react'
import { FormInput } from '../../FormInput'
import useCurrentLanguage from '../../../hooks/useCurrentLanguage'
import forge from 'node-forge'
import { Icon } from '@iconify/react/dist/iconify.js'

const translationsObject = {
  en: {
    publicKeyLabel: 'Public Key',
    copyNotification: 'Please copy the public key before proceeding to the next step.',
  },
  ro: {
    publicKeyLabel: 'Cheie Publică',
    copyNotification: 'Vă rugăm să copiați cheia publică înainte de a trece la următorul pas.',
  },
}

interface PublicKeyStepProps {
  publicKey: string
  alias: string
  onKeyCopied?: () => void
  showCopyReminder?: boolean
}

const PublicKeyStep: React.FC<PublicKeyStepProps> = ({
  publicKey,
  alias,
  onKeyCopied,
  showCopyReminder = false,
}) => {
  const currentLanguage = useCurrentLanguage()

  const data = {
    publicKey,
    alias,
  } as const

  const base64Data = btoa(JSON.stringify(data))
  const dataChecksum = forge.md.sha256.create().update(base64Data).digest().toHex()

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(`${base64Data}.${dataChecksum}`).then(
      () => {
        // Notify parent that key was copied
        onKeyCopied?.()
      },
      () => {
        alert('Failed to copy to clipboard')
      }
    )
  }

  return (
    <div>
      <FormInput
        label={translationsObject[currentLanguage].publicKeyLabel}
        id="publicKey"
        value={`${base64Data}.${dataChecksum}`}
        type="textarea"
        readOnly
        minRows={10}
        maxRows={10}
        download
        copyToClipboard
        onCopyToClipboard={handleCopyToClipboard}
        onDownload={(content) => {
          const element = document.createElement('a')
          element.setAttribute('href', `data:application/x-pem-file;base64,${btoa(content)}`)
          element.setAttribute('download', 'publicKey.pem')
          element.style.display = 'none'
          document.body.appendChild(element)
          element.click()
          document.body.removeChild(element)
        }}
      />

      {showCopyReminder && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
          <div className="flex items-center">
            <Icon icon="fluent:warning-24-filled" className="text-yellow-600 mr-2 h-5 w-5" />
            <p className="text-yellow-800 text-sm">{translationsObject[currentLanguage].copyNotification}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PublicKeyStep
