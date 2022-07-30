import 'dotenv/config'
import { get, post } from 'superagent'
import { Logger } from '../utils/Logger'

export default class KakaoOauth {
  public static async getToken (code:string) {
    const response = await post('https://kauth.kakao.com/oauth/token')
      .set('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8')
      .send({
        client_id: process.env.KAKAO_CLIENT_ID,
        client_secret: process.env.KAKAO_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.KAKAO_REDIRECT_URI
      }).catch(error => {
        Logger.error('Kakao Auth Fail').put(error.stack).out()
        return false
      })
    return response ? { error: false, data: (response as any).body } : { error: true }
  }

  public static async getUser (accessToken:string) {
    const response = await get('https://kapi.kakao.com/v1/user/access_token_info')
      .set('authorization', `Bearer ${accessToken}`)
      .catch(error => {
        Logger.error('Kakao Auth Fail').put(error.stack).out()
        return false
      })
    return response ? { error: false, data: (response as any).body } : { error: true }
  }
}
