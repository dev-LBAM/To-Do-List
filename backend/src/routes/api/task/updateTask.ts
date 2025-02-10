import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import auth from '../../../middlewares/auth'
import prisma from '../../../../prisma/prismaClient'


//SCHEMA TO USERID
interface CustomFastifyRequest extends FastifyRequest { userId?: string }

export const updateTask = (server: FastifyInstance) => {
    server.put('/task/update/:taskId', { preHandler: auth }, async (req: CustomFastifyRequest, res: FastifyReply) => {
        try {
          
          const { taskId } : { taskId: string} = req.params as any
          const { newContent, content } : {newContent: string, content: string} = req.body as any

          await prisma.contentList.updateMany({
            where: {
                id: taskId,
                description: content
            },
            data: {
              description: newContent,
              LastUpdate: new Date(),
            },
          })

            return res.send({ status: 201, message: `Task modify successfully!` })
        } catch (error) {
            return res.status(500).send({ error: error })
        }
    })
}

export default updateTask

