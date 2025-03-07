import React from "react";
import { FormInput } from "../../FormInput";
import useCurrentLanguage from "../../../hooks/useCurrentLanguage";

const translationsObject = {
  en: {
    aliasLabel: "Signature Name",
    aliasPlaceholder: "Enter signature name here",
  },
  ro: {
    aliasLabel: "Nume semnătură",
    aliasPlaceholder: "Introduceți numele semnăturii aici",
  },
} as const;

interface AliasStepProps {
  alias: string;
  setAlias: (alias: string) => void;
  aliasError?: string;
}

const AliasStep: React.FC<AliasStepProps> = ({ alias, setAlias, aliasError }) => {
  const currentLanguage = useCurrentLanguage();

  return (
    <div>
      <div
        className={`mb-4 transition-all duration-300 ease-in-out xl:max-h-screen opacity-100 overflow-hidden`}
        id="aliasContainer"
      >
        <FormInput
          label={translationsObject[currentLanguage].aliasLabel}
          id="alias"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          error={aliasError}
          placeholder={translationsObject[currentLanguage].aliasPlaceholder}
          type="text"
        />
      </div>
    </div>
  );
};

export default AliasStep;
