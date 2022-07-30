/* eslint-disable no-labels */
import 'dotenv/config'
import cors from 'cors'
import helmet from 'helmet'
import JWT from '../classes/JWT'
import { Logger } from '../utils/Logger'
import KakaoOauth from '../classes/Kakao'
import DiscordOauth2 from '../classes/Discord'
import DatabaseClient from '../classes/Database'
import MiddleWare from '../classes/Middleware'
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
    if (!dbuser) return res.status(404).json({ code: 404, message: 'User not found' })
    let User = await DiscordOauth2.getUser(dbuser.AccessToken)
    if (User.error) {
      const Refresh = await DiscordOauth2.refreshToken(dbuser.RefreshToken)
      if (Refresh.error) return res.status(401).send({ code: 401, message: 'Invalid Token' })
      console.log(Refresh)
      User = await DiscordOauth2.getUser(Refresh.data.access_token)
      await knex('Users').update({
        AccessToken: Refresh.data.access_token
      }).where({ discordId: dbuser.id, email: dbuser.email })
    }
    const avatarURL = `https://cdn.discordapp.com/avatars/${User.data.id}/${User.data.avatar}?size=1024`
    return res.status(200).send({ code: 200, message: 'Success', user: User.data, avatar: avatarURL })
  } catch (error:any) {
    Logger.error(error.name).put(error.stack).out()
    return res.status(401).send({ code: 401, message: 'Invalid Token' })
  }
})

app.get('/callback', async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.query
  if (!code) return res.status(401).send({ code: 401, message: 'Code required' })
  const tokens = await DiscordOauth2.getToken(code as string)
  if (tokens.error) return res.status(401).send({ code: 401, message: 'Invalid Code' })
  let User = await DiscordOauth2.getUser(tokens.data.access_token)
  if (User.error) {
    const Refresh = await DiscordOauth2.refreshToken(tokens.data.refresh_token)
    if (Refresh.error) return res.status(401).send({ code: 401, message: 'Invalid Token' })
    User = await DiscordOauth2.getUser(Refresh.data.access_token)
    await knex('Users').update({
      AccessToken: Refresh.data.access_token
    }).where({ discordId: User.data.id, email: User.data.email })
  }
  const [user] = await knex('Users').where({ discordId: User.data.id, email: User.data.email })
  if (!user) {
    await knex('Users').insert({
      email: User.data.email,
      discordId: User.data.id,
      AccessToken: tokens.data.access_token,
      RefreshToken: tokens.data.refresh_token
    })
  } else {
    await knex('Users').update({
      AccessToken: tokens.data.access_token,
      RefreshToken: tokens.data.refresh_token
    }).where({ discordId: User.data.id, email: User.data.email })
  }
  return res.status(200).send({ code: 200, message: 'OK', token: JWT.sign(User.data.id) })
})

app.use(MiddleWare.verify)
app.get('/kakao', async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.query
  if (!code) return res.status(401).send({ code: 401, message: 'Code required' })
  const tokens = await KakaoOauth.getToken(code as string)
  if (tokens.error) return res.status(401).send({ code: 401, message: 'Invalid Code' })
  const user = await KakaoOauth.getUser(tokens.data.access_token)
  if (user.error) return res.status(401).send({ code: 401, message: 'Invalid Token' })
  const [dbuser] = await knex('Users').where({ discordId: res.locals.user.id })
  if (!dbuser) return res.status(400).send({ code: 400, message: 'Bad Request' })
  try {
    await knex('Users').update({ kakaoId: user.data.id }).where({ discordId: res.locals.user.id })
  } catch (error:any) {
    Logger.error('Knex').put(error.stack).out()
    return res.status(500).send({ code: 500, message: 'Cannot create project (database Error)' })
  }
  return res.status(200).send({ code: 200, message: 'OK' })
})

export default app
