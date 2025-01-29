import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import auth from '../../../middlewares/auth'
import prisma from '../../../../prisma/prismaClient'

//SCHEMA TO USERID
interface CustomFastifyRequest extends FastifyRequest { userId?: string }

export const deleteTask = (server: FastifyInstance) => {
    server.delete('/tasks/:taskId/delete', { preHandler: auth }, async (req: CustomFastifyRequest, res: FastifyReply) => {
        try {
            const { taskId } = req.params as any

            const delList = await prisma.contentList.delete({
                where:{id:taskId}
              })

            return res.send({ status: 400, message: `List deleted successfully!`, Content: delList})
        } catch (error) {
            return res.status(500).send({ error: error })
        }
    })
}

export default deleteTask