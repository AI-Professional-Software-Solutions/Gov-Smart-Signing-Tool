import React from "react";
import { FormInput } from "../../FormInput";
import useCurrentLanguage from "../../../hooks/useCurrentLanguage";
import forge from "node-forge";

const translationsObject = {
  en: {
    publicKeyLabel: "Public Key",
  },
  ro: {
    publicKeyLabel: "Cheie Publică",
  },
};

interface PublicKeyStepProps {
  publicKey: string;
  alias: string;
}

const PublicKeyStep: React.FC<PublicKeyStepProps> = ({ publicKey, alias }) => {
  const currentLanguage = useCurrentLanguage();

  const data = {
    publicKey,
    alias,
  } as const;

  const base64Data = btoa(JSON.stringify(data));
  const dataChecksum = forge.md.sha256.create().update(base64Data).digest().toHex();

  return (
    <div>
      <FormInput
        label={translationsObject[currentLanguage].publicKeyLabel}
        id="publicKey"
        value={`${base64Data}.${dataChecksum}`}
        type="textarea"
        readOnly
        minRows={10}
        maxRows={10}
        download
        copyToClipboard
        onDownload={(content) => {
          const element = document.createElement("a");
          element.setAttribute("href", `data:application/x-pem-file;base64,${btoa(content)}`);
          element.setAttribute("download", "publicKey.pem");
          element.style.display = "none";
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        }}
      />
    </div>
  );
};

export default PublicKeyStep;
