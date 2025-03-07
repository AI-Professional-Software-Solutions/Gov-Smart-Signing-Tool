import React from "react";
import { ThreeStateCard } from "../../ThreeSateCard";
import useCurrentLanguage from "../../../hooks/useCurrentLanguage";

const translationsObject = {
  en: {
    storeSignatureInCloud: "Store Signature In Cloud",
    selfGenerateLocalSignature: "Self Generate Local Signature",
  },
  ro: {
    storeSignatureInCloud: "Stocați Semnătura În Cloud",
    selfGenerateLocalSignature: "Generați Singur Semnătura Locală",
  },
};

interface InitialStepProps {
  storage: "cloud" | "local" | null;
  toggleStorage: (storage: "cloud" | "local" | null) => void;
}

const InitialStep: React.FC<InitialStepProps> = ({ storage, toggleStorage }) => {
  const currentLanguage = useCurrentLanguage();

  return (
    <div>
      <div className="toggle-container mb-6">
        <ThreeStateCard<"cloud" | "local">
          initialState={storage}
          leftValue="cloud"
          leftLabel={translationsObject[currentLanguage].storeSignatureInCloud}
          leftIcon="ph:cloud-fill"
          rightValue="local"
          rightLabel={translationsObject[currentLanguage].selfGenerateLocalSignature}
          rightIcon="flowbite:lock-solid"
          onStateChange={toggleStorage}
        />
      </div>
    </div>
  );
};

export default InitialStep;
