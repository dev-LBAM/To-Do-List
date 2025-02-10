import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import prisma from '../../../prisma/prismaClient'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { randomUUID } from 'crypto'

export const findUser = (server: FastifyInstance) =>{
    server.post("/user/login", async(req: FastifyRequest, res: FastifyReply) =>{
        try {
            const {Email, Password} : {Email: string, Password: string} = req.body as any
            const newUUID = randomUUID() 

            const userform = await prisma.userform.findUnique({
                where: {Email: Email}
            })

            if (userform && await bcrypt.compare(Password, userform.Password)) {
                const Name = userform.Name
                const LastName = userform.LastName
                const Check = userform.Checked
                // Verify if email is check
                if (Check === false){
                    const updateUUID = await prisma.userform.update({
                        where: {Email: Email},
                        data:{validation_id: newUUID}
                    })

                    if(updateUUID)
                    {
                        // Define config admin account and host
                        const transponder = nodemailer.createTransport({
                            host: 'smtp.gmail.com',
                            port: 587,
                            secure: false,
                            auth: {
                                user: process.env.NODEMAILER_EMAIL,
                                pass: process.env.NODEMAILER_PASS
                            }
                        })
                        
                        
                        // Define options to send email
                        const mailOptions = {
                            from: process.env.NODEMAILER_EMAIL,
                            to: userform.Email,
                            subject: 'Your code to check the email: ',
                            text: `${updateUUID.validation_id}`
                        }
                        
                        // Send email
                        transponder.sendMail(mailOptions, (error) => {
                            if (error) {
                                return res.status(500).send({ message: "Error to send email: ", error })
                            }

                            return res.status(200).send({ message: "Email sent successfully!" })
                        })
                    }
                }
                const accessToken = jwt.sign({ userId: userform.id }, `${process.env.SECRET_JWT}`, { expiresIn: '1h' })
                const refreshToken = jwt.sign({ userId: userform.id }, `${process.env.SECRET_JWT_REFRESH}`, { expiresIn: '7d' })

                // Set refresh token in cookies
                res.setCookie('refreshToken', refreshToken, {
                    path: '/',
                    httpOnly: true, 
                    secure: false,
                    sameSite: 'strict',
                })

                res.send({status: 200, message: 'User found successfully!', accessToken, Name, LastName, Check})
            }
            return res.send({status: 400, message: 'Email or password incorrect!'})
        } catch (error) {
            return res.send({status: 500, message: 'Error to find user: ', error})
        }
    })
}