import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateTokens, TokenPayload } from '../utils/jwt';

const prisma = new PrismaClient();

export class AuthService {
    async register(data: any) {
        const { username, email, password, firstName, lastName } = data;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            throw new Error('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                firstName,
                lastName,
                groupId: 2, // Default to staff
            },
            include: {
                group: true,
            },
        });

        const tokens = generateTokens({
            id: user.id,
            email: user.email,
            role: user.group.name,
        });

        return { user, tokens };
    }

    async login(data: any) {
        const { email, password } = data;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { group: true },
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: {
                lastLogin: new Date(),
            },
        });

        const tokens = generateTokens({
            id: user.id,
            email: user.email,
            role: user.group.name,
        });

        return { user, tokens };
    }
}
