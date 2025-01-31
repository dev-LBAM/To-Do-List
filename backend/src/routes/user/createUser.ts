import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import prisma from '../../../prisma/prismaClient'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'

export const createUser = (server: FastifyInstance) =>{
    server.post("/createuser", async (req: FastifyRequest, res: FastifyReply) => {
        const { Name, LastName, Email, Password, Age, Gender }:
        {Name: string, LastName: string, Email: string, Password: string, Age: number, Gender: string} = req.body as any
        try {
            const verify = await prisma.userform.findFirst({
                where: {Email: Email},
                select: {Email: true}
            })

            if(verify) return res.send({ status: 400, error: 'Email already exists!'})
            const hashedPassword = await bcrypt.hash(Password, 10)
            const create = await prisma.userform.create({ 
                data: {
                    Name: Name, 
                    LastName: LastName, 
                    Email: Email, 
                    Password: hashedPassword, 
                    Age: Age, 
                    Gender: Gender
                }
            })

            //Schema to check email
            if(create){
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
                
                
                // Define options of send
                const mailOptions = {
                    from: process.env.NODEMAILER_EMAIL,
                    to: create.Email,
                    subject: 'Your code to check the email: ',
                    text: create.validation_id
                }
                
                // Send email
                transponder.sendMail(mailOptions, (error) => {
                    if (error) {
                        return res.status(500).send({ message: "Error to send email: ", error})
                    }
                    const code = create.validation_id
                    res.status(200).send({ message: "Email sent successfully!", code})
                })
            
                // Set refresh token in cookies
                const refreshToken = jwt.sign({ userId: create.id }, `${process.env.SECRET_JWT_REFRESH}`, { expiresIn: '7d' })
                res.setCookie('refreshToken', refreshToken, {
                    path: '/',
                    httpOnly: true, 
                    secure: false,
                    sameSite: 'strict',
                })

                return res.send({status: 201, message: 'User created successfully!'})
            }
        } catch (error) {
            return res.send({status: 500, message: 'Error to create user: ', error})
        }
    })
}