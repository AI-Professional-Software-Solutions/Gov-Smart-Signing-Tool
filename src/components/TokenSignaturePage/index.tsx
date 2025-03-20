import React, { useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import govSmartLogo from '../../assets/GovSmart_Logo_Black.svg'
import useCurrentLanguage from '../../hooks/useCurrentLanguage'
import { TokenSearch } from './TokenSearch'
import { TokenSignatureTool } from './TokenSignatureTool'

const translationsObject = {
  en: {
    searchToken: 'Search for Token',
    signDocument: 'Sign Document',
    govSmartSignatureTool:
      'The Gov-Smart Token Signature Tool allows you to sign documents using hardware security tokens. This advanced security method provides enhanced protection and compliance with the highest security standards. Search for available tokens, select the certificate you want to use, and sign your documents securely.',
  },
  ro: {
    searchToken: 'Căutare Token',
    signDocument: 'Semnează Document',
    govSmartSignatureTool:
      'Instrumentul de Semnătură cu Token Gov-Smart vă permite să semnați documente folosind token-uri hardware de securitate. Această metodă avansată de securitate oferă protecție îmbunătățită și conformitate cu cele mai înalte standarde de securitate. Căutați token-urile disponibile, selectați certificatul pe care doriți să îl utilizați și semnați documentele în siguranță.',
  },
}

type ToolType = 'search-token' | 'sign-document'

export const TokenSignaturePage: React.FC<{
  onBack: () => void
}> = ({ onBack }) => {
  const currentLanguage = useCurrentLanguage()

  const [primaryColor, setPrimaryColor] = useState('107 114 128')
  const [selectedComponent, setSelectedComponent] = useState<ToolType | null>(null)
  const [hoveredComponent, setHoveredComponent] = useState<ToolType | null>(null)

  const handleButtonClick = (component: ToolType | null) => {
    setSelectedComponent(component)
  }

  const handleButtonHover = (component: ToolType | null) => {
    setHoveredComponent(component)
  }

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen min-w-screen bg-white xl:overflow-hidden overflow-x-hidden"
      style={
        {
          '--color-primary-ornament': primaryColor,
        } as React.CSSProperties
      }
    >
      <div
        className={`${
          selectedComponent !== null ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'
        } duration-500 transition-all absolute top-14 left-1/2 -translate-x-1/2 z-50 hidden xl:flex drop-shadow-3xl rounded-3xl overflow-hidden items-center justify-center`}
      >
        <button
          onClick={() => handleButtonClick(null)}
          className="w-auto flex items-center justify-center transition-all duration-500 px-4 py-2 mr-2 gap-1 font-semibold h-12 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          <Icon icon="mdi:arrow-left" className="h-5 w-5" />
          Back
        </button>
        <button
          onClick={() => handleButtonClick('search-token')}
          className={`w-auto flex items-center justify-center transition-all duration-500 rounded-l-lg pl-6 pr-4 py-2 rounded-r-none gap-1 font-semibold h-12 ${
            selectedComponent === 'search-token' ? 'bg-purple-700 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          <Icon icon="mdi:security-network" className="h-7 w-7 opacity-70" />
          {translationsObject[currentLanguage].searchToken}
        </button>
        <button
          onClick={() => handleButtonClick('sign-document')}
          className={`w-auto flex items-center justify-center transition-all duration-500 pr-6 pl-4 py-2 rounded-l-none gap-1 font-semibold h-12 ${
            selectedComponent === 'sign-document' ? 'bg-purple-700 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          <Icon icon="hugeicons:blockchain-06" className="h-8 w-8" />
          {translationsObject[currentLanguage].signDocument}
        </button>
      </div>

      <div
        className={`transition-all absolute top-0 w-[max(75vh,75vh)] h-[max(75vh,75vh)] -translate-y-1/2 -translate-x-1/2 rounded-full blur-[100px] opacity-100 ${
          hoveredComponent === 'search-token'
            ? 'left-0 bg-purple-600'
            : hoveredComponent === 'sign-document'
            ? 'left-full bg-purple-600'
            : 'left-1/2 bg-indigo-950/30'
        } pointer-events-none duration-700`}
      ></div>

      <div
        className={`flex flex-col items-center ${
          selectedComponent === null ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
        }`}
      >
        <img src={govSmartLogo} alt="GovSmart Logo" className="w-96 h-56 z-20 opacity-90 mb-10" />

        <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:gap-8">
          <div
            onMouseEnter={() => handleButtonHover('search-token')}
            onMouseLeave={() => handleButtonHover(null)}
            onClick={() => handleButtonClick('search-token')}
            className="group overflow-hidden relative p-4 backdrop-blur-sm rounded-3xl cursor-pointer transition-all duration-300 w-96 h-64 flex items-center justify-center active:scale-105 border border-purple-800/20 drop-shadow-sm hover:scale-105 bg-white/50"
          >
            <Icon
              icon="mdi:card-search"
              className="absolute top-3 right-3 text-purple-800 h-20 w-20 opacity-90"
            />
            <Icon
              icon="mdi:card-search"
              className="absolute -top-1/2 -right-1/2 text-purple-500 h-96 w-80 blur-3xl group-hover:h-[30rem] group-hover:w-[30rem] transition-all duration-1000 group-hover:-top-1/2 group-hover:-right-1/2 opacity-100"
            />
            <h2 className="z-10 text-3xl font-semibold text-center transition-all">
              {translationsObject[currentLanguage].searchToken}
            </h2>
          </div>
          <div
            onMouseEnter={() => handleButtonHover('sign-document')}
            onMouseLeave={() => handleButtonHover(null)}
            onClick={() => handleButtonClick('sign-document')}
            className="group overflow-hidden relative p-4 backdrop-blur-sm rounded-3xl cursor-pointer transition duration-300 w-96 h-64 flex items-center justify-center active:scale-105 border border-purple-800/20 drop-shadow-sm hover:scale-105 bg-white/50"
          >
            <Icon
              icon="mdi:file-sign"
              className="absolute bottom-3 left-3 text-purple-800 h-20 w-20 opacity-90"
            />
            <Icon
              icon="mdi:file-sign"
              className="absolute -bottom-1/2 -left-1/2 text-purple-600 h-96 w-80 blur-3xl group-hover:h-[30rem] group-hover:w-[30rem] transition-all duration-1000 group-hover:-bottom-1/2 group-hover:-left-1/2 opacity-90"
            />
            <h2 className="z-10 text-3xl font-semibold text-center transition-all">
              {translationsObject[currentLanguage].signDocument}
            </h2>
          </div>
        </div>

        <button
          onClick={() => onBack()}
          className="w-auto mt-8 flex items-center justify-center transition-all duration-500 px-4 py-2 mr-2 gap-1 font-semibold h-12 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200"
        >
          <Icon icon="mdi:arrow-left" className="h-5 w-5" />
          Back
        </button>

        <p className="max-w-2xl mt-8 text-sm text-center opacity-80">
          {translationsObject[currentLanguage].govSmartSignatureTool}
        </p>
      </div>
      <div
        className={`${
          selectedComponent !== null &&
          selectedComponent !== 'search-token' &&
          selectedComponent !== 'sign-document'
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-0 pointer-events-none'
        } duration-500 transition-all absolute top-14 left-1/2 -translate-x-1/2 z-50 hidden xl:flex drop-shadow-3xl rounded-3xl overflow-hidden items-center justify-center`}
      >
        <button
          onClick={() => handleButtonClick(null)}
          className="w-auto flex items-center justify-center transition-all duration-500 px-4 py-2 mr-2 gap-1 font-semibold h-12 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          <Icon icon="mdi:arrow-left" className="h-5 w-5" />
          Back
        </button>
        <button
          onClick={() => handleButtonClick('search-token')}
          className={`w-auto flex items-center justify-center transition-all duration-500 pl-6 pr-4 py-2 rounded-r-none gap-1 font-semibold h-12 ${
            selectedComponent === 'search-token' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          <Icon icon="mdi:card-search" className="h-7 w-7 opacity-70" />
          {translationsObject[currentLanguage].searchToken}
        </button>
        <button
          onClick={() => handleButtonClick('sign-document')}
          className={`w-auto flex items-center justify-center transition-all duration-500 pr-6 pl-4 py-2 rounded-l-none gap-1 font-semibold h-12 ${
            selectedComponent === 'sign-document' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          <Icon icon="mdi:file-sign" className="h-8 w-8" />
          {translationsObject[currentLanguage].signDocument}
        </button>
      </div>

      <div
        className={`absolute bg-white min-h-screen min-w-screen transition-all duration-500 top-0 left-0 w-full ${
          selectedComponent === 'search-token'
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-125 pointer-events-none'
        }`}
      >
        <TokenSearch onPrimaryColorChange={setPrimaryColor} />
      </div>

      <div
        className={`absolute bg-white min-h-screen min-w-screen transition-all duration-500 top-0 left-0 w-full ${
          selectedComponent === 'sign-document'
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-125 pointer-events-none'
        }`}
      >
        <TokenSignatureTool />
      </div>
    </div>
  )
}
