import 'dotenv/config'
import { get, post } from 'superagent'
import { Logger } from '../utils/Logger'

export default class DiscordOauth2 {
  public static async getToken (code:string) {
    const response = await post('https://discord.com/api/oauth2/token')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI
      }).catch(error => {
        Logger.error('Discord Auth Fail').put(error.stack).out()
        return false
      })
    return response ? { error: false, data: (response as any).body } : { error: true }
  }

  public static async getUser (accessToken:string) {
    const response = await get('https://discord.com/api/users/@me')
      .set('authorization', `Bearer ${accessToken}`)
      .catch(error => {
        Logger.error('Discord Auth Fail').put(error.stack).out()
        return false
      })
    return response ? { error: false, data: (response as any).body } : { error: true }
  }

  public static async getGuilds (accessToken:string) {
    const response = await get('https://discord.com/api/users/@me/guilds')
      .set('authorization', `Bearer ${accessToken}`)
    return response.body
  }

  public static async refreshToken (refreshToken:string) {
    const response = await post('https://discord.com/api/oauth2/token')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
      .catch(error => {
        Logger.error('Discord Auth Fail').put(error.stack).out()
        return false
      })
    return response ? { error: false, data: (response as any).body } : { error: true }
  }
}
