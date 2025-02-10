import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import auth from '../../../middlewares/auth'
import prisma from '../../../../prisma/prismaClient'

//SCHEMA TO USERID
interface CustomFastifyRequest extends FastifyRequest { userId?: string }

export const addTask = (server: FastifyInstance) => {
    server.post('/task/add/:listId', { preHandler: auth }, async (req: CustomFastifyRequest, res: FastifyReply) => {

    const { listId } : { listId: string } = req.params as any
    const { descriptionCreateTask } : { descriptionCreateTask: string} = req.body as any

    if (!descriptionCreateTask || descriptionCreateTask.trim() === '') {
      return res.status(400).send({ error: 'Description dont can empty!' })
    }

    try {
      const newTask = await prisma.contentList.create({
        data: {
          description: descriptionCreateTask, 
          referenceList: { connect: { id: listId } }
        },
      })
      return res.send({
        status: 201,
        message: 'Task add successfully!',
        taskId: newTask.id, 
        Task: newTask
      })
    } catch (error) {
      return res.status(500).send({ error: error })
    }
    })
}

export default addTask

