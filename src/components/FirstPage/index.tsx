import React, { useState } from "react";
import { NewDigitalSignature } from "../NewDigitalSignature";
import { Icon } from "@iconify/react/dist/iconify.js";
import SignatureTool from "../SignatureTool";
import govSmartLogo from "../../assets/GovSmart_Logo_Black.svg";
import useCurrentLanguage from "../../hooks/useCurrentLanguage";

const translationsObject = {
  en: {
    newDigitalSignature: "Generate digital signature",
    signatureTool: "Sign Document",
    govSmartSignatureTool:
      "The Gov-Smart Signature Tool empowers you to take full control of your electronic signature. Whether you need to generate a new electronic signature or sign important documents, this user-friendly tool provides top-tier security and flexibility. Generate your unique signature locally on your device, ensuring your private key stays fully under your control. When signing documents, the tool seamlessly integrates with the Gov-Smart platform, allowing you to apply your secure signature with confidence and ease. Protect your digital transactions and maintain full ownership of your electronic identity with the Gov-Smart Signature Tool.",
  },
  ro: {
    newDigitalSignature: "Generează semnătură digitală",
    signatureTool: "Semnează Document",
    govSmartSignatureTool:
      "Instrumentul de semnătură Gov-Smart îți oferă control deplin asupra semnăturii tale electronice. Fie că ai nevoie să generezi o nouă semnătură electronică sau să semnezi documente importante, acest instrument ușor de utilizat oferă securitate și flexibilitate de top. Generează-ți semnătura unică local pe dispozitivul tău, asigurându-te că cheia privată rămâne complet sub controlul tău. La semnarea documentelor, instrumentul se integrează perfect cu platforma Gov-Smart, permițându-ți să aplici semnătura ta securizată cu încredere și ușurință. Protejează-ți tranzacțiile digitale și menține controlul total asupra identității tale electronice cu Instrumentul de Semnătură Gov-Smart.",
  },
};

type ToolType = "new-signature" | "signature-tool";

export const FirstPage: React.FC = () => {
  const currentLanguage = useCurrentLanguage();

  const [primaryColor, setPrimaryColor] = useState("107 114 128");
  const [selectedComponent, setSelectedComponent] = useState<ToolType | null>(null);
  const [hoveredComponent, setHoveredComponent] = useState<ToolType | null>(null);

  const handleButtonClick = (component: ToolType | null) => {
    setSelectedComponent(component);
  };

  const handleButtonHover = (component: ToolType | null) => {
    setHoveredComponent(component);
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen min-w-screen bg-white xl:overflow-hidden overflow-x-hidden"
      style={
        {
          "--color-primary-ornament": primaryColor,
        } as React.CSSProperties
      }
    >
      <div
        className={`transition-all absolute top-0 w-[max(75vh,75vh)] h-[max(75vh,75vh)] -translate-y-1/2 -translate-x-1/2 rounded-full blur-[100px] opacity-100 ${
          hoveredComponent === "new-signature"
            ? "left-0 bg-blue-600"
            : hoveredComponent === "signature-tool"
              ? "left-full bg-green-600"
              : "left-1/2 bg-indigo-950/30"
        } pointer-events-none duration-700`}
      ></div>

      <div
        className={`flex flex-col items-center ${
          selectedComponent === null
            ? "opacity-100 scale-100"
            : "opacity-0 scale-90 pointer-events-none"
        }`}
      >
        <img src={govSmartLogo} alt="GovSmart Logo" className="w-96 h-56 z-20 opacity-90 mb-10" />

        <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:gap-8">
          <div
            onMouseEnter={() => handleButtonHover("new-signature")}
            onMouseLeave={() => handleButtonHover(null)}
            onClick={() => handleButtonClick("new-signature")}
            className="group overflow-hidden relative p-4 backdrop-blur-sm rounded-3xl cursor-pointer transition-all duration-300 w-96 h-64 flex items-center justify-center active:scale-105 border border-blue-800/20 drop-shadow-sm hover:scale-105 bg-white/50"
          >
            <Icon
              icon="fluent:signature-16-regular"
              className="absolute top-3 right-3 text-blue-800 h-20 w-20 opacity-90"
            />
            <Icon
              icon="fluent:signature-16-regular"
              className="absolute -top-1/2 -right-1/2 text-blue-500 h-96 w-80 blur-3xl group-hover:h-[30rem] group-hover:w-[30rem] transition-all duration-1000 group-hover:-top-1/2 group-hover:-right-1/2 opacity-100"
            />
            <h2 className="z-10 text-3xl font-semibold text-center transition-all">
              {translationsObject[currentLanguage].newDigitalSignature}
            </h2>
          </div>
          <div
            onMouseEnter={() => handleButtonHover("signature-tool")}
            onMouseLeave={() => handleButtonHover(null)}
            onClick={() => handleButtonClick("signature-tool")}
            className="group overflow-hidden relative p-4 backdrop-blur-sm rounded-3xl cursor-pointer transition duration-300 w-96 h-64 flex items-center justify-center active:scale-105 border border-green-800/20 drop-shadow-sm hover:scale-105 bg-white/50"
          >
            <Icon
              icon="bitcoin-icons:sign-outline"
              className="absolute bottom-0 left-0 text-green-800 h-28 w-28 opacity-90"
            />
            <Icon
              icon="bitcoin-icons:sign-outline"
              className="absolute -bottom-1/2 -left-1/2 text-green-600 h-96 w-80 blur-3xl group-hover:h-[30rem] group-hover:w-[30rem] transition-all duration-1000 group-hover:-bottom-1/2 group-hover:-left-1/2 opacity-90"
            />
            <h2 className="z-10 text-3xl font-semibold text-center transition-all">
              {translationsObject[currentLanguage].signatureTool}
            </h2>
          </div>
        </div>
        <p className="max-w-2xl mt-16 text-sm text-center opacity-80">
          {translationsObject[currentLanguage].govSmartSignatureTool}
        </p>
      </div>
      <div
        className={`${
          selectedComponent !== null
            ? "opacity-100 scale-100"
            : "opacity-0 scale-0 pointer-events-none"
        } duration-500 transition-all absolute top-14 left-1/2 -translate-x-1/2 z-50 hidden xl:flex drop-shadow-3xl rounded-3xl overflow-hidden items-center justify-center`}
      >
        <button
          onClick={() => handleButtonClick("new-signature")}
          className={`w-auto flex items-center justify-center transition-all duration-500 pl-6 pr-4 py-2 rounded-r-none gap-1 font-semibold h-12 ${
            selectedComponent === "new-signature"
              ? "bg-primary-ornament text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          <Icon icon="fluent:signature-16-regular" className="h-7 w-7 opacity-70" />
          {translationsObject[currentLanguage].newDigitalSignature}
        </button>
        <button
          onClick={() => handleButtonClick("signature-tool")}
          className={`w-auto flex items-center justify-center transition-all duration-500 pr-6 pl-4 py-2 rounded-l-none gap-1 font-semibold h-12 ${
            selectedComponent === "signature-tool"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          <Icon icon="bitcoin-icons:sign-outline" className="h-8 w-8" />
          {translationsObject[currentLanguage].signatureTool}
        </button>
      </div>

      <div
        className={`absolute bg-white min-h-screen min-w-screen transition-all duration-500 top-0 left-0 w-full ${
          selectedComponent === "new-signature"
            ? "opacity-100 scale-100"
            : "opacity-0 scale-125 pointer-events-none"
        }`}
      >
        <NewDigitalSignature onPrimaryColorChange={setPrimaryColor} />
      </div>

      <div
        className={`absolute bg-white min-h-screen min-w-screen transition-all duration-500 top-0 left-0 w-full ${
          selectedComponent === "signature-tool"
            ? "opacity-100 scale-100"
            : "opacity-0 scale-125 pointer-events-none"
        }`}
      >
        <SignatureTool />
      </div>
    </div>
  );
};
