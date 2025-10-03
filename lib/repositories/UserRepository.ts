import { prisma } from '@/lib/db/prisma';
import { User, UserRole } from '@prisma/client';

export class UserRepository {
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: { credentials: true },
    });
  }

  async findById(id: number) {
    return await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async create(userData: { email: string; name?: string | null; role: UserRole }) {
    return await prisma.user.create({
      data: userData,
    });
  }

  async createCredential(credentialData: {
    userId: number;
    provider: string;
    identifier: string;
    secret: string;
  }) {
    return await prisma.authCredential.create({
      data: credentialData,
    });
  }

  async findCredentialsByUserId(userId: number) {
    return await prisma.authCredential.findMany({
      where: { userId },
    });
  }
}

export const userRepository = new UserRepository();
