import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import useCurrentLanguage from '../../hooks/useCurrentLanguage'

interface TokenListProps {
  onBack: () => void
  onSelectCertificate?: (certId: string) => void
}

const translationsObject = {
  en: {
    title: 'Available Security Tokens',
    description: 'Select a certificate from the list below to use for signing documents.',
    noCertificates: 'No certificates found on the token. Please make sure your token is properly configured.',
    tokenConnectionGuide:
      'Please make sure your token is properly connected and try again. If the problem persists, check if your token is recognized by your system and has valid certificates installed.',
    selectButton: 'Select',
    backButton: 'Back to Search',
    secondaryContent: {
      title: 'Certificate Selection',
      description:
        'Each security token may contain multiple certificates. Choose the certificate that corresponds to your identity or the one required for the specific document you need to sign.',
    },
  },
  ro: {
    title: 'Token-uri de Securitate Disponibile',
    description: 'Selectați un certificat din lista de mai jos pentru a-l utiliza la semnarea documentelor.',
    noCertificates: 'Nu s-au găsit certificate pe token. Asigurați-vă că token-ul este configurat corect.',
    tokenConnectionGuide:
      'Asigurați-vă că token-ul este conectat corect și încercați din nou. Dacă problema persistă, verificați dacă token-ul este recunoscut de sistemul dvs. și are certificate valide instalate.',
    selectButton: 'Selectează',
    backButton: 'Înapoi la Căutare',
    secondaryContent: {
      title: 'Selectarea Certificatului',
      description:
        'Fiecare token de securitate poate conține mai multe certificate. Alegeți certificatul care corespunde identității dvs. sau cel necesar pentru documentul specific pe care trebuie să îl semnați.',
    },
  },
}

export const TokenList: React.FC<TokenListProps> = ({ onBack, onSelectCertificate }) => {
  const currentLanguage = useCurrentLanguage()
  const [certificates, setCertificates] = useState<Array<{ id: string; label: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCertId, setSelectedCertId] = useState<string | null>(null)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:8811/list-certificates')

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const result = await response.json()
      if (result.certificates && Array.isArray(result.certificates)) {
        setCertificates(result.certificates)
      } else {
        const certs = result.certificates || []
        setCertificates(Array.isArray(certs) ? certs : [certs])
      }

      if (Array.isArray(result.certificates) && result.certificates.length === 0) {
        setError(translationsObject[currentLanguage].noCertificates)
      }
    } catch (err) {
      console.error('Error fetching certificates:', err)
      setCertificates([])
      setError(translationsObject[currentLanguage].noCertificates)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCertificate = (certId: string) => {
    setSelectedCertId(certId)

    setTimeout(() => {
      if (onSelectCertificate) {
        onSelectCertificate(certId)
      }
      onBack()
    }, 500)
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-3xl font-bold mb-6 text-center text-purple-800">
        {translationsObject[currentLanguage].title}
      </h2>

      <p className="text-gray-700 mb-8 text-center">{translationsObject[currentLanguage].description}</p>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-8">
          <Icon icon="svg-spinners:180-ring" className="animate-spin h-12 w-12 text-purple-600 mb-4" />
          <p className="text-gray-700">Loading certificates...</p>
        </div>
      ) : error ? (
        <div className="text-center mb-8">
          <div className="text-red-500 mb-4">
            <Icon icon="mdi:alert-circle" className="inline-block mr-2 h-5 w-5" />
            {error}
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-700">
              {translationsObject[currentLanguage].tokenConnectionGuide}
            </p>
          </div>
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center text-red-500 mb-8">
          {translationsObject[currentLanguage].noCertificates}
        </div>
      ) : (
        <div className="w-full max-w-md mb-8">
          <ul className="space-y-4">
            {certificates.map((cert) => (
              <li
                key={cert.id}
                className={`bg-white border ${
                  selectedCertId === cert.id ? 'border-purple-500' : 'border-gray-200'
                } rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer`}
                onClick={() => handleSelectCertificate(cert.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon
                      icon="mdi:certificate"
                      className={`h-8 w-8 mr-3 ${
                        selectedCertId === cert.id ? 'text-purple-600' : 'text-gray-500'
                      }`}
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{cert.label}</h3>
                      <p className="text-sm text-gray-500">ID: {cert.id}</p>
                    </div>
                  </div>
                  <button
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      selectedCertId === cert.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectCertificate(cert.id)
                    }}
                  >
                    {translationsObject[currentLanguage].selectButton}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg transition-all duration-300"
        >
          <Icon icon="mdi:arrow-left" className="h-5 w-5" />
          {translationsObject[currentLanguage].backButton}
        </button>
      </div>

      <div className="mt-8 w-full max-w-md">
        <div className="bg-purple-100 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Icon icon="mdi:information" className="text-purple-600 h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold text-purple-800">
              {translationsObject[currentLanguage].secondaryContent.title}
            </h3>
          </div>
          <p className="text-gray-700 text-sm">
            {translationsObject[currentLanguage].secondaryContent.description}
          </p>
        </div>
      </div>
    </div>
  )
}
