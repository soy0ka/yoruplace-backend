import JWT from './JWT'
import DiscordOauth2 from './Discord'
import { Logger } from '../utils/Logger'
import DatabaseClient from '../classes/Database'
import { Request, Response, NextFunction } from 'express'

const knex = new DatabaseClient().db

/**
* Auth Middleware
*/
export default class MiddleWare {
  public static async verify (req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers
    if (!authorization) return res.status(401).send({ code: 401, message: 'Invalid Token' }).end()
    const token = (authorization as string).split('Bearer ')[1]
    let User
    try {
      const verify = JWT.verify(token)
      if (!verify.ok) return res.status(401).json({ code: 401, message: 'Invaild token' })
      const [dbuser] = await knex('Users').where('discordId', verify.id)
      User = await DiscordOauth2.getUser(dbuser.AccessToken)
      if (User.error) {
        const Refresh = await DiscordOauth2.refreshToken(dbuser.RefreshToken)
        if (Refresh.error) return res.status(401).send({ code: 401, message: 'Invalid Token' })
        User = await DiscordOauth2.getUser(Refresh.data.access_token)
        await knex('Users').update({
          AccessToken: Refresh.data.access_token
        }).where({ discordId: User.data.id, email: User.data.email })
      }
      res.locals.user = User.data
      next()
    } catch (error:any) {
      Logger.error(error.name).put(error.stack).out()
      return res.status(401).send({ code: 401, message: 'Invalid Token' })
    }
  }
}
