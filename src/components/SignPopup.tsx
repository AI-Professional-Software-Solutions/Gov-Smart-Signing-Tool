import React, { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Icon } from '@iconify/react/dist/iconify.js'
import { FormInput } from './FormInput'
import govSmartLogo from '../assets/GovSmart_Logo_Black.svg'

const SignPopup = () => {
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await invoke('complete_signing', { pin })
      window.close()
    } catch (err) {
      console.error('Error invoking complete_signing:', err)
      setError((err as unknown as Error).toString())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center"
      style={
        {
          '--color-primary-ornament': '147 51 234',
        } as React.CSSProperties
      }
    >
      <div className="bg-primary-ornament transition-all duration-500 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[max(75vh,75vh)] h-[max(75vh,75vh)] rounded-full z-0 blur-[90px]"></div>

      <img src={govSmartLogo} alt="GovSmart Logo" className="w-80 h-44 z-20 opacity-90 mb-10" />

      <div
        className="relative backdrop-blur-md p-8 rounded-3xl drop-shadow-md w-[36rem] z-10"
        style={{
          background:
            'radial-gradient(circle at top left, rgba(233, 213, 255, 0.5), transparent 30%), radial-gradient(circle at bottom right, rgba(233, 213, 255, 0.5), transparent 30%), linear-gradient(to bottom right, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
        }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-purple-800">Sign Document</h2>

        {error && (
          <div className="text-red-500 text-center mb-4">
            <Icon icon="mdi:alert-circle" className="inline-block mr-2 h-5 w-5" />
            {error.toString()}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormInput
            id="pin"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter PIN"
            label="Enter your PIN"
          />

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              disabled={loading || !pin}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow hover:shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Icon icon="svg-spinners:180-ring" className="animate-spin h-5 w-5" />
                  Signing...
                </>
              ) : (
                <>
                  <Icon icon="mdi:file-sign" className="h-5 w-5" />
                  Sign Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignPopup
