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
  passphrase: string;
  setPassphrase: (passphrase: string) => void;
  passphraseError?: string;
}

const PasswordStep: React.FC<BranchStepProps> = ({
  passphrase,
  setPassphrase,
  passphraseError,
}) => {
  const currentLanguage = useCurrentLanguage();

  const passphraseArray = passphrase.split(" ");

  const handlePassphraseChange = (index: number, value: string) => {
    const updatedPassphraseArray = [...passphraseArray];
    updatedPassphraseArray[index] = value;
    setPassphrase(updatedPassphraseArray.join(" "));
  };

  return (
    <div>
      <div
        className={`mb-4 transition-all duration-300 ease-in-out xl:max-h-screen opacity-100 overflow-hidden`}
        id="passphraseContainer"
      >
        <label htmlFor="passphrase" className="block mb-2 text-md font-medium text-gray-900">
          {translationsObject[currentLanguage].passphraseWords}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
          {passphraseArray.map((word, index) => (
            <FormInput
              key={index}
              id={`word-${index}`}
              value={word}
              onChange={(e) => handlePassphraseChange(index, e.target.value)}
              type="text"
              placeholder={`${translationsObject[currentLanguage].wordPlaceholder} ${index + 1}`}
            />
          ))}
        </div>
        {passphraseError && <div className="error-text">{passphraseError}</div>}
      </div>
    </div>
  );
};

export default PasswordStep;
