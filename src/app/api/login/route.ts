import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    const response = NextResponse.json({ message: 'Logged in successfully.', userId: user.id }, { status: 200 });
    const session = await getSession(req, response);
    session.userId = user.id;
    await session.save();

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Something went wrong.' }, { status: 500 });
  }
}