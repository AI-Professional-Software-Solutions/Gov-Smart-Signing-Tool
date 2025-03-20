import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Icon } from '@iconify/react/dist/iconify.js'
import govSmartLogo from '../assets/GovSmart_Logo_Black.svg'

const CertPopup = () => {
  const [selectedCert, setSelectedCert] = useState<string>('')
  const [certs, setCerts] = useState<Array<{ id: string; label: string }>>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const certsParam = params.get('certs')
    if (certsParam) {
      try {
        const parsedCerts = JSON.parse(decodeURIComponent(certsParam))
        setCerts(parsedCerts)
        if (parsedCerts.length > 0) {
          setSelectedCert(parsedCerts[0].id)
        }
      } catch (e) {
        console.error('Failed to parse certificates:', e)
        setError('Failed to load certificate list.')
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await invoke('complete_certificate', { certId: selectedCert })
      window.close()
    } catch (err) {
      console.error('Error invoking complete_certificate:', err)
      setError((err as string).toString())
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCertificate = (certId: string) => {
    setSelectedCert(certId)
  }

  return (
    <div
      className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center"
      style={
        {
          '--color-primary-ornament': '147 51 234',
        } as React.CSSProperties
      }
    >
      <div className="bg-primary-ornament transition-all duration-500 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[max(75vh,75vh)] h-[max(75vh,75vh)] rounded-full z-0 blur-[90px]"></div>

      <img src={govSmartLogo} alt="GovSmart Logo" className="w-80 h-44 z-20 opacity-90 mb-10" />

      <div
        className="relative backdrop-blur-md p-8 rounded-3xl drop-shadow-md w-[36rem] z-10"
        style={{
          background:
            'radial-gradient(circle at top left, rgba(233, 213, 255, 0.5), transparent 30%), radial-gradient(circle at bottom right, rgba(233, 213, 255, 0.5), transparent 30%), linear-gradient(to bottom right, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
        }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-purple-800">Select a Certificate</h2>

        {error && (
          <div className="text-red-500 text-center mb-4">
            <Icon icon="mdi:alert-circle" className="inline-block mr-2 h-5 w-5" />
            {error.toString()}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-purple-50/80 p-4 rounded-xl mb-6 backdrop-blur-sm border border-purple-100">
            <div className="flex items-center">
              <Icon icon="mdi:information" className="text-purple-600 h-6 w-6 mr-2" />
              <div>
                <h3 className="font-medium text-gray-900 text-left">Certificate Selection</h3>
                <p className="text-sm text-gray-500 text-left">
                  Select a certificate from the list below to use for signing.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full mb-6">
            <ul className="space-y-3">
              {certs.map((cert) => (
                <li
                  key={cert.id}
                  className={`bg-white/90 backdrop-blur-sm border ${
                    selectedCert === cert.id ? 'border-purple-500' : 'border-gray-200'
                  } rounded-xl p-3 shadow-sm hover:shadow transition-all cursor-pointer ${
                    selectedCert === cert.id ? 'bg-purple-50/50' : ''
                  }`}
                  onClick={() => handleSelectCertificate(cert.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon
                        icon="mdi:certificate"
                        className={`h-7 w-7 mr-3 ${
                          selectedCert === cert.id ? 'text-purple-600' : 'text-gray-500'
                        }`}
                      />
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900">{cert.label}</h3>
                        <p className="text-xs text-gray-500">ID: {cert.id.substring(0, 16)}...</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        selectedCert === cert.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100/80 text-gray-700 hover:bg-purple-100/80'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectCertificate(cert.id)
                      }}
                    >
                      Select
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              disabled={loading || !selectedCert}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow hover:shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Icon icon="svg-spinners:180-ring" className="animate-spin h-5 w-5" />
                  Processing...
                </>
              ) : (
                <>
                  <Icon icon="mdi:check-circle" className="h-5 w-5" />
                  Submit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CertPopup
