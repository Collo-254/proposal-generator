import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

// Helper function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function POST(req: NextRequest) {
  const response = new NextResponse();
  const session = await getSession(req, response);
  const { userId } = session;

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  const formData = await req.json();
  const { firstName, lastName, companyName, email, website, problem, solution, scope, cost, howSoon } = formData;

  if (!firstName || !lastName || !companyName || !email || !problem || !solution || !scope || !cost || !howSoon) {
    return NextResponse.json({ message: 'All form fields are required.' }, { status: 400 });
  }

  try {
    // Send form data to n8n webhook
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL; // Make sure to set this in your .env file

    if (!n8nWebhookUrl) {
      console.warn('N8N_WEBHOOK_URL is not set in environment variables. Skipping webhook call.');
      return NextResponse.json({ message: 'Proposal saved, but webhook call skipped.', proposalId: '' }, { status: 200 });
    }

    const webhookResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...formData, userId }),
    });

    if (!webhookResponse.ok) {
      console.error('N8n webhook call failed:', webhookResponse.status, webhookResponse.statusText);
      return NextResponse.json({ message: 'Proposal saved, but webhook call failed.' }, { status: 500 });
    }

    const contentType = webhookResponse.headers.get('Content-Type');
    let pdfBase64: string | undefined;
    let proposalUrl: string | undefined;

    if (contentType && contentType.includes('application/json')) {
      const webhookData = await webhookResponse.json();
      pdfBase64 = webhookData.pdfBase64;
      proposalUrl = webhookData.pdfUrl || webhookData.pptxUrl; // Assuming n8n returns pdfUrl or pptxUrl
    } else if (contentType && contentType.includes('application/pdf')) {
      const arrayBuffer = await webhookResponse.arrayBuffer();
      pdfBase64 = arrayBufferToBase64(arrayBuffer);
      // If n8n returns binary PDF directly, it won't provide a URL in the same response.
      // You might need a separate mechanism to get the URL if it's stored externally.
    } else {
      console.warn('N8n webhook did not return expected content type. Content-Type:', contentType);
    }

    // Save form data to Neon database
    const proposal = await prisma.proposal.create({
      data: {
        firstName,
        lastName,
        companyName,
        email,
        website,
        problem,
        solution,
        scope,
        cost,
        howSoon,
        userId,
        proposalUrl, // Save the URL here
      },
    });

    return NextResponse.json({ message: 'Proposal submitted successfully.', proposalId: proposal.id, pdfBase64, proposalUrl }, { status: 200 });
  } catch (error) {
    console.error('Proposal submission error:', error);
    return NextResponse.json({ message: 'Something went wrong during proposal submission.' }, { status: 500 });
  }
}
