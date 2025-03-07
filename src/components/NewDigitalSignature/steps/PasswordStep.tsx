import React from "react";
import { FormInput } from "../../FormInput";
import useCurrentLanguage from "../../../hooks/useCurrentLanguage";

const translationsObject = {
  en: {
    brainwallet: "Brainwallet",
    random: "Random",
    passphraseWords: "Passphrase words*",
    wordPlaceholder: "Word",
    passwordLabel: "Password*",
    passwordPlaceholder: "Enter password here...",
  },
  ro: {
    brainwallet: "Brainwallet",
    random: "Aleatoriu",
    passphraseWords: "Cuvinte parolă*",
    wordPlaceholder: "Cuvânt",
    passwordLabel: "Parolă*",
    passwordPlaceholder: "Introduceți parola aici...",
  },
} as const;

interface BranchStepProps {
  password: string;
  setPassword: (password: string) => void;
  passwordError?: string;
}

const PasswordStep: React.FC<BranchStepProps> = ({ password, setPassword, passwordError }) => {
  const currentLanguage = useCurrentLanguage();

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
  );
};

export default PasswordStep;
