import { fastify, FastifyReply, FastifyRequest } from 'fastify'
import fastifyCookie from '@fastify/cookie'
import cors from '@fastify/cors'

import createList from '../routes/api/list/createList'
import getLists from '../routes/api/list/getList'
import updateList from '../routes/api/list/updateList'
import deleteList from '../routes/api/list/deleteList'

import addTask from '../routes/api/task/addTask'
import getTask from '../routes/api/task/getTask'
import updateTask from '../routes/api/task/updateTask'
import deleteTask from '../routes/api/task/deleteTask'

import verifyAndRefreshToken from '../middlewares/authRefresh'
import authEmail from '../middlewares/authEmail'
import resendCode from '../middlewares/resendCode'

import { createUser } from '../routes/user/createUser'
import { findUser } from '../routes/user/loginUser'
import { logout } from '../routes/user/logoutUser'


const server = fastify()

server.register(fastifyCookie)
server.register(cors, {
    origin: 'http://localhost:3000', 
    credentials: true, 
})


createUser(server)
findUser(server)
createList(server)
getLists(server)
updateList(server)
deleteList(server)

addTask(server)
getTask(server)
deleteTask(server)
updateTask(server)

logout(server)
authEmail(server)
resendCode(server)

verifyAndRefreshToken(server)

server.listen({
    port: parseInt(process.env.PORT ?? '3333', 10)
}, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})