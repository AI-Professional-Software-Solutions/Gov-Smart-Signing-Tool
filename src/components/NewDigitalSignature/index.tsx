import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import * as v from 'valibot'
import { Icon } from '@iconify/react'
import { ResponsiveLayout } from '../ResponsiveLayout'
import { Stepper } from '../Stepper'
import BranchStep from './steps/BranchStep'
import GenerateStep from './steps/GenerateStep'
import { generateRandomWords } from './helpers/generateRandomWords'
import { Attributes, createPKCS12FromPassphrase } from './helpers/createPKCS12FromPassphraseModule'
import PrivateKeyStep from './steps/PrivateKeyStep'
import PublicKeyStep from './steps/PublicKeyStep'
import useCurrentLanguage from '../../hooks/useCurrentLanguage'
import PasswordStep from './steps/PasswordStep'
import PassphraseStep from './steps/PassphraseStep'
import AliasStep from './steps/AliasStep'

interface FormData {
  signatureAlias: string
  commonName: string
  countryName: string
  stateOrProvince: string
  localityName: string
  organizationName: string
  organizationalUnitName: string
  storage: 'cloud' | 'local' | null
  generationMethod: 'brainwallet' | 'random' | null
  passphrase: string
  password: string
}

const primaryColorsRgb = {
  null: '107 114 128',
  brainwallet: '37 99 235',
  random: '255 99 71',
}

const translationsObject = {
  en: {
    selectStorage: 'Select Signature Storage Type',
    signatureGeneration: 'Signature Generation Method',
    generateSignature: 'Generate Signature',
    viewPublicKey: 'View Public Key',
    downloadPrivateKey: 'Download Private Key',
    copyConfirmationCode: 'Confirm',
    storeSignatureInCloud: 'Store Signature in Cloud',
    selfGenerateLocalSignature: 'Self Generate Local Signature',
    selectOption: 'Please select an option',
    storageDescription:
      'Select whether you want to store your digital signature in the cloud or generate and store it locally on your device.',
    methodDescription:
      'Choose your method for generating the digital signature. You can either use a Brainwallet, which is a passphrase you generate, or a Random method where the system generates it for you.',
    generateDescription:
      'Fill out the form with the required details to generate your digital signature. Make sure to provide accurate information.',
    publicKeyDescription:
      'Your public key has been successfully generated. You can now view and copy your public key.',
    privateKeyDescription:
      'Your private key has been successfully generated. You can now download your private key.',
    confirmationCodeDescription:
      'Your confirmation code has been generated. Please copy and store it securely.',
    words: [
      'apple',
      'banana',
      'cherry',
      'date',
      'fig',
      'grape',
      'kiwi',
      'lemon',
      'mango',
      'nectarine',
      'orange',
      'papaya',
      'quince',
      'raspberry',
      'strawberry',
      'tangerine',
      'ugli',
      'vanilla',
      'watermelon',
      'xigua',
      'yam',
      'zucchini',
    ],
    steps: {
      signatureAlias: 'Signature Alias',
      signatureGeneration: 'Signature Generation Method',
      generateSignature: 'Generate Signature',
      viewPublicKey: 'View Public Key',
      downloadPrivateKey: 'Download Private Key',
      copyConfirmationCode: 'Confirm',
      password: 'Password',
      passphrase: 'Passphrase',
    },
    stepsListLabels: {
      branch: 'Select Signature Type',
      passphrase: 'Create Passphrase',
      password: 'Password',
      alias: 'Signature Name',
      generate: 'Review Your Details',
      private: 'Download Signature',
      public: 'Enter Linking Code',
      confirmation: 'Copy Confirmation',
    },
    wellDone: 'Well done! Your digital signature is ready.',
    wellDoneDescription: 'You can now sign documents using your new digital signature.',
    secondaryContent: {
      branch: {
        title: 'Choose Your Signature Type',
        description:
          "To proceed, select how you'd like to access your electronic signature. You can choose between using a Brain Wallet, which relies on a passphrase, or a Locally Stored File, where your signature is saved on your device.",
      },
      generate: {
        title: 'Confirm Your Information',
        description:
          'Review the details provided by the platform. All inputs, including your name, email, and other relevant information, have been auto-generated for your convenience. These fields are optional, so you can choose to keep, modify, or leave them as they are. This ensures that your electronic signature is personalized to your preferences while still providing flexibility and control.',
      },
      public: {
        title: 'Associate Your Signature with the Platform',
        description:
          'Your linking code has been generated. Copy the code from your signature tool and paste it into the platform to securely associate your electronic signature. This step is essential for linking your signature to the Gov-Smart platform, ensuring that your electronic signature is recognized and trusted within the system.',
      },
      private: {
        title: 'Save Your Electronic Signature',
        description:
          'To proceed, download your electronic signature and save it securely on a USB stick or directly on your device. This file is essential for signing documents, so ensure it is stored in a safe location. Remember, you are in full control and responsible for keeping your signature secure. To move to the next step, click the download button and store your signature locally in your preferred location.',
      },
      alias: {
        title: 'Assign a Name to Your Signature Input',
        description:
          'Give your electronic signature a unique name for easy identification and management. Whether using multiple signatures or simply personalizing your digital identity, this step helps you stay organized and ensures that your signatures are clearly labeled for future use.',
      },
      password: {
        title: 'Strengthen Your Digital Security',
        description:
          'Create a strong password to encrypt your wallet, ensuring that your digital signature and private key are securely protected. You will need to remember and use this password every time you sign a document, adding an essential layer of security to your digital transactions.',
      },
      passphrase: {
        title: 'Generate Your Secure Passphrase',
        description:
          'Create a secure 12-word passphrase that will serve as the key to your Brain Wallet. This passphrase must be remembered exactly in the same order, as it will be used to generate your electronic signature whenever you sign documents. By using this method, you eliminate the need to store any files on your computer, ensuring that your signature is accessible only through your memory.',
      },
    },
  },
  ro: {
    selectStorage: 'Selectați Tipul de Stocare a Semnăturii',
    signatureGeneration: 'Metoda de Generare a Semnăturii',
    generateSignature: 'Generați Semnătura',
    viewPublicKey: 'Vizualizați Cheia Publică',
    downloadPrivateKey: 'Descărcați Cheia Privată',
    copyConfirmationCode: 'Copiați Codul de Confirmare',
    storeSignatureInCloud: 'Stocați Semnătura În Cloud',
    selfGenerateLocalSignature: 'Generați Singur Semnătura Locală',
    selectOption: 'Vă rugăm să selectați o opțiune',
    storageDescription:
      'Selectați dacă doriți să stocați semnătura digitală în cloud sau să o generați și să o stocați local pe dispozitivul dvs.',
    methodDescription:
      'Alegeți metoda de generare a semnăturii digitale. Puteți utiliza fie un Brainwallet, care este o parolă generată de dvs., fie o metodă aleatorie în care sistemul o generează pentru dvs.',
    generateDescription:
      'Completați formularul cu detaliile necesare pentru a genera semnătura digitală. Asigurați-vă că furnizați informații corecte.',
    publicKeyDescription:
      'Cheia dvs. publică a fost generată cu succes. Acum puteți vizualiza și copia cheia publică.',
    privateKeyDescription:
      'Cheia dvs. privată a fost generată cu succes. Acum puteți descărca cheia privată.',
    confirmationCodeDescription:
      'Codul dvs. de confirmare a fost generat. Vă rugăm să-l copiați și să-l stocați în siguranță.',
    words: [
      'mar',
      'banana',
      'cires',
      'data',
      'smochin',
      'strugure',
      'kiwi',
      'lamaie',
      'mango',
      'nectarina',
      'portocala',
      'papaya',
      'gutui',
      'zmeura',
      'capsuna',
      'mandarina',
      'ugli',
      'vanilie',
      'pepene galben',
      'xigua',
      'cartof dulce',
      'zucchini',
    ],
    steps: {
      signatureAlias: 'Alias Semnătură',
      signatureGeneration: 'Metoda de Generare a Semnăturii',
      generateSignature: 'Generează Semnătura',
      viewPublicKey: 'Vizualizează Cheia Publică',
      downloadPrivateKey: 'Descarcă Cheia Privată',
      copyConfirmationCode: 'Confirmă',
      password: 'Parolă',
      passphrase: 'Parolă Secretă',
    },
    stepsListLabels: {
      branch: 'Selectează Tipul Semnăturii',
      passphrase: 'Creează Parolă Secretă',
      password: 'Parolă',
      alias: 'Numele Semnăturii',
      generate: 'Revizuiește Detaliile Tale',
      private: 'Descarcă Semnătura',
      public: 'Introdu Codul de Legătură',
      confirmation: 'Copiază Confirmarea',
    },
    wellDone: 'Felicitări, semnătura ta digitală a fost creată!',
    wellDoneDescription:
      'O să poți semna documente cu aceasta după ce va fi aprobată de un responsabil din cadrul instituției.',
    secondaryContent: {
      branch: {
        title: 'Alege Tipul de Semnătură',
        description:
          'Pentru a continua, selectează cum dorești să accesezi semnătura electronică. Poți alege între utilizarea unui Brain Wallet, care se bazează pe o parolă secretă, sau un Fișier Stocat Local, unde semnătura ta este salvată pe dispozitivul tău.',
      },
      generate: {
        title: 'Confirmă Informațiile Tale',
        description:
          'Revizuiește detaliile furnizate de platformă. Toate informațiile, inclusiv numele, e-mailul și alte date relevante, au fost generate automat pentru confortul tău. Aceste câmpuri sunt opționale, deci poți alege să le păstrezi, să le modifici sau să le lași așa cum sunt. Acest lucru asigură că semnătura ta electronică este personalizată conform preferințelor tale, oferindu-ți în același timp flexibilitate și control.',
      },
      public: {
        title: 'Asociază Semnătura cu Platforma',
        description:
          'Codul tău de legătură a fost generat. Copiază codul din instrumentul de semnătură și lipește-l în platformă pentru a asocia în siguranță semnătura electronică. Acest pas este esențial pentru legarea semnăturii tale la platforma Gov-Smart, asigurându-te că semnătura ta electronică este recunoscută și de încredere în cadrul sistemului.',
      },
      private: {
        title: 'Salvează Semnătura Electronică',
        description:
          'Pentru a continua, descarcă semnătura electronică și salveaz-o în siguranță pe un stick USB sau direct pe dispozitivul tău. Acest fișier este esențial pentru semnarea documentelor, deci asigură-te că este stocat într-un loc sigur. Amintește-ți că ești în deplin control și responsabil pentru menținerea securității semnăturii tale. Pentru a trece la pasul următor, apasă pe butonul de descărcare și stochează semnătura local în locul preferat.',
      },
      alias: {
        title: 'Atribuie un Nume Semnăturii Tale',
        description:
          'Atribuie semnăturii tale electronice un nume unic pentru o identificare și gestionare ușoară. Indiferent dacă utilizezi mai multe semnături sau doar personalizezi identitatea ta digitală, acest pas te ajută să rămâi organizat și să te asiguri că semnăturile tale sunt clar etichetate pentru utilizare viitoare.',
      },
      password: {
        title: 'Întărește-ți Securitatea Digitală',
        description:
          'Creează o parolă puternică pentru a cripta portofelul tău, asigurându-te că semnătura digitală și cheia ta privată sunt protejate în siguranță. Va trebui să îți amintești și să folosești această parolă de fiecare dată când semnezi un document, adăugând un strat esențial de securitate tranzacțiilor tale digitale.',
      },
      passphrase: {
        title: 'Generează Parola Secretă Securizată',
        description:
          'Creează o parolă secretă sigură formată din 12 cuvinte, care va servi drept cheie pentru Brain Wallet-ul tău. Această parolă secretă trebuie reținută exact în aceeași ordine, deoarece va fi folosită pentru a genera semnătura electronică ori de câte ori semnezi documente. Prin utilizarea acestei metode, elimini nevoia de a stoca fișiere pe computerul tău, asigurându-te că semnătura ta este accesibilă doar prin memoria ta.',
      },
    },
  },
}

type StepType =
  | 'alias'
  | 'branch'
  | 'password'
  | 'passphrase'
  | 'generate'
  | 'public'
  | 'private'
  | 'confirmation'

const validationSchema = v.object({
  signatureAlias: v.string(),
  commonName: v.string(),
  countryName: v.string(),
  stateOrProvince: v.string(),
  localityName: v.string(),
  organizationName: v.string(),
  organizationalUnitName: v.string(),
  generationMethod: v.picklist(['brainwallet', 'random']),
  passphrase: v.string(),
  password: v.string(),
})

interface NewDigitalSignatureProps {
  onPrimaryColorChange: (color: string) => void
}

export const NewDigitalSignature: React.FC<NewDigitalSignatureProps> = ({ onPrimaryColorChange }) => {
  const {
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: valibotResolver(validationSchema),
    defaultValues: {
      commonName: '',
      countryName: '',
      stateOrProvince: '',
      localityName: '',
      organizationName: '',
      organizationalUnitName: '',
      generationMethod: null,
      passphrase: '',
      password: '',
    },
  })

  const currentLanguage = useCurrentLanguage()

  const [step, setStep] = useState<StepType>('branch')
  const [primaryColor, setPrimaryColor] = useState(primaryColorsRgb['null'])
  const [loading, setLoading] = useState(false)
  const [publicKey, setPublicKey] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [wasKeyDownloaded, setWasKeyDownloaded] = useState(false)
  const [wasKeyCopied, setWasKeyCopied] = useState(false)

  const generationMethod = watch('generationMethod')

  const aliasStepRef = useRef<HTMLDivElement>(null)
  const branchStepRef = useRef<HTMLDivElement>(null)
  const generateStepRef = useRef<HTMLDivElement>(null)
  const publicStepRef = useRef<HTMLDivElement>(null)
  const privateStepRef = useRef<HTMLDivElement>(null)
  const confirmationStepRef = useRef<HTMLDivElement>(null)
  const parentDivRef = useRef<HTMLDivElement>(null)
  const passwordStepRef = useRef<HTMLDivElement>(null)
  const passphraseStepRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (generationMethod === 'brainwallet') {
      setValue(
        'passphrase',
        generateRandomWords(10, translationsObject[currentLanguage].words).split(' ').slice(0, 10).join(' ')
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generationMethod, setValue])

  useEffect(() => {
    onPrimaryColorChange(primaryColor)
  }, [primaryColor, onPrimaryColorChange])

  useEffect(() => {
    const updateParentHeight = () => {
      const currentStepRef =
        step === 'branch'
          ? branchStepRef
          : step === 'generate'
          ? generateStepRef
          : step === 'public'
          ? publicStepRef
          : step === 'private'
          ? privateStepRef
          : confirmationStepRef

      if (currentStepRef.current && parentDivRef.current) {
        parentDivRef.current.style.height = `${currentStepRef.current.offsetHeight}px`
      }
    }

    updateParentHeight()
  }, [step, generationMethod])

  const proceedToGenerate = () => {
    let hasError = false
    const { passphrase, password } = getValues()
    if (generationMethod === 'brainwallet' && passphrase.trim().split(/\s+/).length !== 10) {
      hasError = true
    }
    if (password.trim() === '' && generationMethod === 'random') {
      hasError = true
    }
    if (!hasError) {
      setStep('generate')
      setWasKeyDownloaded(false)
    }
  }

  const proceedToPassword = () => {
    setStep('password')
  }

  const proceedToPassphrase = () => {
    setStep('passphrase')
  }

  const proceedToAlias = () => {
    setStep('alias')
  }

  const goBack = () => {
    if (step === 'generate') {
      setStep('alias')
    } else if (step === 'alias') {
      if (generationMethod === 'random') {
        setStep('password')
      } else if (generationMethod === 'brainwallet') {
        setStep('passphrase')
      }
    } else if (step === 'password') {
      if (generationMethod === 'random') {
        setStep('branch')
      } else if (generationMethod === 'brainwallet') {
        setStep('passphrase')
      }
    } else if (step === 'passphrase') {
      setStep('branch')
    } else if (step === 'public') {
      if (generationMethod === 'brainwallet') {
        setStep('generate')
      } else {
        setStep('private')
      }
    } else if (step === 'private') {
      setStep('generate')
    } else if (step === 'confirmation') {
      setStep('public')
    }
  }

  const goToNextStep = () => {
    if (step === 'branch') {
      if (generationMethod === 'random') {
        proceedToPassword()
      } else if (generationMethod === 'brainwallet') {
        proceedToPassphrase()
      }
    } else if (step === 'passphrase') {
      proceedToAlias()
    } else if (step === 'password') {
      proceedToAlias()
    } else if (step === 'alias') {
      proceedToGenerate()
    } else if (step === 'generate') {
      handleGenerateKeypair()
    } else if (step === 'private') {
      if (generationMethod === 'brainwallet') {
        setStep('confirmation')
      } else {
        setStep('public')
      }
    } else if (step === 'public') {
      setStep('confirmation')
    }
  }

  const handleGenerateKeypair = async () => {
    setLoading(true)
    const passphraseValue =
      generationMethod === 'brainwallet'
        ? getValues('passphrase')
        : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const passwordValue = getValues('password')

    try {
      const attributes: Attributes = {
        commonName: getValues('commonName'),
        countryName: getValues('countryName'),
        stateOrProvince: getValues('stateOrProvince'),
        localityName: getValues('localityName'),
        organizationName: getValues('organizationName'),
        organizationalUnitName: getValues('organizationalUnitName'),
      }

      const usedPassword = generationMethod === 'random' ? passwordValue : passphraseValue
      const result = await createPKCS12FromPassphrase(usedPassword, passphraseValue, attributes)
      setPublicKey(result.publicKey)
      setPrivateKey(result.pkcs12File)
      // Reset copy state when new keys are generated
      setWasKeyCopied(false)

      if (generationMethod === 'random') {
        setStep('private')
      } else {
        setStep('public')
      }
    } catch (error) {
      console.error('Error generating keypair:', error)
    } finally {
      setLoading(false)
    }
  }
  const toggleGenerationMethod = (selectedMethod: 'brainwallet' | 'random' | null) => {
    setValue('generationMethod', selectedMethod)
    if (selectedMethod === 'brainwallet') {
      setValue(
        'passphrase',
        generateRandomWords(10, translationsObject[currentLanguage].words).split(' ').slice(0, 10).join(' ')
      )
    }

    setPrimaryColor(
      selectedMethod === null
        ? primaryColorsRgb['null']
        : selectedMethod === 'brainwallet'
        ? primaryColorsRgb['brainwallet']
        : primaryColorsRgb['random']
    )
  }

  const stepsList = [
    {
      stepId: 'branch',
      label: translationsObject[currentLanguage].stepsListLabels.branch,
    },
    ...(generationMethod === 'brainwallet'
      ? [
          {
            stepId: 'passphrase',
            label: translationsObject[currentLanguage].stepsListLabels.passphrase,
          },
        ]
      : []),
    ...(generationMethod === 'random'
      ? [
          {
            stepId: 'password',
            label: translationsObject[currentLanguage].stepsListLabels.password,
          },
        ]
      : []),
    {
      stepId: 'alias',
      label: translationsObject[currentLanguage].stepsListLabels.alias,
    },
    {
      stepId: 'generate',
      label: translationsObject[currentLanguage].stepsListLabels.generate,
    },
    ...(generationMethod !== 'brainwallet'
      ? [
          {
            stepId: 'private',
            label: translationsObject[currentLanguage].stepsListLabels.private,
          },
        ]
      : []),
    {
      stepId: 'public',
      label: translationsObject[currentLanguage].stepsListLabels.public,
    },
    {
      stepId: 'confirmation',
      label: translationsObject[currentLanguage].stepsListLabels.confirmation,
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

  console.log('mappedStepList', mappedStepList)

  return (
    <div
      className="relative overflow-hidden min-h-screen flex items-center justify-center"
      style={
        {
          '--color-primary-ornament': primaryColor,
        } as React.CSSProperties
      }
    >
      <div
        className={`bg-primary-ornament transition-all duration-500 absolute ${
          generationMethod === null
            ? 'top-0 left-[50%] -translate-x-1/2 -translate-y-[80%]'
            : generationMethod === 'random'
            ? 'top-0 left-[100%] -translate-x-1/2 -translate-y-1/2'
            : 'top-0 left-0 -translate-x-1/2 -translate-y-1/2'
        } w-[max(75vh,75vh)] h-[max(75vh,75vh)] rounded-full z-0 blur-[90px]`}
      ></div>
      <ResponsiveLayout
        primaryContent={
          <div ref={parentDivRef} className="w-full rounded z-10 relative overflow-visible">
            <div
              ref={aliasStepRef}
              className={`xl:max-h-[60vh] overflow-y-auto duration-300 absolute w-full top-1/2 -translate-y-1/2 left-0 transition-all ${
                step === 'alias' ? 'opacity-100 xl:scale-100' : 'opacity-0 xl:scale-125 pointer-events-none'
              }`}
            >
              <AliasStep
                alias={watch('signatureAlias')}
                setAlias={(value) => setValue('signatureAlias', value)}
              />
            </div>
            <div
              ref={branchStepRef}
              className={`xl:max-h-[60vh] overflow-y-auto duration-300 absolute w-full top-1/2 -translate-y-1/2 left-0 transition-all ${
                step === 'branch' ? 'opacity-100 xl:scale-100' : 'opacity-0 xl:scale-125 pointer-events-none'
              }`}
            >
              <BranchStep
                generationMethod={generationMethod}
                toggleGenerationMethod={toggleGenerationMethod}
              />
            </div>
            <div
              ref={passwordStepRef}
              className={`xl:max-h-[60vh] overflow-y-auto duration-300 absolute w-full top-1/2 -translate-y-1/2 left-0 transition-all ${
                step === 'password'
                  ? 'opacity-100 xl:scale-100'
                  : 'opacity-0 xl:scale-125 pointer-events-none'
              }`}
            >
              <PasswordStep
                password={watch('password')}
                setPassword={(value) => setValue('password', value)}
                passwordError={errors.password?.message}
              />
            </div>
            <div
              ref={passphraseStepRef}
              className={`xl:max-h-[60vh] overflow-y-auto duration-300 absolute w-full top-1/2 -translate-y-1/2 left-0 transition-all ${
                step === 'passphrase'
                  ? 'opacity-100 xl:scale-100'
                  : 'opacity-0 xl:scale-125 pointer-events-none'
              }`}
            >
              <PassphraseStep
                passphrase={watch('passphrase')}
                setPassphrase={(value) => setValue('passphrase', value)}
                passphraseError={errors.passphrase?.message}
              />
            </div>
            <div
              ref={generateStepRef}
              className={`xl:max-h-[60vh] overflow-y-auto duration-300 absolute w-full top-1/2 -translate-y-1/2 left-0 transition-all ${
                step === 'generate'
                  ? 'opacity-100 xl:scale-100'
                  : 'opacity-0 xl:scale-125 pointer-events-none'
              }`}
            >
              <GenerateStep
                formData={watch()}
                handleInputChange={(e) => setValue(e.target.id as keyof FormData, e.target.value)}
              />
            </div>

            <div
              ref={publicStepRef}
              className={`xl:max-h-[60vh] overflow-y-auto duration-300 absolute w-full top-1/2 -translate-y-1/2 left-0 transition-all ${
                step === 'public' ? 'opacity-100 xl:scale-100' : 'opacity-0 xl:scale-125 pointer-events-none'
              }`}
            >
              <PublicKeyStep
                publicKey={publicKey}
                alias={watch('signatureAlias')}
                onKeyCopied={() => setWasKeyCopied(true)}
                showCopyReminder={!wasKeyCopied}
              />
            </div>

            <div
              ref={privateStepRef}
              className={`xl:max-h-[60vh] overflow-y-auto duration-300 absolute w-full top-1/2 -translate-y-1/2 left-0 transition-all ${
                step === 'private' ? 'opacity-100 xl:scale-100' : 'opacity-0 xl:scale-125 pointer-events-none'
              }`}
            >
              <PrivateKeyStep privateKey={privateKey} onKeyDownloaded={() => setWasKeyDownloaded(true)} />
            </div>

            <div
              ref={confirmationStepRef}
              className={`xl:max-h-[60vh] overflow-y-auto duration-300 absolute w-full top-1/2 -translate-y-1/2 left-0 transition-all ${
                step === 'confirmation'
                  ? 'opacity-100 xl:scale-100'
                  : 'opacity-0 xl:scale-125 pointer-events-none'
              }`}
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">{translationsObject[currentLanguage].wellDone}</h2>
                <p className="text-lg mb-4">{translationsObject[currentLanguage].wellDoneDescription}</p>
              </div>
            </div>
          </div>
        }
        secondaryContent={
          <div className="w-full rounded z-10">
            {step === 'branch' && (
              <div>
                <div className="mb-4">
                  <p
                    className="font-semibold transition-all text-lg"
                    style={{
                      color: 'rgb(var(--color-primary-ornament))',
                    }}
                  >
                    {translationsObject[currentLanguage].secondaryContent.branch.title}
                  </p>
                </div>
                <p className="text-gray-500 mb-4">
                  {translationsObject[currentLanguage].secondaryContent.branch.description}
                </p>
              </div>
            )}

            {step === 'generate' && (
              <div>
                <div className="mb-4">
                  <p
                    className="font-semibold transition-all text-lg"
                    style={{
                      color: 'rgb(var(--color-primary-ornament))',
                    }}
                  >
                    {translationsObject[currentLanguage].secondaryContent.generate.title}
                  </p>
                </div>
                <p className="text-gray-500 mb-4">
                  {translationsObject[currentLanguage].secondaryContent.generate.description}
                </p>
              </div>
            )}

            {step === 'public' && (
              <div>
                <div className="mb-4">
                  <p
                    className="font-semibold transition-all text-lg"
                    style={{
                      color: 'rgb(var(--color-primary-ornament))',
                    }}
                  >
                    {translationsObject[currentLanguage].secondaryContent.public.title}
                  </p>
                </div>
                <p className="text-gray-500 mb-4">
                  {translationsObject[currentLanguage].secondaryContent.public.description}
                </p>
              </div>
            )}

            {step === 'private' && (
              <div>
                <div className="mb-4">
                  <p
                    className="font-semibold transition-all text-lg"
                    style={{
                      color: 'rgb(var(--color-primary-ornament))',
                    }}
                  >
                    {translationsObject[currentLanguage].secondaryContent.private.title}
                  </p>
                </div>
                <p className="text-gray-500 mb-4">
                  {translationsObject[currentLanguage].secondaryContent.private.description}
                </p>
              </div>
            )}
            {/* 
            {step === "confirmation" && (
              <div>
                <div className="mb-4">
                  <p
                    className="font-semibold transition-all text-lg"
                    style={{
                      color: "rgb(var(--color-primary-ornament))",
                    }}
                  >
                    {translationsObject[currentLanguage].steps.copyConfirmationCode}
                  </p>
                </div>
                <p className="text-gray-500 mb-4">
                  {translationsObject[currentLanguage].confirmationCodeDescription}
                </p>
              </div>
            )} */}

            {step === 'alias' && (
              <div>
                <div className="mb-4">
                  <p
                    className="font-semibold transition-all text-lg"
                    style={{
                      color: 'rgb(var(--color-primary-ornament))',
                    }}
                  >
                    {translationsObject[currentLanguage].secondaryContent.alias.title}
                  </p>
                </div>
                <p className="text-gray-500 mb-4">
                  {translationsObject[currentLanguage].secondaryContent.alias.description}
                </p>
              </div>
            )}

            {step === 'password' && (
              <div>
                <div className="mb-4">
                  <p
                    className="font-semibold transition-all text-lg"
                    style={{
                      color: 'rgb(var(--color-primary-ornament))',
                    }}
                  >
                    {translationsObject[currentLanguage].secondaryContent.password.title}
                  </p>
                </div>
                <p className="text-gray-500 mb-4">
                  {translationsObject[currentLanguage].secondaryContent.password.description}
                </p>
              </div>
            )}

            {step === 'passphrase' && (
              <div>
                <div className="mb-4">
                  <p
                    className="font-semibold transition-all text-lg"
                    style={{
                      color: 'rgb(var(--color-primary-ornament))',
                    }}
                  >
                    {translationsObject[currentLanguage].secondaryContent.passphrase.title}
                  </p>
                </div>
                <p className="text-gray-500 mb-4">
                  {translationsObject[currentLanguage].secondaryContent.passphrase.description}
                </p>
              </div>
            )}
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
        navigation={
          <div className="flex justify-center w-full gap-2 pt-2">
            {step !== 'branch' && (
              <button
                onClick={goBack}
                className="h-12 w-12 rounded-full flex items-center justify-center transition-all border-primary-ornament border-2 text-primary-ornament hover:bg-primary-ornament hover:text-white hover:opacity-90 active:opacity-80 disabled:opacity-30 disabled:pointer-events-none"
                disabled={loading}
              >
                <Icon icon="fluent:play-32-filled" className="transform rotate-180" />
              </button>
            )}
            {step !== 'confirmation' && (
              <button
                onClick={goToNextStep}
                className="text-white h-12 w-12 rounded-full flex items-center justify-center transition-all bg-primary-ornament hover:opacity-90 active:opacity-80 disabled:opacity-30 disabled:pointer-events-none"
                disabled={
                  loading ||
                  (step === 'alias' && !watch('signatureAlias')?.trim()?.length) ||
                  (step === 'branch' && generationMethod === null) ||
                  (step === 'password' && watch('password').trim() === '') ||
                  (step === 'passphrase' && watch('passphrase').trim().split(/\s+/).length !== 10) ||
                  (step === 'public' && !wasKeyCopied) ||
                  (step === 'private' && !wasKeyDownloaded)
                }
              >
                {loading ? (
                  <Icon icon="svg-spinners:pulse-rings-multiple" className="w-10 h-10" />
                ) : (
                  <Icon icon="fluent:play-32-filled" />
                )}
              </button>
            )}
          </div>
        }
      />
    </div>
  )
}
