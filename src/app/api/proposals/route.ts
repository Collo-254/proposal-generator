import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const response = new NextResponse();
  const session = await getSession(req, response);
  const { userId } = session;

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const proposals = await prisma.proposal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        companyName: true,
        problem: true,
        solution: true,
        createdAt: true,
        proposalUrl: true,
      },
    });
    return NextResponse.json(proposals, { status: 200 });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json({ message: 'Something went wrong.' }, { status: 500 });
  }
}
