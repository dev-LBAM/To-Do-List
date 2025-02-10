import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import auth from '../../../middlewares/auth';
import prisma from '../../../../prisma/prismaClient';

interface CustomFastifyRequest extends FastifyRequest { userId?: string; }

export const createList = (server: FastifyInstance) => {
    server.post('/list/create', { preHandler: auth }, async (req: CustomFastifyRequest, res: FastifyReply) => {
        try {
          const { titleList } = req.body as any;

                const newList = await prisma.list.create({
                  data: {
                    title: titleList,
                    referenceUser: { connect: { id: req.userId } },
                  }
                });
            return res.send({ status: 201, message: `List create successfully!`, Lista: newList});
        } catch (error) {
            return res.status(500).send({ error: error });
        }
    });
};

export default createList;
