"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

interface ProposalSummary {
  id: string;
  companyName: string;
  problem: string;
  solution: string;
  createdAt: string;
  proposalUrl?: string;
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<ProposalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await fetch('/api/proposals');
        if (res.ok) {
          const data = await res.json();
          setProposals(data);
        } else if (res.status === 401) {
          router.push('/'); // Redirect to login if unauthorized
        } else {
          setError('Failed to fetch proposals.');
        }
      } catch (err) {
        console.error(err);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/logout');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <p className="text-gray-700 dark:text-gray-300">Loading proposals...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 transition-colors duration-300">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Your Proposals</h1>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link href="/proposal" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105">
            New Proposal
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
          >
            Logout
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {proposals.length === 0 ? (
        <p className="text-center text-gray-700 dark:text-gray-300">No proposals generated yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105">
              <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{proposal.companyName}</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Problem:</strong> {proposal.problem.substring(0, 100)}...</p>
              <p className="text-gray-700 dark:text-gray-300 mb-4"><strong>Solution:</strong> {proposal.solution.substring(0, 100)}...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Generated on: {new Date(proposal.createdAt).toLocaleDateString()}</p>
              {proposal.proposalUrl && (
                <a
                  href={proposal.proposalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                >
                  View Proposal
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
