import { Logger } from "./utils/Logger"
import DatabaseClient from './classes/Database'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
const app = express()
const knex = new DatabaseClient().db

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet.hidePoweredBy())

app.use('*', async(req: Request, res: Response, next: NextFunction) => {
  Logger.log(req.method).put(req.params?.['0']).next('user-agent').put(req.headers?.["user-agent"]).next('query').put(JSON.stringify(req.query)).next('body').put(JSON.stringify(req.body)).out()
  next()
})

app.use('/api/hello', async(req: Request, res: Response, next: NextFunction) => {
  res.status(200).send({ code:200, message: 'Hello' })
})
app.use('*', async(req: Request, res: Response, next: NextFunction) => {
  res.status(404).send({ code:404, message: 'Not Found' })
})
app.listen(3000, () => {
  Logger.success('Express').put('Server Ready').next('port').put(3000).out()
})

process.on('uncaughtException', e => {
  Logger.error("Unhandled Exception").put(e.stack).out()
})
process.on('unhandledRejection', e => {
  Logger.error("Unhandled Rejection").put(e instanceof Error ? e.stack : e).out()
})