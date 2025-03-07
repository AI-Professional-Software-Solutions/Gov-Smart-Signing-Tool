import React from "react";
import { FormInput } from "../../FormInput";
import useCurrentLanguage from "../../../hooks/useCurrentLanguage";

const translationsObject = {
  en: {
    commonName: "Common Name",
    countryName: "Country Name",
    stateOrProvince: "State or Province",
    localityName: "Locality Name",
    organizationName: "Organization Name",
    organizationalUnitName: "Organizational Unit Name",
  },
  ro: {
    commonName: "Nume Comun",
    countryName: "Numele Țării",
    stateOrProvince: "Stat sau Provincie",
    localityName: "Nume Localitate",
    organizationName: "Nume Organizație",
    organizationalUnitName: "Nume Unitate Organizațională",
  },
};

interface GenerateStepProps {
  formData: {
    commonName: string;
    countryName: string;
    stateOrProvince: string;
    localityName: string;
    organizationName: string;
    organizationalUnitName: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const GenerateStep: React.FC<GenerateStepProps> = ({ formData, handleInputChange }) => {
  const currentLanguage = useCurrentLanguage();

  return (
    <div>
      <form id="keypairForm">
        {(
          [
            "commonName",
            "countryName",
            "stateOrProvince",
            "localityName",
            "organizationName",
            "organizationalUnitName",
          ] as const
        ).map((field) => (
          <FormInput
            key={field}
            label={translationsObject[currentLanguage][field]}
            id={field}
            value={formData[field as keyof typeof formData]}
            onChange={handleInputChange}
            type="text"
            placeholder={translationsObject[currentLanguage][field]}
          />
        ))}
      </form>
    </div>
  );
};

export default GenerateStep;
