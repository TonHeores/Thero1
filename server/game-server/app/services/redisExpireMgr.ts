//DB的过期时间管理，方便redis知道，到底是否需要从mysql里面读取数据

import { createClient } from 'redis'
import Log from '../utils/log'

const REDIS_EXPIRE_TIME = 1000 * 60 * 10 //10分钟

const DATA_EXPIRE_DATA = 'DATA_EXPIRE_DATA'

class RedisExpireMgr {
  redis: ReturnType<typeof createClient>
  constructor(redis: ReturnType<typeof createClient>) {
    this.redis = redis
  }
  async setExpire(sKey: string, expireTime: number) {
    expireTime = expireTime || REDIS_EXPIRE_TIME
    //记录的过期时间
    var myExpireTime = expireTime + Date.now()
    return this.redis.hSet(DATA_EXPIRE_DATA, sKey, myExpireTime)
  }

  async delExpire(sKey: string) {
    return this.redis.hDel(DATA_EXPIRE_DATA, sKey)
  }

  async isExpire(sKey: string) {
    const [err, reply] = await this.redis.hGet(DATA_EXPIRE_DATA, sKey)
    if (err) {
      return true
    }
    return Number(reply) > 0
  }

  async doExpir() {
    const reply = await this.redis.hGetAll(DATA_EXPIRE_DATA)
    if (reply == null) {
      // utils.invokeCallback(cb);
    } else {
      //组合指令
      var curTime = Date.now()
      var delKeys = [DATA_EXPIRE_DATA]
      for (const sKey in reply) {
        var expireTime = parseInt(reply[sKey])
        if (expireTime <= curTime) {
          delKeys.push(sKey)
          this.redis.del(sKey)
        }
      }
      if (delKeys.length > 1) {
        this.redis.HDEL.apply(this.redis, delKeys)
        Log.info('redis expire key:', delKeys.toString())
      }
    }
  }
}

export default RedisExpireMgr
