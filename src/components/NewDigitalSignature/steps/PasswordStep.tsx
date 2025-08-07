import React from 'react'
import { FormInput } from '../../FormInput'
import useCurrentLanguage from '../../../hooks/useCurrentLanguage'

const translationsObject = {
  en: {
    brainwallet: 'Brainwallet',
    random: 'Random',
    passphraseWords: 'Passphrase words*',
    wordPlaceholder: 'Word',
    passwordLabel: 'Password*',
    passwordPlaceholder: 'Enter password here...',
    passwordRequirements: 'Password requirements:',
    minLength: 'At least 8 characters',
    uppercase: 'At least one uppercase letter',
    number: 'At least one number',
    specialChar: 'At least one special character (!@#$%^&*(),.?":{}|<>)',
  },
  ro: {
    brainwallet: 'Brainwallet',
    random: 'Aleatoriu',
    passphraseWords: 'Cuvinte parolă*',
    wordPlaceholder: 'Cuvânt',
    passwordLabel: 'Parolă*',
    passwordPlaceholder: 'Introduceți parola aici...',
    passwordRequirements: 'Cerințe parolă:',
    minLength: 'Cel puțin 8 caractere',
    uppercase: 'Cel puțin o literă mare',
    number: 'Cel puțin o cifră',
    specialChar: 'Cel puțin un caracter special (!@#$%^&*(),.?":{}|<>)',
  },
} as const

interface BranchStepProps {
  password: string
  setPassword: (password: string) => void
  passwordError?: string
}

// Password validation function
const validatePassword = (password: string) => {
  const errors = []

  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }

  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number'
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character'
  }

  return null
}

// Password requirement checker
const getPasswordRequirements = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }
}

const PasswordStep: React.FC<BranchStepProps> = ({ password, setPassword, passwordError }) => {
  const currentLanguage = useCurrentLanguage()

  return (
    <div>
      <div
        className={`mb-4 transition-all duration-300 ease-in-out xl:max-h-screen opacity-100 overflow-hidden`}
        id="passwordContainer"
      >
        <FormInput
          label={translationsObject[currentLanguage].passwordLabel}
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError}
          type="password"
          placeholder={translationsObject[currentLanguage].passwordPlaceholder}
        />
      </div>
    </div>
  )
}

export default PasswordStep
