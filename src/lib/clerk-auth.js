import { Clerk } from '@clerk/clerk-sdk-node';

const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

export async function authenticateClerk(req) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return null;
    }
    
    const { userId } = await clerk.verifyToken(token);
    return userId;
  } catch (error) {
    console.error('Clerk authentication error:', error);
    return null;
  }
}

export { clerk };
