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
        host: 'oracle.choabot.com',
        port: 3306,
        user: 'choabot',
        password: 'Yurihana09@',
        database: 'nextron'
      }
    })
  }
}
