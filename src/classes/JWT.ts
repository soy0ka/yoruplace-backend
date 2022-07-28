import 'dotenv/config'
import jwt from 'jsonwebtoken'

interface DecodedPayload {
  sub: number
}
export default class JWT {
  private static SECRET:string = process.env.JWT_SECRET || ''
  public static sign (id:number) {
    const payload = { sub: id }
    return jwt.sign(payload, this.SECRET, { algorithm: 'HS256', expiresIn: 60 * 60 * 24 * 30 })
  }

  public static verify (token:string) {
    try {
      const decoded: unknown = jwt.verify(token, this.SECRET)
      return {
        ok: true,
        id: (decoded as DecodedPayload).sub
      }
    } catch (error:any) {
      return {
        ok: false,
        message: error.message
      }
    }
  }
}
