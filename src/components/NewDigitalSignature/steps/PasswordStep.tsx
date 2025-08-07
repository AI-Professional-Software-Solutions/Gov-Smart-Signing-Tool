import React, { useEffect, useMemo, useState } from 'react'
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

type Lang = keyof typeof translationsObject

export const validatePassword = (password: string, lang: Lang): string | null => {
  const t = translationsObject[lang]
  if (password.length < 8) return t.minLength
  if (!/[A-Z]/.test(password)) return t.uppercase
  if (!/[0-9]/.test(password)) return t.number
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return t.specialChar
  return null
}

export const getPasswordRequirements = (password: string) => ({
  minLength: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  number: /[0-9]/.test(password),
  specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
})

interface PasswordStepProps {
  password: string
  setPassword: (p: string) => void
  passwordError?: string | null
}

const PasswordStep: React.FC<PasswordStepProps> = ({ password, setPassword, passwordError: parentError }) => {
  const lang = useCurrentLanguage() as Lang
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    setLocalError(validatePassword(password, lang))
  }, [password, lang])

  const errorToShow = parentError ?? localError

  const req = useMemo(() => getPasswordRequirements(password), [password])

  const t = translationsObject[lang]

  return (
    <div>
      <div className="mb-4 transition-all duration-300 ease-in-out">
        <FormInput
          label={t.passwordLabel}
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errorToShow ?? undefined}
          type="password"
          placeholder={t.passwordPlaceholder}
        />
      </div>

      <p className="font-medium mb-2">{t.passwordRequirements}</p>
      <ul className="space-y-1 text-sm">
        <li className={req.minLength ? 'text-green-600' : 'text-gray-500'}>{t.minLength}</li>
        <li className={req.uppercase ? 'text-green-600' : 'text-gray-500'}>{t.uppercase}</li>
        <li className={req.number ? 'text-green-600' : 'text-gray-500'}>{t.number}</li>
        <li className={req.specialChar ? 'text-green-600' : 'text-gray-500'}>{t.specialChar}</li>
      </ul>
    </div>
  )
}

export default PasswordStep
