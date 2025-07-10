import { getIronSession, IronSessionData } from 'iron-session';
import { NextApiRequest, NextApiResponse } from 'next';

declare module 'iron-session' {
  interface IronSessionData {
    userId?: string;
  }
}

export const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: 'proposal-generator-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

// Helper to get session in API routes
export async function getSession(req: NextApiRequest, res: NextApiResponse) {
  return getIronSession<IronSessionData>(req, res, sessionOptions);
}
