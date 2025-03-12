import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

const CertPopup = () => {
  const [selectedCert, setSelectedCert] = useState<string>('');
  const [certs, setCerts] = useState<Array<{ id: string; label: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  // Parse the certificates passed as a query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const certsParam = params.get('certs');
    if (certsParam) {
      try {
        const parsedCerts = JSON.parse(decodeURIComponent(certsParam));
        setCerts(parsedCerts);
        if (parsedCerts.length > 0) {
          setSelectedCert(parsedCerts[0].id);
        }
      } catch (e) {
        console.error('Failed to parse certificates:', e);
        setError('Failed to load certificate list.');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await invoke('complete_certificate', { certId: selectedCert });
      window.close();
    } catch (err) {
      console.error('Error invoking complete_certificate:', err);
      setError((err as string).toString());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Select a Certificate</h2>
        {error && <div className="mb-4 text-red-500">{error.toString()}</div>}
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 font-medium">Choose your certificate:</label>
          <select
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            value={selectedCert}
            onChange={(e) => setSelectedCert(e.target.value)}
          >
            {certs.map((cert) => (
              <option key={cert.id} value={cert.id}>
                {cert.label}
              </option>
            ))}
          </select>
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
