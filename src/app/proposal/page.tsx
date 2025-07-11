"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ProposalPage() {
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
    <div className="w-full py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-extrabold">Proposal Generator</h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="outline" asChild>
              <Link href="/proposals">View Proposals</Link>
            </Button>
            <Button variant="destructive" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Submit New Proposal</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Fill out the form below to generate a new proposal.
            </p>
          </div>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {!response ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" placeholder="Enter your first name" value={formData.firstName} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" placeholder="Enter your last name" value={formData.lastName} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" name="companyName" placeholder="Enter your company name" value={formData.companyName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" placeholder="Enter your email" type="email" value={formData.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" placeholder="Enter your website" value={formData.website} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="problem">Problem</Label>
                <Textarea
                  className="min-h-[120px]"
                  id="problem"
                  name="problem"
                  placeholder="Describe the problem you are solving"
                  value={formData.problem}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="solution">Solution</Label>
                <Textarea
                  className="min-h-[120px]"
                  id="solution"
                  name="solution"
                  placeholder="Describe your proposed solution"
                  value={formData.solution}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scope">Scope</Label>
                <Textarea
                  className="min-h-[120px]"
                  id="scope"
                  name="scope"
                  placeholder="Outline the scope of the project"
                  value={formData.scope}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost</Label>
                  <Input id="cost" name="cost" placeholder="Enter the project cost" value={formData.cost} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="howSoon">How Soon</Label>
                  <Input id="howSoon" name="howSoon" placeholder="Enter the project timeline" value={formData.howSoon} onChange={handleChange} />
                </div>
              </div>
              <Button className="w-full" size="lg" type="submit">
                Generate Proposal
              </Button>
            </form>
          ) : (
            <div className="text-center">
              <h2 className="text-xl font-bold mb-4">Proposal Generated!</h2>
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
              {!pdfBlobUrl && (
                <p>No download links or binary data provided by the webhook.</p>
              )}
              <Button
                onClick={() => {
                  setResponse(null);
                  setPdfBlobUrl(null);
                }}
                className="mt-4"
              >
                Submit Another Proposal
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
