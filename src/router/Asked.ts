/* eslint-disable no-labels */
import 'dotenv/config'
import cors from 'cors'
import helmet from 'helmet'
import { Logger } from '../utils/Logger'
import DatabaseClient from '../classes/Database'
// import MiddleWare from '../classes/Middleware'
import express, { Request, Response, NextFunction } from 'express'

const app = express.Router()
const knex = new DatabaseClient().db

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questions = await knex('Questions')
    return res.status(200).send({ code: 200, message: 'OK', questions })
  } catch (error:any) {
    Logger.error('Knex').put(error.stack).out()
    return res.status(500).send({ code: 500, message: 'Internal Server Error' })
  }
})

app.post('/add', async (req: Request, res: Response, next: NextFunction) => {
  const { question } = req.body
  if (!question) return res.status(400).send({ code: 400, message: 'Bad request' })
  try {
    await knex('Questions').insert({
      question,
      hide: 1
    })
    return res.status(200).send({ code: 200, message: 'OK' })
  } catch (error:any) {
    Logger.error('Knex').put(error.stack).out()
    return res.status(500).send({ code: 500, message: 'Internal Server Error' })
  }
})

export default app
