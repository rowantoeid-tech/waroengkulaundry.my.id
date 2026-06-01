import type { FastifyPluginAsync } from 'fastify';
import { Prisma } from '@prisma/client';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';

function decimalToNumber(value: Prisma.Decimal | number): number {
  return typeof value === 'number' ? value : value.toNumber();
}

async function resolveBranchId(branchId?: string): Promise<string | null> {
  if (branchId) {
    const branch = await prisma.branch.findFirst({
      where: { id: branchId, isActive: true },
      select: { id: true },
    });
    return branch?.id ?? null;
  }
  const branch = await prisma.branch.findFirst({
    where: { isActive: true },
    orderBy: { code: 'asc' },
    select: { id: true },
  });
  return branch?.id ?? null;
}

export const catalogRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: { branch_id?: string } }>(
    '/api/catalog/products',
    async (request, reply) => {
      if (!env.DATABASE_URL) {
        return reply.status(503).send({
          error: 'database_not_configured',
          message: 'Set DATABASE_URL di .env dan jalankan database/schema.sql',
        });
      }

      const branchId = await resolveBranchId(request.query.branch_id);
      if (!branchId) {
        return reply.status(404).send({
          error: 'branch_not_found',
          message: 'Tidak ada cabang aktif. Jalankan database/seed.example.sql',
        });
      }

      const products = await prisma.product.findMany({
        where: { isActive: true },
        include: {
          category: true,
          stocks: { where: { branchId } },
        },
        orderBy: { name: 'asc' },
      });

      return {
        branchId,
        items: products.map((p) => {
          const stock = p.stocks[0];
          const qty = stock ? decimalToNumber(stock.quantity) : 0;
          return {
            id: p.id,
            sku: p.sku,
            name: p.name,
            category: p.category?.name ?? 'Lainnya',
            unit: p.unit,
            price: decimalToNumber(p.sellPrice),
            stock: qty,
            badge: qty <= 0 ? ('habis' as const) : undefined,
          };
        }),
      };
    },
  );

  app.get('/api/catalog/laundry-services', async (_request, reply) => {
    if (!env.DATABASE_URL) {
      return reply.status(503).send({
        error: 'database_not_configured',
        message: 'Set DATABASE_URL di .env dan jalankan database/schema.sql',
      });
    }

    const services = await prisma.laundryService.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return {
      items: services.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        unit: s.unit,
        price: decimalToNumber(s.basePrice),
        estimatedHours: s.estimatedHours ?? 24,
        highlight: s.code === 'EXPRESS' ? 'Express' : undefined,
      })),
    };
  });
};
