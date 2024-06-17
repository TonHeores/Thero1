import { Pool } from 'generic-pool'
import { createMysqlPool } from './dao-pool'
import Log from '../../utils/log'

class MySqlConnection {
  private pool: Pool<any> | undefined

  constructor() {}

  init(dbconfig: any) {
    if (!this.pool) {
      this.pool = createMysqlPool(dbconfig)
    }
    return this.pool
  }

  async query(sql: string, args: any): Promise<any> {
    if (!this.pool) {
      throw new Error('Pool not initialized')
    }
    Log.info('Start to query: ', sql, args)

    try {
      const dbObj = await this.pool.acquire()
      return new Promise((resolve, reject) => {
        dbObj.client.query(sql, args, (err: any, res: any) => {
          this.pool.release(dbObj)
          if (err) {
            reject(err)
          } else {
            Log.info('sql request successfully')
            resolve(res)
          }
        })
      })
    } catch (err) {
      Log.logError('query error:', err)
      throw err
    }
  }

  async shutdown() {
    if (this.pool) {
      await this.pool.drain()
      this.pool.clear()
    }
  }
}

const sqlclient = new MySqlConnection()
export default sqlclient
