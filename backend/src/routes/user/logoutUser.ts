import { FastifyInstance, FastifyReply } from 'fastify'

export const logout = (server: FastifyInstance) => {
  server.post('/logout', (request, reply) => {
    try {
      // Clear refresh token of cookies
      reply.clearCookie('refreshToken', {
          path: '/',          
          httpOnly: true,     
          secure: false,      
          sameSite: 'strict',
        })
        .send({ message: 'Logout and drop cookies successfully!', status: 200, logout: true })
    } catch (error) {
      return reply.status(500).send({ status: 'error', message: 'Error to make logout: ', error})
    }
  })
}