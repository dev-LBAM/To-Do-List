import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import auth from '../../../middlewares/auth'
import prisma from '../../../../prisma/prismaClient'

//SCHEMA TO USERID
interface CustomFastifyRequest extends FastifyRequest { userId?: string }

export const updateList = (server: FastifyInstance) => {
    server.put('/lists/:idlist/update', { preHandler: auth }, async (req: CustomFastifyRequest, res: FastifyReply) => {
        try {
          const { idlist } : { idlist: string} = req.params as any
          const { newTitle } : { newTitle: string} = req.body as any

            const newList = await prisma.list.update({
                where: {
                    id: idlist,
                },
                data: {
                    title: newTitle,
                    LastUpdate: new Date(),
                    referenceUser: { connect: { id: req.userId } },
                }
            })

            return res.send({ status: 201, message: `List modify successfully!`, CreateAt: newList.CreateAt, LastUpdate: newList.LastUpdate })
        } catch (error) {
            return res.status(500).send({ error: error })
        }
    })
}

export default updateList

