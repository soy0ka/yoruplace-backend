import 'dotenv/config'
import cors from 'cors'
import helmet from 'helmet'
// import OAuth from 'discord-oauth2'
import { post } from 'superagent'
import { Logger } from '../utils/Logger'
// import DatabaseClient from '../classes/Database'
import express, { Request, Response, NextFunction } from 'express'

const app = express.Router()
// const oauth = new OAuth()
// const knex = new DatabaseClient().db

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/callback', async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.query
  if (!code) return res.status(401).send({ code: 401, message: 'Code required' })
  try {
    const response = await post('https://discord.com/api/oauth2/token')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI
      })
    return res.status(200).send({ code: 200, message: 'OK', data: JSON.parse(response.text) })
  } catch (error:any) {
    Logger.error('Discord Auth Fail').put(error.stack).out()
    return res.status(401).send({ code: 401, message: 'Code not vaild' })
  }
})

export default app
