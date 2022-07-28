import 'dotenv/config'
import cors from 'cors'
import helmet from 'helmet'
import http from 'http'
import { Server } from 'socket.io'
import { Logger } from './utils/Logger'
import express, { Request, Response, NextFunction } from 'express'

import Auth from './router/Auth'

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('*', async (req: Request, res: Response, next: NextFunction) => {
  Logger.log(req.method).put(req.params?.['0']).next('user-agent').put(req.headers?.['user-agent']).next('query').put(JSON.stringify(req.query)).next('body').put(JSON.stringify(req.body)).out()
  next()
})

app.use('/auth', Auth)

app.use('/error', async (req: Request, res: Response, next: NextFunction) => {
  res.status(500).send({ code: 500, message: 'Error' })
  throw new Error('User requested Internal Error')
})

app.use('*', async (req: Request, res: Response, next: NextFunction) => {
  res.status(404).send({ code: 404, message: 'Not Found' })
})

io.on('connection', socket => {
  console.log(socket.id)
})

server.listen(3000, () => {
  Logger.success('Express').put('Server Ready').next('port').put(3000).out()
  Logger.info('Environment').put(String(process.env.ENVIRONMENT)).out()
  switch (process.env.ENVIRONMENT) {
    case 'ci':
      Logger.warning('Environment').put('CI deteced process will be stop instanlty').out()
      process.exit(0)
  }
})

process.on('uncaughtException', e => {
  Logger.error('Unhandled Exception').put(e.stack).out()
})
process.on('unhandledRejection', e => {
  Logger.error('Unhandled Rejection').put(e instanceof Error ? e.stack : e).out()
})
