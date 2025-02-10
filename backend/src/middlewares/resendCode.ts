import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import nodemailer from 'nodemailer'
import prisma from '../../prisma/prismaClient'
import { randomUUID } from 'node:crypto'

export const resendCode = (server: FastifyInstance) => {
  server.post("/auth/resendCode", async (req: FastifyRequest, res: FastifyReply) => {
    try {
      interface ResendCodeBody {
        email: string
      }

      const { email } = req.body as ResendCodeBody
      const newUUID = randomUUID()  

      const userform = await prisma.userform.update({
        where: { Email: email },
        data: { validation_id: newUUID }
      })

  
      if (userform) {
        const transponder = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.NODEMAILER_EMAIL,
            pass: process.env.NODEMAILER_PASS
          }
        })

        const mailOptions = {
          from: process.env.NODEMAILER_EMAIL,
          to: userform.Email, 
          subject: 'Your new code to check the email: ',
          text: `${newUUID}`
        }

        transponder.sendMail(mailOptions, (error) => {
          if (error) {
            return res.status(500).send({ message: "Error to send email: ", error})
          }
          return res.send({status: 200})
        })
      }

      return res.send({status: 200})
    } catch (error) {
      return res.status(500).send({ error: error})
    }
  })
}

export default resendCode
