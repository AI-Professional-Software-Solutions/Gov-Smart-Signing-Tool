import React, { useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import govSmartLogo from '../../assets/GovSmart_Logo_Black.svg'
import useCurrentLanguage from '../../hooks/useCurrentLanguage'
import { FirstPage } from '../FirstPage'
import { TokenSignaturePage } from '../TokenSignaturePage'

const translationsObject = {
  en: {
    tokenSignature: 'Token signature',
    decentralisedSignature: 'Decentralised signature',
    govSmartSignatureTool:
      'The Gov-Smart Signature Tool empowers you to take full control of your electronic signature. Choose between token-based or decentralized signature methods to secure your documents with the highest level of security and flexibility.',
  },
  ro: {
    tokenSignature: 'Semnătură cu token',
    decentralisedSignature: 'Semnătură descentralizată',
    govSmartSignatureTool:
      'Instrumentul de semnătură Gov-Smart îți oferă control deplin asupra semnăturii tale electronice. Alege între metodele de semnătură bazate pe token sau descentralizate pentru a-ți securiza documentele cu cel mai înalt nivel de securitate și flexibilitate.',
  },
}

type SignatureType = 'token-signature' | 'decentralised-signature'

export const InitialScreen: React.FC = () => {
  const currentLanguage = useCurrentLanguage()

  const primaryColor = '107 114 128'
  const [selectedComponent, setSelectedComponent] = useState<SignatureType | null>(null)
  const [hoveredComponent, setHoveredComponent] = useState<SignatureType | null>(null)

  const handleButtonClick = (component: SignatureType | null) => {
    setSelectedComponent(component)
  }

  const handleButtonHover = (component: SignatureType | null) => {
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
        className={`transition-all absolute top-0 w-[max(75vh,75vh)] h-[max(75vh,75vh)] -translate-y-1/2 -translate-x-1/2 rounded-full blur-[100px] opacity-100 ${
          hoveredComponent === 'token-signature'
            ? 'left-0 bg-purple-600'
            : hoveredComponent === 'decentralised-signature'
            ? 'left-full bg-orange-600'
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
            onMouseEnter={() => handleButtonHover('token-signature')}
            onMouseLeave={() => handleButtonHover(null)}
            onClick={() => handleButtonClick('token-signature')}
            className="group overflow-hidden relative p-4 backdrop-blur-sm rounded-3xl cursor-pointer transition-all duration-300 w-96 h-64 flex items-center justify-center active:scale-105 border border-purple-800/20 drop-shadow-sm hover:scale-105 bg-white/50"
          >
            <Icon
              icon="mdi:security-network"
              className="absolute top-3 right-3 text-purple-800 h-20 w-20 opacity-90"
            />
            <Icon
              icon="mdi:security-network"
              className="absolute -top-1/2 -right-1/2 text-purple-500 h-96 w-80 blur-3xl group-hover:h-[30rem] group-hover:w-[30rem] transition-all duration-1000 group-hover:-top-1/2 group-hover:-right-1/2 opacity-100"
            />
            <h2 className="z-10 text-3xl font-semibold text-center transition-all">
              {translationsObject[currentLanguage].tokenSignature}
            </h2>
          </div>
          <div
            onMouseEnter={() => handleButtonHover('decentralised-signature')}
            onMouseLeave={() => handleButtonHover(null)}
            onClick={() => handleButtonClick('decentralised-signature')}
            className="group overflow-hidden relative p-4 backdrop-blur-sm rounded-3xl cursor-pointer transition duration-300 w-96 h-64 flex items-center justify-center active:scale-105 border border-orange-800/20 drop-shadow-sm hover:scale-105 bg-white/50"
          >
            <Icon
              icon="hugeicons:blockchain-06"
              className="absolute bottom-3 left-3 text-orange-800 h-20 w-20 opacity-90"
            />
            <Icon
              icon="hugeicons:blockchain-06"
              className="absolute -bottom-1/2 -left-1/2 text-orange-600 h-96 w-80 blur-3xl group-hover:h-[30rem] group-hover:w-[30rem] transition-all duration-1000 group-hover:-bottom-1/2 group-hover:-left-1/2 opacity-90"
            />
            <h2 className="z-10 text-3xl font-semibold text-center transition-all">
              {translationsObject[currentLanguage].decentralisedSignature}
            </h2>
          </div>
        </div>
        <p className="max-w-2xl mt-16 text-sm text-center opacity-80">
          {translationsObject[currentLanguage].govSmartSignatureTool}
        </p>
      </div>

      <div
        className={`absolute bg-white min-h-screen min-w-screen transition-all duration-500 top-0 left-0 w-full ${
          selectedComponent === 'token-signature'
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-125 pointer-events-none'
        }`}
      >
        <TokenSignaturePage onBack={() => setSelectedComponent(null)} />
      </div>

      <div
        className={`absolute bg-white min-h-screen min-w-screen transition-all duration-500 top-0 left-0 w-full ${
          selectedComponent === 'decentralised-signature'
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-125 pointer-events-none'
        }`}
      >
        <FirstPage onBack={() => setSelectedComponent(null)} />
      </div>
    </div>
  )
}
