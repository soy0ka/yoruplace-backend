/* eslint-disable no-labels */
import 'dotenv/config'
import cors from 'cors'
import helmet from 'helmet'
import JWT from '../classes/JWT'
import { Logger } from '../utils/Logger'
import DiscordOauth2 from '../classes/Discord'
import DatabaseClient from '../classes/Database'
import express, { Request, Response, NextFunction } from 'express'

const app = express.Router()
const knex = new DatabaseClient().db

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/@me', async (req:Request, res:Response, next:NextFunction) => {
  const { authorization } = req.headers
  if (!authorization) return res.status(401).send({ code: 401, message: 'Invalid Token' }).end()
  const token = (authorization as string).split('Bearer ')[1]
  try {
    const verify = JWT.verify(token)
    if (!verify.ok) return res.status(401).json({ code: 401, message: 'Invaild token' })
    const [dbuser] = await knex('Users').where('discordId', verify.id)
    let User = await DiscordOauth2.getUser(dbuser.AccessToken).catch(async (error) => {
      Logger.error('Discord Auth Fail').put(error.stack).out()
      const Refresh = await DiscordOauth2.refreshToken(dbuser.RefreshToken).catch(async (error) => {
        Logger.error('Discord Auth Fail').put(error.stack).out()
        return res.status(401).send({ code: 401, message: 'Invalid Token' })
      })
      User = await DiscordOauth2.getUser(Refresh.access_token).catch(error => {
        Logger.error('Discord Auth Fail').put(error.stack).out()
        return res.status(401).send({ code: 401, message: 'Invalid Token' })
      })
    })
    const avatarURL = `https://cdn.discordapp.com/avatars/${User.id}/${User.avatar}?size=1024`
    return res.status(200).send({ code: 200, message: 'Success', user: User, avatar: avatarURL })
  } catch (error:any) {
    Logger.error(error.name).put(error.stack).out()
    return res.status(401).send({ code: 401, message: 'Invalid Token' })
  }
})

app.get('/callback', async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.query
  if (!code) return res.status(401).send({ code: 401, message: 'Code required' })
  const tokens = await DiscordOauth2.getToken(code as string).catch(error => {
    Logger.error('Discord Auth Fail').put(error.stack).out()
    return res.status(401).send({ code: 401, message: 'Code not vaild' })
  })
  let User = await DiscordOauth2.getUser(tokens.access_token).catch(async (error) => {
    Logger.error('Discord Auth Fail').put(error.stack).out()
    const Refresh = await DiscordOauth2.refreshToken(tokens.refresh_token).catch(async (error) => {
      Logger.error('Discord Auth Fail').put(error.stack).out()
      return res.status(401).send({ code: 401, message: 'Invalid Token' })
    })
    User = await DiscordOauth2.getUser(Refresh.access_token).catch(error => {
      Logger.error('Discord Auth Fail').put(error.stack).out()
      return res.status(401).send({ code: 401, message: 'Invalid Token' })
    })
  })
  const [user] = await knex('Users').where({ discordId: User.id, email: User.email })
  if (!user) {
    await knex('Users').insert({
      email: User.email,
      discordId: User.id,
      AccessToken: User.access_token,
      RefreshToken: User.refresh_token
    })
  } else {
    await knex('Users').update({
      AccessToken: tokens.access_token,
      RefreshToken: tokens.refresh_token
    }).where({ discordId: User.id, email: User.email })
  }
  return res.status(200).send({ code: 200, message: 'OK', token: JWT.sign(User.id) })
})

export default app
