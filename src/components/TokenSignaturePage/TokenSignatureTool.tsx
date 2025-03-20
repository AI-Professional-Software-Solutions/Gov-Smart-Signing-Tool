import React, { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import * as v from 'valibot'
import { Icon } from '@iconify/react/dist/iconify.js'
import { ResponsiveLayout } from '../ResponsiveLayout'
import { Stepper } from '../Stepper'
import { FormInput } from '../FormInput'
import useCurrentLanguage from '../../hooks/useCurrentLanguage'

const translationsObject = {
  en: {
    title: 'Sign Document with Token',
    fileHash: 'Document Hash',
    enterFileHash: 'Enter the document hash to sign',
    signButton: 'Sign Document',
    signing: 'Signing...',
    signedHash: 'Signed Hash',
    backButton: 'Back',
    nextButton: 'Next',
    steps: {
      enterHash: 'Enter Document Hash',
      signDocument: 'Sign Document',
      result: 'View Signed Hash',
    },
    secondaryContent: {
      enterHash: {
        title: 'Document Hash Information',
        description:
          'The document hash is a unique identifier for the document you want to sign. Copy this hash from the Gov-Smart platform and paste it here to proceed with signing.',
      },
      signDocument: {
        title: 'Certificate Selection',
        description:
          'Select a certificate from your token to sign the document. This process ensures that only you can sign the document with your secure token.',
      },
      result: {
        title: 'Signature Verification',
        description:
          'Your document has been successfully signed. Copy the signature hash and paste it back into the Gov-Smart platform to complete the signing process.',
      },
    },
    errors: {
      invalidPin: 'Invalid PIN. Please try again.',
      signingFailed: 'Signing failed. Please try again.',
      noCertificates: 'No certificates found. Please make sure your token is properly connected.',
      loadingCertificates: 'Loading certificates...',
    },
    certificateSelection: 'Certificate Selection',
    selectCertificate: 'Select a certificate from the list below to use for signing.',
    selectButton: 'Select',
    enterPin: 'Enter PIN',
    pinPlaceholder: 'Enter your token PIN',
  },
  ro: {
    title: 'Semnează Document cu Token',
    fileHash: 'Hash Document',
    enterFileHash: 'Introduceți hash-ul documentului pentru semnare',
    signButton: 'Semnează Document',
    signing: 'Se semnează...',
    signedHash: 'Hash Semnat',
    backButton: 'Înapoi',
    nextButton: 'Următorul',
    steps: {
      enterHash: 'Introduceți Hash Document',
      signDocument: 'Semnează Document',
      result: 'Vizualizează Hash Semnat',
    },
    secondaryContent: {
      enterHash: {
        title: 'Informații Hash Document',
        description:
          'Hash-ul documentului este un identificator unic pentru documentul pe care doriți să îl semnați. Copiați acest hash de pe platforma Gov-Smart și lipiți-l aici pentru a continua cu semnarea.',
      },
      signDocument: {
        title: 'Selectarea Certificatului',
        description:
          'Selectați un certificat de pe token pentru a semna documentul. Acest proces asigură că doar dvs. puteți semna documentul cu token-ul dvs. securizat.',
      },
      result: {
        title: 'Verificare Semnătură',
        description:
          'Documentul dvs. a fost semnat cu succes. Copiați hash-ul semnăturii și lipiți-l înapoi în platforma Gov-Smart pentru a finaliza procesul de semnare.',
      },
    },
    errors: {
      invalidPin: 'PIN invalid. Vă rugăm să încercați din nou.',
      signingFailed: 'Semnarea a eșuat. Vă rugăm să încercați din nou.',
      noCertificates: 'Nu s-au găsit certificate. Asigurați-vă că token-ul este conectat corect.',
      loadingCertificates: 'Se încarcă certificatele...',
    },
    certificateSelection: 'Selectarea Certificatului',
    selectCertificate: 'Selectați un certificat din lista de mai jos pentru semnare.',
    selectButton: 'Selectează',
    enterPin: 'Introduceți PIN-ul',
    pinPlaceholder: 'Introduceți PIN-ul token-ului',
  },
}

type StepType = 'enterHash' | 'signDocument' | 'result'

interface FormData {
  fileHash: string
  pin: string
}

interface Certificate {
  id: string
  label: string
}

const validationSchema = v.object({
  fileHash: v.string(),
  pin: v.optional(v.string()),
})

export const TokenSignatureTool: React.FC = () => {
  const currentLanguage = useCurrentLanguage()
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: valibotResolver(validationSchema),
    defaultValues: {
      fileHash: '',
      pin: '',
    },
  })

  const [step, setStep] = useState<StepType>('enterHash')
  const [loading, setLoading] = useState(false)
  const [signedHash, setSignedHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loadingCertificates, setLoadingCertificates] = useState(false)
  const [selectedCertId, setSelectedCertId] = useState<string | null>(null)

  const parentDivRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateParentHeight = () => {
      if (parentDivRef.current && contentRef.current) {
        parentDivRef.current.style.height = `${contentRef.current.offsetHeight}px`
      }
    }

    updateParentHeight()
  }, [step])

  useEffect(() => {
    if (step === 'signDocument') {
      fetchCertificates()
    }
  }, [step])

  const fetchCertificates = async () => {
    setLoadingCertificates(true)
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
    } catch (err) {
      console.error('Error fetching certificates:', err)
      setCertificates([])
    } finally {
      setLoadingCertificates(false)
    }
  }

  const handleSelectCertificate = (certId: string) => {
    setSelectedCertId(certId)
  }

  const onSubmit = async (data: FormData) => {
    if (step === 'enterHash') {
      setStep('signDocument')
    } else if (step === 'signDocument') {
      if (!selectedCertId) {
        setError('Please select a certificate')
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch('http://localhost:8811/sign-document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cert_hash: selectedCertId,
            hash: data.fileHash,
            timestamp: new Date().toISOString(),
            signed_certificate: selectedCertId,
            pin: data.pin,
          }),
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const result = await response.json()
        setSignedHash(result.signature)
        setStep('result')
      } catch (err) {
        console.error('Error signing document:', err)
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
  }

  const goBack = () => {
    if (step === 'signDocument') {
      setStep('enterHash')
      setSelectedCertId(null)
    } else if (step === 'result') {
      setStep('signDocument')
    }
  }

  const stepsList = [
    {
      stepId: 'enterHash',
      label: translationsObject[currentLanguage].steps.enterHash,
    },
    {
      stepId: 'signDocument',
      label: translationsObject[currentLanguage].steps.signDocument,
    },
    {
      stepId: 'result',
      label: translationsObject[currentLanguage].steps.result,
    },
  ]

  const mappedStepList = stepsList.map((s) => {
    const currentStepIndex = stepsList.findIndex((st) => st.stepId === step)
    const idx = stepsList.findIndex((st) => st.stepId === s.stepId)

    return {
      ...s,
      completed: idx < currentStepIndex,
    }
  }) as {
    stepId: StepType
    label: string
    completed: boolean
  }[]

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

      <form onSubmit={handleSubmit(onSubmit)}>
        <ResponsiveLayout
          primaryContent={
            <div ref={parentDivRef} className="w-full rounded z-10 relative overflow-visible">
              <div
                ref={contentRef}
                className="xl:max-h-[60vh] overflow-y-auto duration-300 absolute w-full top-1/2 -translate-y-1/2 left-0 transition-all opacity-100 scale-100"
              >
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-6 text-center text-purple-800">
                    {translationsObject[currentLanguage].title}
                  </h2>

                  {/* <form onSubmit={handleSubmit(onSubmit)}> */}
                  {step === 'enterHash' && (
                    <FormInput
                      label={translationsObject[currentLanguage].fileHash}
                      id="fileHash"
                      value={watch('fileHash')}
                      type="textarea"
                      placeholder={translationsObject[currentLanguage].enterFileHash}
                      error={errors.fileHash?.message}
                      onChange={(e) => setValue('fileHash', e.target.value)}
                    />
                  )}

                  {step === 'signDocument' && (
                    <div className="text-center">
                      <p className="mb-4 text-gray-700">{watch('fileHash')}</p>

                      <div className="bg-purple-50 p-4 rounded-lg mb-6">
                        <div className="flex items-center">
                          <Icon icon="mdi:information" className="text-purple-600 h-6 w-6 mr-2" />
                          <div>
                            <h3 className="font-medium text-gray-900 text-left">
                              {translationsObject[currentLanguage].certificateSelection}
                            </h3>
                            <p className="text-sm text-gray-500 text-left">
                              {translationsObject[currentLanguage].selectCertificate}
                            </p>
                          </div>
                        </div>
                      </div>

                      {loadingCertificates ? (
                        <div className="flex flex-col items-center justify-center p-4">
                          <Icon
                            icon="svg-spinners:180-ring"
                            className="animate-spin h-8 w-8 text-purple-600 mb-2"
                          />
                          <p className="text-gray-700">
                            {translationsObject[currentLanguage].errors.loadingCertificates}
                          </p>
                        </div>
                      ) : certificates.length === 0 ? (
                        <div className="text-center text-red-500 mb-4">
                          <Icon icon="mdi:alert-circle" className="inline-block mr-2 h-5 w-5" />
                          {translationsObject[currentLanguage].errors.noCertificates}
                        </div>
                      ) : (
                        <div className="w-full mb-6">
                          <ul className="space-y-3">
                            {certificates.map((cert) => (
                              <li
                                key={cert.id}
                                className={`bg-white border ${
                                  selectedCertId === cert.id ? 'border-purple-500' : 'border-gray-200'
                                } rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer`}
                                onClick={() => handleSelectCertificate(cert.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <Icon
                                      icon="mdi:certificate"
                                      className={`h-7 w-7 mr-3 ${
                                        selectedCertId === cert.id ? 'text-purple-600' : 'text-gray-500'
                                      }`}
                                    />
                                    <div className="text-left">
                                      <h3 className="font-medium text-gray-900">{cert.label}</h3>
                                      <p className="text-xs text-gray-500">
                                        ID: {cert.id.substring(0, 16)}...
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
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

                      {selectedCertId && (
                        <div className="mb-4">
                          <FormInput
                            label={translationsObject[currentLanguage].enterPin}
                            id="pin"
                            value={watch('pin')}
                            type="password"
                            placeholder={translationsObject[currentLanguage].pinPlaceholder}
                            error={errors.pin?.message}
                            onChange={(e) => setValue('pin', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {step === 'result' && signedHash && (
                    <FormInput
                      label={translationsObject[currentLanguage].signedHash}
                      id="signedHash"
                      value={signedHash}
                      type="textarea"
                      readOnly
                      minRows={5}
                      maxRows={5}
                      copyToClipboard
                    />
                  )}

                  {error && <div className="text-red-500 text-center mb-4">{error}</div>}
                </div>
              </div>
            </div>
          }
          secondaryContent={
            <div className="w-full rounded z-10">
              {step === 'enterHash' && (
                <div>
                  <div className="mb-4">
                    <p className="font-semibold transition-all text-lg text-purple-600">
                      {translationsObject[currentLanguage].secondaryContent.enterHash.title}
                    </p>
                  </div>
                  <p className="text-gray-500 mb-4">
                    {translationsObject[currentLanguage].secondaryContent.enterHash.description}
                  </p>
                </div>
              )}

              {step === 'signDocument' && (
                <div>
                  <div className="mb-4">
                    <p className="font-semibold transition-all text-lg text-purple-600">
                      {translationsObject[currentLanguage].secondaryContent.signDocument.title}
                    </p>
                  </div>
                  <p className="text-gray-500 mb-4">
                    {translationsObject[currentLanguage].secondaryContent.signDocument.description}
                  </p>
                </div>
              )}

              {step === 'result' && (
                <div>
                  <div className="mb-4">
                    <p className="font-semibold transition-all text-lg text-purple-600">
                      {translationsObject[currentLanguage].secondaryContent.result.title}
                    </p>
                  </div>
                  <p className="text-gray-500 mb-4">
                    {translationsObject[currentLanguage].secondaryContent.result.description}
                  </p>
                </div>
              )}

              <div className="flex justify-start mt-6 gap-4">
                {step !== 'enterHash' && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="h-12 w-12 rounded-full flex items-center justify-center transition-all border-purple-500 border-2 text-purple-500 hover:bg-purple-500 hover:text-white hover:opacity-90 active:opacity-80 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Icon icon="fluent:play-32-filled" className="transform rotate-180" />
                  </button>
                )}

                {step !== 'result' && (
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      (step === 'enterHash' && !watch('fileHash')) ||
                      (step === 'signDocument' && (!selectedCertId || !watch('pin')))
                    }
                    className="text-white h-12 w-12 rounded-full flex items-center justify-center transition-all bg-purple-600 hover:bg-purple-700 hover:opacity-90 active:opacity-80 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <Icon icon="svg-spinners:180-ring" className="animate-spin h-5 w-5" />
                    ) : (
                      <Icon icon="fluent:play-32-filled" />
                    )}
                  </button>
                )}
              </div>
            </div>
          }
          progressBar={
            <div className="w-full">
              <Stepper
                currentStepIndex={mappedStepList.findIndex((s) => s.stepId === step)}
                steps={mappedStepList}
              />
            </div>
          }
          navigation={null}
        />
      </form>
    </div>
  )
}
