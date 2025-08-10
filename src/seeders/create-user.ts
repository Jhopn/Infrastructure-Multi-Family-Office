import { prisma } from 'connection/prisma';
import bcrypt from 'bcryptjs';

async function createDefaultAdvisor() {
    const ADVISOR_EMAIL = process.env.ADVISOR_EMAIL || "advisor@example.com";
    const ADVISOR_PASSWORD = process.env.ADVISOR_PASSWORD || "advisorpassword";

    try {
        const advisorRole = await prisma.access.findUnique({
            where: { name: 'advisor' },
        });

        if (!advisorRole) {
            console.error("Erro: A role 'advisor' não foi encontrada. Execute o seeder de roles primeiro.");
            return;
        }

        const existingAdvisor = await prisma.user.findUnique({
            where: { email: ADVISOR_EMAIL },
        });

        if (existingAdvisor) {
            console.warn(`Usuário advisor com o e-mail '${ADVISOR_EMAIL}' já existe.`);
            return;
        }

        const passwordHash = await bcrypt.hash(ADVISOR_PASSWORD, 10);

        await prisma.user.create({
            data: {
                email: ADVISOR_EMAIL,
                passwordHash: passwordHash,
                UserAccess: {
                    create: {
                        accessId: advisorRole.id, 
                    },
                },
            },
        });

        console.log(`Usuário advisor '${ADVISOR_EMAIL}' criado com sucesso!`);

    } catch (error) {
        console.error('Erro ao criar o usuário advisor padrão:', error);
    } finally {
        await prisma.$disconnect();
    }
}

void createDefaultAdvisor();
