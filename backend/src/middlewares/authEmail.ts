import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import prisma from '../../prisma/prismaClient'
import jwt from 'jsonwebtoken'

interface CustomFastifyRequest extends FastifyRequest { userId?: string }

export const authEmail = (server: FastifyInstance) => {
    server.post('/authEmail/:idcode', async (req: CustomFastifyRequest, res: FastifyReply) => {
        try {
            const { idcode }: {idcode: string} = req.params as any
            const findList = await prisma.userform.findFirst({
                where: {
                    validation_id: idcode
                }
            })

            if(findList){
                await prisma.userform.update({
                    where:{
                        validation_id: idcode
                    },
                    data:{
                        Checked: true
                    }
                }) 

                const refreshToken = jwt.sign({ userId: findList.id }, `${process.env.SECRET_JWT_REFRESH}`, { expiresIn: '7d' })
                    res.setCookie('refreshToken', refreshToken, {
                    path: '/',
                    httpOnly: true, 
                    secure: false,
                    sameSite: 'strict',
                    })
                
                const Email = findList.Email
                const Name = findList.Name
                const LastName = findList.LastName
                return res.send({ status: 200, message: `Code check successfully!`, Email, Name, LastName })
            } 
        } catch (error) {
            return res.status(500).send({ error: error })
        }
    })
    
}

export default authEmail
