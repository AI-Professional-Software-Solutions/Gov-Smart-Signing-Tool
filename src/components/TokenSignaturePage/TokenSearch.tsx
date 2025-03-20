import React, { useState, useEffect } from 'react'
import { ResponsiveLayout } from '../ResponsiveLayout'
import { Icon } from '@iconify/react/dist/iconify.js'
import useCurrentLanguage from '../../hooks/useCurrentLanguage'

interface TokenSearchProps {
  onPrimaryColorChange: (color: string) => void
}

const translationsObject = {
  en: {
    title: 'Search for Security Tokens',
    description:
      'Connect your security token to your computer and click the search button to find available tokens.',
    searchButton: 'Search for Tokens',
    searching: 'Searching...',
    noTokensFound: 'No tokens found. Please make sure your token is properly connected and try again.',
    tokensFound: 'Security tokens found!',
    searchComplete: 'Token search complete',
    searchCompleteDescription:
      'A popup window has been opened for you to select a certificate from your token. Please complete the selection in the popup window.',
    backButton: 'Back',
    secondaryContent: {
      title: 'Using Security Tokens',
      description:
        'Security tokens provide a high level of protection for your digital signatures. These hardware devices store your certificates and private keys securely, ensuring that your sensitive information never leaves the protected environment of the token. To use a token for signing, you need to connect it to your computer, search for available tokens, select the certificate you want to use, and enter your PIN when prompted.',
    },
  },
  ro: {
    title: 'Căutare Token-uri de Securitate',
    description:
      'Conectați token-ul de securitate la computer și apăsați butonul de căutare pentru a găsi token-urile disponibile.',
    searchButton: 'Caută Token-uri',
    searching: 'Se caută...',
    noTokensFound:
      'Nu s-au găsit token-uri. Asigurați-vă că token-ul este conectat corect și încercați din nou.',
    tokensFound: 'Token-uri de securitate găsite!',
    searchComplete: 'Căutarea token-urilor completă',
    searchCompleteDescription:
      'O fereastră popup a fost deschisă pentru a selecta un certificat de pe token-ul dvs. Vă rugăm să completați selecția în fereastra popup.',
    backButton: 'Înapoi',
    secondaryContent: {
      title: 'Utilizarea Token-urilor de Securitate',
      description:
        'Token-urile de securitate oferă un nivel ridicat de protecție pentru semnăturile dvs. digitale. Aceste dispozitive hardware stochează certificatele și cheile private în siguranță, asigurându-se că informațiile sensibile nu părăsesc niciodată mediul protejat al token-ului. Pentru a utiliza un token pentru semnare, trebuie să îl conectați la computer, să căutați token-urile disponibile, să selectați certificatul pe care doriți să îl utilizați și să introduceți PIN-ul când vi se solicită.',
    },
  },
}

export const TokenSearch: React.FC<TokenSearchProps> = ({ onPrimaryColorChange }) => {
  const currentLanguage = useCurrentLanguage()
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchComplete, setSearchComplete] = useState(false)

  useEffect(() => {
    onPrimaryColorChange('147 51 234')
  }, [onPrimaryColorChange])

  const handleSearchTokens = async () => {
    setIsSearching(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:8811/certificate')

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      setSearchComplete(true)
    } catch (err) {
      console.error('Error searching for tokens:', err)
      setError((err as Error).message)
    } finally {
      setIsSearching(false)
    }
  }

  const handleBackClick = () => {
    setSearchComplete(false)
  }

  return (
    <div
      className="relative overflow-hidden min-h-screen flex items-center justify-center"
      style={
        {
          '--color-primary-ornament': '147 51 234',
        } as React.CSSProperties
      }
    >
      <div className="bg-primary-ornament transition-all duration-500 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[max(75vh,75vh)] h-[max(75vh,75vh)] rounded-full z-0 blur-[90px]"></div>

      <ResponsiveLayout
        primaryContent={
          <div className="w-full rounded z-10 relative">
            {!searchComplete ? (
              <div className="flex flex-col items-center justify-center p-8">
                <h2 className="text-3xl font-bold mb-6 text-center text-purple-800">
                  {translationsObject[currentLanguage].title}
                </h2>

                <div className="mb-8 text-center">
                  <p className="text-gray-700 mb-6">{translationsObject[currentLanguage].description}</p>

                  <div className="flex justify-center">
                    <button
                      onClick={handleSearchTokens}
                      disabled={isSearching}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      {isSearching ? (
                        <>
                          <Icon icon="svg-spinners:180-ring" className="animate-spin h-5 w-5" />
                          {translationsObject[currentLanguage].searching}
                        </>
                      ) : (
                        <>
                          <Icon icon="mdi:card-search" className="h-5 w-5" />
                          {translationsObject[currentLanguage].searchButton}
                        </>
                      )}
                    </button>
                  </div>

                  {error && (
                    <div className="mt-4 text-red-500">
                      {translationsObject[currentLanguage].noTokensFound}
                    </div>
                  )}
                </div>

                {/* Notice moved to secondary content */}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8">
                <h2 className="text-3xl font-bold mb-6 text-center text-purple-800">
                  {translationsObject[currentLanguage].searchComplete}
                </h2>

                <div className="mb-8 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold flex items-center">
                      <Icon icon="mdi:check-circle" className="mr-2 h-5 w-5" />
                      {translationsObject[currentLanguage].tokensFound}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-6">
                    {translationsObject[currentLanguage].searchCompleteDescription}
                  </p>
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleBackClick}
                    className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg transition-all duration-300"
                  >
                    <Icon icon="mdi:arrow-left" className="h-5 w-5" />
                    {translationsObject[currentLanguage].backButton}
                  </button>
                </div>
              </div>
            )}
          </div>
        }
        secondaryContent={
          <div className="w-full rounded z-10">
            {!searchComplete && (
              <div>
                <div className="mb-4">
                  <p className="font-semibold transition-all text-lg text-purple-600">
                    {translationsObject[currentLanguage].secondaryContent.title}
                  </p>
                </div>
                <p className="text-gray-500 mb-4">
                  {translationsObject[currentLanguage].secondaryContent.description}
                </p>
              </div>
            )}
          </div>
        }
        progressBar={null}
        navigation={null}
      />
    </div>
  )
}
