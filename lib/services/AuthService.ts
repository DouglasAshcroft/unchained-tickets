import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '@/lib/repositories/UserRepository';

interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface TokenPayload {
  sub: number;
  email: string;
  role: string;
}

export class AuthService {
  private jwtSecret: string;

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error(
        '🔒 JWT_SECRET environment variable is required and must be at least 32 characters.\n' +
        '   Generate a secure secret with: openssl rand -base64 32'
      );
    }
    this.jwtSecret = secret;
  }

  async register(userData: RegisterData) {
    const { email, password, name } = userData;

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await userRepository.create({
      email,
      name: name || null,
      role: 'fan',
    });

    await userRepository.createCredential({
      userId: user.id,
      provider: 'password',
      identifier: email,
      secret: hashedPassword,
    });

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(credentials: LoginData) {
    const { email, password } = credentials;

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const credential = user.credentials.find((c) => c.provider === 'password');
    if (!credential?.secret) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, credential.secret);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async getUserById(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  generateToken(user: { id: number; email: string; role: string }) {
    return jwt.sign({ sub: user.id, email: user.email, role: user.role }, this.jwtSecret, {
      expiresIn: '7d',
    });
  }

  verifyToken(token: string): TokenPayload {
    const payload = jwt.verify(token, this.jwtSecret);
    if (typeof payload === 'string') {
      throw new Error('Invalid token format');
    }
    if (!payload.sub || !payload.email) {
      throw new Error('Invalid token payload');
    }
    return payload as unknown as TokenPayload;
  }
}

export const authService = new AuthService();
