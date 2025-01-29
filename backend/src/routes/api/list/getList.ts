import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import auth from '../../../middlewares/auth';
import prisma from '../../../../prisma/prismaClient';

interface CustomFastifyRequest extends FastifyRequest { userId?: string; }

export const getLists = (server: FastifyInstance) => {
    server.get('/lists', { preHandler: auth }, async (req: CustomFastifyRequest, res: FastifyReply) => {
        try {
            const findList = await prisma.list.findMany({
                where: {
                    referenceUser: { id: req.userId }
                }
            })
            return res.send({ status: 201, message: `List found successfully!`, Lista: findList});
        } catch (error) {
            return res.status(500).send({ error: error });
        }
    });
};

export default getLists;
