import bcrypt from 'bcrypt';
import { prisma } from '../config/db';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';

const SALT_ROUNDS = 12;

export async function register(email: string, password: string, name: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already in use') as Error & { status: number };
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
    select: { id: true, email: true, name: true, isAdmin: true },
  });

  return user;
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Invalid email or password') as Error & { status: number };
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error('Invalid email or password') as Error & { status: number };
    err.status = 401;
    throw err;
  }

  const stravaConnection = await prisma.stravaConnection.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  const payload = { sub: user.id, isAdmin: user.isAdmin };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      isAdmin: user.isAdmin,
      stravaConnected: !!stravaConnection,
    },
  };
}

export async function refresh(token: string) {
  let payload: { sub: string; isAdmin: boolean };
  try {
    payload = verifyRefreshToken(token);
  } catch {
    const err = new Error('Invalid refresh token') as Error & { status: number };
    err.status = 401;
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    const err = new Error('User not found') as Error & { status: number };
    err.status = 401;
    throw err;
  }

  const newPayload = { sub: user.id, isAdmin: user.isAdmin };
  return {
    accessToken: signAccessToken(newPayload),
    refreshToken: signRefreshToken(newPayload),
  };
}
