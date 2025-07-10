"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

export default function ProposalForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    website: '',
    problem: '',
    solution: '',
    scope: '',
    cost: '',
    howSoon: '',
  });
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState('');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (response && response.pdfBase64) {
      const binaryString = atob(response.pdfBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      setPdfBlobUrl(URL.createObjectURL(blob));
    }

    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [response, pdfBlobUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResponse(null);

    try {
      const res = await fetch('/api/submit-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.message || 'Failed to submit proposal.');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 transition-colors duration-300">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Proposal Generator</h1>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link href="/proposals" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105">
            View Proposals
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-4xl mx-auto transform transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Submit New Proposal</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {!response ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">First Name</label>
              <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 transition-all duration-200" required />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Last Name</label>
              <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 transition-all duration-200" required />
            </div>
            <div>
              <label htmlFor="companyName" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Company Name</label>
              <input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 transition-all duration-200" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 transition-all duration-200" required />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="website" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Website</label>
              <input type="url" id="website" name="website" value={formData.website} onChange={handleChange} className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 transition-all duration-200" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="problem" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Problem</label>
              <textarea id="problem" name="problem" value={formData.problem} onChange={handleChange} rows={4} className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 transition-all duration-200" required></textarea>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="solution" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Solution</label>
              <textarea id="solution" name="solution" value={formData.solution} onChange={handleChange} rows={4} className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 transition-all duration-200" required></textarea>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="scope" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Scope</label>
              <textarea id="scope" name="scope" value={formData.scope} onChange={handleChange} rows={4} className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 transition-all duration-200" required></textarea>
            </div>
            <div>
              <label htmlFor="cost" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Cost</label>
              <input type="text" id="cost" name="cost" value={formData.cost} onChange={handleChange} className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 transition-all duration-200" required />
            </div>
            <div>
              <label htmlFor="howSoon" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">How Soon</label>
              <input type="text" id="howSoon" name="howSoon" value={formData.howSoon} onChange={handleChange} className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 transition-all duration-200" required />
            </div>
            <div className="md:col-span-2 flex justify-center">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
              >
                Generate Proposal
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Proposal Generated!</h2>
            {pdfBlobUrl && (
              <a
                href={pdfBlobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mr-4 shadow-md transition-all duration-200 transform hover:scale-105"
                download="proposal.pdf"
              >
                Download PDF
              </a>
            )}
            {/* PPTX download would be handled similarly if n8n returns pptxBase64 */}
            {!pdfBlobUrl && (
              <p className="text-gray-700 dark:text-gray-300">No download links or binary data provided by the webhook.</p>
            )}
            <button
              onClick={() => {
                setResponse(null);
                setPdfBlobUrl(null);
              }}
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
            >
              Submit Another Proposal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}