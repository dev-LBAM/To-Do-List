import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import auth from '../../../middlewares/auth'
import prisma from '../../../../prisma/prismaClient'

//SCHEMA TO USERID
interface CustomFastifyRequest extends FastifyRequest { userId?: string }

export const getTask = (server: FastifyInstance) => {
    server.get('/lists/:listId/tasks', { preHandler: auth }, async (req: CustomFastifyRequest, res: FastifyReply) => {
        try {
            const { listId } : { listId: string} = req.params as any

            const contentList = await prisma.contentList.findMany({
                where: {
                    listId: listId 
                }
            })

            return res.send({
                status: 201,
                message: `List of user found successfully!`,
                tasks: contentList, // Return description of first item
            })

        } catch (error) {
            return res.status(500).send({ error: error })
        }
    })
}

export default getTask
