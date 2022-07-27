import 'dotenv/config'
import knex, { Knex } from 'knex'

/**
* Knex Client
*/
export default class DatabaseClient {
  public db: Knex
  constructor () {
    this.db = knex({
      client: 'mysql',
      connection: {
        host: process.env.DATABASE_HOST || 'localhost',
        port: Number(process.env.DATABASE_PORT) || 3306,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME || 'YoruPlace'
      }
    })
  }
}
