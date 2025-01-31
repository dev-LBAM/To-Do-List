import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import prisma from '../../prisma/prismaClient'

interface CustomFastifyRequest extends FastifyRequest { 
  userId?: string 
}

export const verifyAndRefreshToken = (server: FastifyInstance) => {
  server.get('/auth/verify-token', async (req: FastifyRequest, res: FastifyReply) => {
    try {

      const refreshToken = req.cookies.refreshToken
      if (!refreshToken) {
        return res.status(401).send({ error: 'Refresh-Token not found!' })
      }

      const decoded = jwt.verify(refreshToken, `${process.env.SECRET_JWT_REFRESH}`)
      const userId = (decoded as { userId: string }).userId


      const newAccessToken = jwt.sign({ userId }, `${process.env.SECRET_JWT}`, { expiresIn: '1h' })

      const user = await prisma.userform.findFirst({
        where: { id: userId },
        select: {Name: true, LastName: true, Checked: true, Email: true}
      })

      const Name = user?.Name
      const LastName = user?.LastName
      const Checked = user?.Checked
      const Email = user?.Email

      return res.send({ accessToken: newAccessToken, Name, LastName, Checked, Email, refreshToken })

    } catch (error) {
      console.log("oi")
      return res.send({ status: 401, message: 'Error to verify or refresh token: ', error})
    }
  })
}

export default verifyAndRefreshToken
