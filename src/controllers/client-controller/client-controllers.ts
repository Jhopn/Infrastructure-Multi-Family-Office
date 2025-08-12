import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from '../../connection/prisma';
import { z } from 'zod';
import { createClientSchema, updateClientSchema } from "./dto/client.dto";
import { uuidParamSchema } from "common/dto/param.dto";
import { paginationSchema } from "common/dto/pagination.dto";

export const createClient = async (request: FastifyRequest<{ Body: z.infer<typeof createClientSchema> }>, reply: FastifyReply) => {
    try {
        const client = await prisma.client.create({
            data: request.body,
        });
        return reply.code(201).send(client);
    } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            return reply.code(409).send({ error: 'A client with this email already exists.' });
        }
        console.error("Error creating client:", error);
        return reply.code(400).send({ error: 'Error creating client.' });
    }
};

export const getClients = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const clients = await prisma.client.findMany();
        return reply.code(200).send(clients);
    } catch (error) {
        console.error("Error fetching clients:", error);
        return reply.code(400).send({ error: 'Error fetching clients.' });
    }
};


export const getClientById = async (request: FastifyRequest<{ Params: z.infer<typeof uuidParamSchema> }>, reply: FastifyReply) => {
    try {
        const { id } = request.params;
        const client = await prisma.client.findUnique({
            where: { id },
        });

        if (!client) {
            return reply.code(404).send({ error: "Client not found." });
        }
        return reply.code(200).send(client);
    } catch (error) {
        console.error("Error fetching client:", error);
        return reply.code(400).send({ error: 'Error fetching client.' });
    }
};

export const updateClient = async (request: FastifyRequest<{ Body: z.infer<typeof updateClientSchema>, Params: z.infer<typeof uuidParamSchema> }>, reply: FastifyReply) => {
    try {
        const { id } = request.params;
        const updatedClient = await prisma.client.update({
            where: { id },
            data: request.body,
        });
        return reply.code(200).send(updatedClient);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return reply.code(404).send({ error: 'Client not found.' });
        }
        console.error("Error updating client:", error);
        return reply.code(400).send({ error: 'Error updating client.' });
    }
};

export const deleteClient = async (request: FastifyRequest<{ Params: z.infer<typeof uuidParamSchema> }>, reply: FastifyReply) => {
    try {
        const { id } = request.params;
        await prisma.client.delete({ where: { id } });
        return reply.code(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            return reply.code(404).send({ error: 'Client not found.' });
        }
        console.error("Error deleting client:", error);
        return reply.code(400).send({ error: 'Error deleting client.' });
    }
};

export const getClientsTable = async (request: FastifyRequest<{ Querystring: z.infer<typeof paginationSchema> }>, reply: FastifyReply) => {
    try {
        const { page = 1, pageSize = 10 } = request.query;
        const offset = (page - 1) * pageSize;

        const [clients, totalItems] = await prisma.$transaction([
            prisma.client.findMany({
                skip: offset,
                take: pageSize,
                select: {
                    id: true,
                    name: true,
                    netWorths: {
                        orderBy: { date: 'desc' },
                        take: 1,
                        select: { value: true, date: true }
                    }
                },
                orderBy: { name: 'asc' }
            }),
            prisma.client.count()
        ]);

        const responseData = {
            data: clients.map(c => ({
                id: c.id,
                name: c.name,
                patrimony: c.netWorths[0]?.value ?? 0,
                lastUpdate: c.netWorths[0]?.date ?? null
            })),
            meta: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / pageSize),
                itemsPerPage: pageSize,
                totalItems
            }
        };

        return reply.code(200).send(responseData);
    } catch (error) {
        console.error("Erro ao buscar dados da tabela de clientes:", error);
        return reply.code(400).send({ message: 'Erro ao buscar dados da tabela de clientes.' });
    }
};

export const getClientsPlanningDistribution = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const clients = await prisma.client.findMany({
            select: {
                wallets: { select: { assetClass: true, percentage: true } },
                idealWallets: { select: { assetClass: true, targetPct: true } }
            }
        });

        let distribution = { above90: 0, between90and70: 0, between70and50: 0, below50: 0 };

        clients.forEach(client => {
            if (client.idealWallets.length === 0) return;

            const diffs = client.idealWallets.map(ideal => {
                const current = client.wallets.find(w => w.assetClass === ideal.assetClass);
                return Math.abs((current?.percentage ?? 0) - ideal.targetPct);
            });

            const avgMisalignment = diffs.reduce((a, b) => a + b, 0) / diffs.length;
            const alignmentScore = 100 - avgMisalignment;

            if (alignmentScore > 90) distribution.above90++;
            else if (alignmentScore >= 70) distribution.between90and70++;
            else if (alignmentScore >= 50) distribution.between70and50++;
            else distribution.below50++;
        });

        const total = clients.length || 1;
        const responseData = [
            { label: 'Superior a 90%', percentage: Math.round((distribution.above90 / total) * 100) },
            { label: '90% a 70%', percentage: Math.round((distribution.between90and70 / total) * 100) },
            { label: '70% a 50%', percentage: Math.round((distribution.between70and50 / total) * 100) },
            { label: 'Inferior a 50%', percentage: Math.round((distribution.below50 / total) * 100) }
        ];

        return reply.code(200).send(responseData);
    } catch (error) {
        console.error("Erro ao calcular distribuição de planejamento:", error);
        return reply.code(400).send({ message: 'Erro ao calcular distribuição de planejamento.' });
    }
};

export const getClientsPlanningSummary = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const clients = await prisma.client.findMany({
            where: { idealWallets: { some: {} } },
            select: {
                wallets: { select: { percentage: true, assetClass: true } },
                idealWallets: { select: { assetClass: true, targetPct: true } },
            }
        });

        if (clients.length === 0) {
            return reply.code(200).send({ percentage: 0, clientCount: 0 });
        }

        let totalAlignment = 0;
        clients.forEach(client => {
            const diffs = client.idealWallets.map(ideal => {
                const current = client.wallets.find(w => w.assetClass === ideal.assetClass);
                return Math.abs((current?.percentage ?? 0) - ideal.targetPct);
            });
            const avgMisalignment = diffs.reduce((a, b) => a + b, 0) / diffs.length;
            totalAlignment += (100 - avgMisalignment);
        });

        const responseData = {
            percentage: Math.round(totalAlignment / clients.length),
            clientCount: clients.length
        };

        return reply.code(200).send(responseData);
    } catch (error) {
        console.error("Erro ao buscar resumo de planejamento:", error);
        return reply.code(400).send({ message: 'Erro ao buscar resumo de planejamento.' });
    }
};

export const getFamilyProfileSummary = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const profiles = [
            { label: "Com filho", dbValue: "with_children" },
            { label: "Solteiro", dbValue: "single" },
            { label: "Com dependentes", dbValue: "with_dependents" }
        ];

        const totalClients = await prisma.client.count();
        if (totalClients === 0) {
            return reply.code(200).send(profiles.map(p => ({ ...p, percentage: 0 })));
        }

        const profileCounts = await prisma.client.groupBy({
            by: ['familyProfile'],
            _count: { _all: true },
        });

        const countsMap = new Map(profileCounts.map(p => [p.familyProfile, p._count._all]));

        const responseData = profiles.map(({ label, dbValue }) => {
            const count = countsMap.get(dbValue as any) ?? 0;
            return {
                label,
                percentage: Math.round((count / totalClients) * 100)
            };
        });

        return reply.code(200).send(responseData);
    } catch (error) {
        console.error("Erro ao buscar resumo de perfil familiar:", error);
        return reply.code(400).send({ message: 'Erro ao buscar resumo de perfil familiar.' });
    }
};