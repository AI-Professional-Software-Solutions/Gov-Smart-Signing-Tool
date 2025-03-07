import React from "react";
import useCurrentLanguage from "../hooks/useCurrentLanguage";

const translationsObject = {
  en: {
    notSupported: "Resolution not supported. Please maximize your browser window or zoom out.",
  },
  ro: {
    notSupported:
      "Rezoluție nesuportată. Vă rugăm să maximizați fereastra browserului sau să micșorați.",
  },
};

interface ResponsiveLayoutProps {
  primaryContent: React.ReactNode;
  secondaryContent: React.ReactNode;
  navigation: React.ReactNode;
  progressBar: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  primaryContent,
  secondaryContent,
  navigation,
  progressBar,
}) => {
  const currentLanguage = useCurrentLanguage();

  return (
    <div>
      <div className="hidden xl:flex flex-col items-center justify-between w-full h-auto xl:max-w-7xl min-h-screen xl:w-screen">
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-[2.5fr_1px_1fr] gap-8 items-center justify-center w-full xl:gap-8 xl:pt-32">
          <div className="max-w-full xl:max-w-full flex flex-col items-center justify-center w-full xl:w-full xl:min-w-[66%] xl:max-h-[70vh] p-8 overflow-auto xl:overflow-visible">
            {primaryContent}
            <div className="block xl:hidden">{navigation}</div>
          </div>
          <div className="hidden xl:block w-[1px] max-w-[1px] h-full bg-gray-300 flex-1 min-h-[20vh] max-h-[20vh] min-w-[1px]"></div>
          <div className="xl:hidden w-full flex items-center justify-center">
            <div className="block xl:hidden w-[40vw] max-w-[40vw] h-[1px] max-h-[1px] bg-gray-300 flex-1 min-w-[40vw] min-h-[1px]"></div>
          </div>
          <div className="max-w-full xl:max-w-full flex text-center xl:text-start flex-col items-center xl:items-start justify-center w-full xl:w-auto xl:max-h-[70vh] p-8 overflow-y-auto">
            <div>{secondaryContent}</div>
            <div className="hidden xl:block">{navigation}</div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full max-w-3xl xl:max-w-7xl px-8 pb-24 pt-6">
          {progressBar}
        </div>
      </div>
      <div className="xl:hidden">{translationsObject[currentLanguage].notSupported}</div>
    </div>
  );
};
