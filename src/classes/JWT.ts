import 'dotenv/config'
import jwt from 'jsonwebtoken'

interface DecodedPayload {
  id: number
}
export default class JWT {
  private static SECRET:string = process.env.JWT_SECRET || ''
  public static sign (id:number) {
    const payload = { id }
    return jwt.sign(payload, this.SECRET, { algorithm: 'HS256' })
  }

  public static verify (token:string) {
    try {
      const decoded = jwt.verify(token, this.SECRET)
      return {
        ok: true,
        id: (decoded as DecodedPayload).id
      }
    } catch (error:any) {
      return {
        ok: false,
        message: error.message
      }
    }
  }
}
