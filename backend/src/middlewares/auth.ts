import { FastifyReply, FastifyRequest } from 'fastify'
import jwt, { JwtPayload } from 'jsonwebtoken'


interface CustomFastifyRequest extends FastifyRequest { userId?: string }

export const auth = async (req: CustomFastifyRequest, res: FastifyReply) => {
    try {
      
        const token = req.headers.authorization
        if (!token) {
          return res.send({ status: 401, error: 'Token not found!' })
        }

        const decoded = jwt.verify(token, `${process.env.SECRET_JWT}`)

        if (decoded && typeof decoded !== 'string' && 'userId' in decoded){ 
            
            const userId = (decoded as JwtPayload & { userId: string }).userId
            req.userId = userId
        }  
        res.status(200)
    } catch (error) {
        const refreshToken = req.cookies.refreshToken
        if (refreshToken) {
          try {
            const decodedRefresh = jwt.verify(refreshToken, `${process.env.SECRET_REFRESH}`) as JwtPayload | string
            
            if (decodedRefresh && typeof decodedRefresh !== 'string' && 'userId' in decodedRefresh) {
              const userId = (decodedRefresh as JwtPayload & { userId: string }).userId
    
              const newAccessToken = jwt.sign({ userId }, `${process.env.SECRET_JWT}`, { expiresIn: '1h' })
    
              return res.send({ accessToken: newAccessToken })
            }
          } catch (error) {
            return res.send({ status: 401, message: 'Error to verify or refresh token: ', error })
          }
        }
    
        return res.send({ status: 401, message: 'Error to verify or refresh token: ', error })
      }
}

export default auth