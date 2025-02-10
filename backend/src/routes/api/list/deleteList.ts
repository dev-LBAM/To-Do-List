import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import auth from '../../../middlewares/auth';
import prisma from '../../../../prisma/prismaClient';

interface CustomFastifyRequest extends FastifyRequest { userId?: string; }

export const deleteList = (server: FastifyInstance) => {
    server.delete('/list/delete/:listId', { preHandler: auth }, async (req: CustomFastifyRequest, res: FastifyReply) => {
        try {
            console.log("chegou na rota de deletar lista")
            
            const { listId } = req.params as any;
            
            const delList = await prisma.list.delete({
                where: { id: listId }
              });

            return res.send({ status: 400, message: `List deleted sucessfully!`, Lista: delList});
        } catch (error) {
            return res.status(500).send({ error: error });
        }
    });
};

export default deleteList;