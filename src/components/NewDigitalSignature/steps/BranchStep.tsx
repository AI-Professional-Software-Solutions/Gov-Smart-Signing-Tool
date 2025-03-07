import React from "react";
import { ThreeStateCard } from "../../ThreeSateCard";
import useCurrentLanguage from "../../../hooks/useCurrentLanguage";

const translationsObject = {
  en: {
    brainwallet: "Brain Wallet",
    random: "Locally Stored File",
    brainwalletDescription: (
      <>
        A <b>Brain Wallet</b> lets you generate and access your electronic signature with a
        passphrase you create and remember. This secure method stores your signature only in your
        mind, making it ideal for users who prefer not to store files on their devices.
      </>
    ),
    randomDescription: (
      <>
        A <b>Locally Stored File</b> saves your electronic signature securely on your device,
        keeping it encrypted and fully under your control. Ideal for users who prioritize local
        protection of their digital assets.
      </>
    ),
  },
  ro: {
    brainwallet: "Brain Wallet",
    random: "Fișier stocat local",
    brainwalletDescription: (
      <>
        Un <b>Brain Wallet</b> îți permite să generezi și să accesezi semnătura electronică cu o
        frază secretă pe care o creezi și o ții minte. Această metodă sigură îți stochează semnătura
        doar în minte, fiind ideală pentru utilizatorii care preferă să nu stocheze fișiere pe
        dispozitivele lor.
      </>
    ),
    randomDescription: (
      <>
        Un <b>Fișier Stocat Local</b> salvează semnătura electronică în siguranță pe dispozitivul
        tău, menținând-o criptată și complet sub controlul tău. Ideal pentru utilizatorii care
        prioritizează protecția locală a activelor lor digitale.
      </>
    ),
  },
} as const;

interface BranchStepProps {
  generationMethod: "brainwallet" | "random" | null;
  toggleGenerationMethod: (method: "brainwallet" | "random" | null) => void;
}

const BranchStep: React.FC<BranchStepProps> = ({ generationMethod, toggleGenerationMethod }) => {
  const currentLanguage = useCurrentLanguage();
  return (
    <div>
      <div className="toggle-container mb-6">
        <ThreeStateCard<"brainwallet" | "random">
          initialState={generationMethod}
          leftValue="brainwallet"
          leftLabel={translationsObject[currentLanguage].brainwallet}
          leftIcon="solar:wallet-bold"
          rightValue="random"
          rightLabel={translationsObject[currentLanguage].random}
          rightIcon="gravity-ui:circles-5-random"
          onStateChange={toggleGenerationMethod}
          leftDescription={
            <p className="opacity-80 text-balance">
              {translationsObject[currentLanguage].brainwalletDescription}
            </p>
          }
          rightDescription={
            <p className="opacity-80 text-balance">
              {translationsObject[currentLanguage].randomDescription}
            </p>
          }
        />
      </div>
    </div>
  );
};

export default BranchStep;
