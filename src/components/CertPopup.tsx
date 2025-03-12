import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

const CertPopup = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await invoke('complete_certificate', { pin });
      window.close();
    } catch (err) {
      console.error('Error invoking complete_certificate:', err);
      setError((err as unknown as Error).toString());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Please enter your pin for the token</h2>
        {error && <div className="mb-4 text-red-500">{error.toString()}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default CertPopup;
