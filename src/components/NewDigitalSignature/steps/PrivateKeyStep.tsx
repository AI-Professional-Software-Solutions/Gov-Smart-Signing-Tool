import React from "react";
import { Icon } from "@iconify/react";
import useCurrentLanguage from "../../../hooks/useCurrentLanguage";

const translationsObject = {
  en: {
    privateKeyLabel: "Private Key (PKCS12)",
    downloadButtonLabel: "Download Private Key",
    downloadDescription:
      "Download the private key to use it in the Gov-Smart platform. Save the file in a secure location and do not share it with others.",
  },
  ro: {
    privateKeyLabel: "Cheie Privată (PKCS12)",
    downloadButtonLabel: "Descarcă Cheie Privată",
    downloadDescription:
      "Descarcă cheia privată pentru a o folosi în platforma Gov-Smart. Salvează fișierul într-un loc sigur și nu îl distribui altor persoane.",
  },
};

interface PrivateKeyStepProps {
  privateKey: string;
  onKeyDownloaded: () => void;
}

const PrivateKeyStep: React.FC<PrivateKeyStepProps> = ({ privateKey, onKeyDownloaded }) => {
  const currentLanguage = useCurrentLanguage();

  const handleDownload = () => {
    const element = document.createElement("a");
    element.setAttribute("href", `data:application/x-pkcs12-file;base64,${btoa(privateKey)}`);
    element.setAttribute("download", "privateKey.p12");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onKeyDownloaded();
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <button
        onClick={handleDownload}
        className="group transition-all flex items-center bg-gray-50 text-white hover:bg-primary-ornament/5 focus:outline-none focus:bg-primary-ornament/10 focus:ring-0 h-64 w-full rounded-3xl border justify-center gap-4 p-16 border-primary-ornament/40 overflow-hidden"
      >
        <div className="flex items-center justify-center gap-4 group-hover:scale-[1.03] transition-all duration-300">
          <Icon
            icon="hugeicons:download-square-02"
            className="mr-2 text-primary-ornament h-36 w-36"
          />
          <div className="text-primary-ornament text-start flex flex-col gap-1.5">
            <span className="font-semibold text-2xl">
              {translationsObject[currentLanguage].downloadButtonLabel}
            </span>
            <p className="text-gray-400 text-sm leading-tight">
              {translationsObject[currentLanguage].downloadDescription}
            </p>
          </div>
        </div>
      </button>
    </div>
  );
};

export default PrivateKeyStep;
