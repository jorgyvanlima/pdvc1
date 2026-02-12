import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seeding...');

    // 1. Create Groups
    const adminGroup = await prisma.userGroup.upsert({
        where: { name: 'admin' },
        update: {},
        create: {
            name: 'admin',
            description: 'Administrator with full access',
        },
    });

    const salesGroup = await prisma.userGroup.upsert({
        where: { name: 'sales' },
        update: {},
        create: {
            name: 'sales',
            description: 'Sales staff with limited access',
        },
    });

    console.log('✅ Groups created');

    // 2. Create Admin User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt); // Default password

    const admin = await prisma.user.upsert({
        where: { email: 'admin@pdvweb.com' },
        update: {},
        create: {
            username: 'admin',
            email: 'admin@pdvweb.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            active: true,
            groupId: adminGroup.id,
        },
    });

    console.log('✅ Admin user created: admin@pdvweb.com / 123456');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
