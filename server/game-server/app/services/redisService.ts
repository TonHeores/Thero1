import { Application } from 'pinus'
import ReidsExpireMgr from './redisExpireMgr'
import RedisExpireMgr from './redisExpireMgr'
import { RedisClientType, createClient } from 'redis'
import MysqlService from './mysqlService'
import Log from '../utils/log'


const HAS_RETURN = 1
const DIRTY_KEYS = 'DIRTY_KEYS'

//数据过期时间
const EXPIRE_TIME = 1000 * 60 * 60 * 72 //3天

//Redis使用的
export enum CommDataType {
  string = 1,
  list = 2,
  hash = 3,
  order = 4
}





class RedisService {
  isWriting
  redisExpireMgr: RedisExpireMgr
  redis: RedisClientType
  constructor(private app: Application, host: string, port: number, nDB: number = 0) {
    //{detect_buffers: true,return_buffers:true}
    Log.info(`Initialize redis at host=${host}, port=${port}`)
    // url rule: redis[s]://[[username][:password]@][host][:port][/db-number]
    this.redis = createClient({
      url: `redis://${host}:${port}/${nDB}`
    })

    this.redis.on('error', err => Log.logError('rrrrrrrrredis error:' + err))

    this.redis
      .connect()
      .then(() => Log.log('Redis is connected'))
      .catch(e => Log.logError('Redis connected error:' + e.message))

    this.redisExpireMgr = new ReidsExpireMgr(this.redis)
    this.isWriting = false
  }

  getKeys(sFind, cb) {
    this.redis.keys(sFind, cb)
  }

  async setValue(sKey: string, oData: any) {
    if (sKey && oData) {
      const [err, replies] = await this.redis.set(sKey, JSON.stringify(oData))
      if (err != null) {
        Log.logError('setValue error:' + sKey, err)
      } else {
        //设置脏表
        this.setDirty(sKey, CommDataType.string)
      }
      return [err, replies]
    }
    throw new Error('Illegal parameters setValue')
  }


  getRedis() {
    return this.redis
  }

  async getValue(sKey: string, isRaw = false): Promise<[Error | null, any]> {
    if (sKey) {
      const reply = await this.redis.get(sKey)
      if (isRaw) {
        return [null, reply]
      }
      try {
        const value = JSON.parse(reply)
        return [null, value]
      } catch (e) {
        return [e, null]
      }
    }
    throw new Error('Illegal parameters getValue')
  }

  //获取数据
  async exist(sKey: string) {
    if (sKey) {
      return this.redis.exists(sKey)
    }
    throw new Error(`exist: sKey should not be null`)
  }

  async setDirty(sKey: string, dataType: number) {
    Log.info('setDirty:', DIRTY_KEYS, sKey, dataType)
    return this.redis.hSet(DIRTY_KEYS, sKey, dataType)
  }

  /**
   * set是同步的,get是异步的
   * @param sKey {number|string}
   * @param sField {number|string}
   * @param  oData {json|array|string|number}
   * @param cb function (err, replies) 回调函数
   */
  async hmset(sKey: string, sField: string, value: any) {
    Log.info('setDirty:', sKey, sField, value)
    if (sKey && sField && value) {
      const [err, oData = {}] = await this.getValue(sKey)
      oData[sField] = value

      const result = await this.redis.set(sKey, JSON.stringify(oData))
      //设置脏表
      if (!result[0]) {
        this.setDirty(sKey, CommDataType.hash)
      }
      return result
    }
    throw new Error(`hmset: sKey should not be null`)
  }

  async hmget(sKey: string, sField: string) {
    if (sKey && sField) {
      return this.getValue(sKey)
    }
    throw new Error(`hmget: sKey should not be null`)
  }

  /**
   * 删除列表中含有nValue 的
   * @param sKey
   * @param nValue
   * @param cb
   */
  async lrem(sKey: string, nValue: string) {
    if (sKey) {
      return this.redis.lRem(sKey, 0, nValue)
      //   if (!err) {
      //     this.setDirty(sKey, CommDataType.list)
      //   }
      //   return [err, reply]
    }
    throw new Error(`lrem: sKey should not be null`)
  }

  //给排行榜增加数据
  async zadd(sKey: string, score, dataFlag) {
    if (sKey) {
      const result = await this.redis.zAdd(sKey, score, dataFlag)
      //   if (!result.err) {
      //     this.setDirty(sKey, CommDataType.order)
      //   }
      return result
    }
    throw new Error(`zadd: sKey should not be null`)
  }

  //获取排行榜，第几名-第几名的数据，由小到大
  async zrange(sKey: string, nStart = 0, nEnd = -1) {
    nStart = nStart || 0
    nEnd = nEnd || -1
    return this.redis.zRange(sKey, nStart, nEnd)
  }

  /**
   * 获取排行榜，由大到小
//    */
  //   async zrevrange(sKey: string, nStart: number, nEnd: number) {
  //     nStart = nStart || 0
  //     nEnd = nEnd || -1
  //     return this.redis.zevrange(sKey, nStart, nEnd, 'WITHSCORES')
  //   }

  //获取dataFlag的名次，由小到大的
  async zrank(sKey: string, mainKey: string) {
    return this.redis.zRank(sKey, mainKey)
  }

  /**
   * 列表的值的设定
   * @param sKey
   * @param nIndex
   * @param nValue
   * @param cb
   */
  async lset(sKey: string, nIndex: number, nValue: any) {
    if (sKey) {
      const [err, reply] = await this.redis.lSet(sKey, nIndex, nValue)
      if (!err) {
        this.setDirty(sKey, CommDataType.list)
      }
    }
    throw new Error(`lset: sKey should not be null`)
  }

  //获取dataFlag的名次，由大到小的
  async zrevrank(sKey: string, dataFlag) {
    return this.redis.zRevRank(sKey, dataFlag)
  }

  //移除记录
  async zrem(sKey: string, dataFlag) {
    return this.redis.zRem(sKey, dataFlag)
  }

  /**
   * redis是List数据的时候有效
   * @param sKey
   * @param nStart {number}
   * @param nEnd {number}
   * @param cb
   */
  async lrange(sKey: string, nStart = 0, nEnd = -1) {
    if (sKey) {
      return this.redis.lRange(sKey, nStart, nEnd)
    }
    return [new Error('sKey is empty'), null]
  }

  /**
   * 删除过期时间,角色又上线了
   * @param {string}sKey
   * @param cb
   */
  async delExpire(sKey: string, dataType = CommDataType.string) {
    if (dataType == CommDataType.list || dataType == CommDataType.order) {
      await this.redisExpireMgr.delExpire(sKey)
      return this.redis.persist(sKey)
    } else {
      return this.redis.persist(sKey)
    }
  }

  public async checkDataFromRedis(sKey: string, dataType = CommDataType.string): Promise<[Error | null, any]> {
    Log.info('checkDataFromRedis:', sKey)
    try {
      switch (dataType) {
        case CommDataType.list: {
          const reply = await this.redis.lRange(sKey, 0, -1)
          if (reply) {
            this.delExpire(sKey, CommDataType.list)
          }
          Log.info('asycDataToRedis list', sKey, 'CommDataType.list')
          return [null, reply]
        }
        case CommDataType.order: {
          const reply = await this.redis.zRange(sKey, 0, -1)
          if (reply) {
            //redis有数据
            //避免过期
            this.delExpire(sKey, CommDataType.order)
          }
          return [null, reply]
        }
        case CommDataType.hash: {
          const reply = await this.redis.hGetAll(sKey)
          if (reply) {
            this.delExpire(sKey, CommDataType.hash)
          }
          return [null, reply]
        }

        default: {
          Log.info('By default, we get sKey from redis:', sKey)
          console.log(JSON.stringify(this.redis))
          try {
            const reply = await this.redis.get(sKey)
            Log.info('We get reply: ', reply)
            if (reply) {
              this.delExpire(sKey, CommDataType.string)
            }
            return [null, reply]
          } catch (e) {
            console.error(e)
            throw e
          }
        }
      }
    } catch (e) {
      Log.logError('Oh no, checkDataFromRedis error', e)
      return [e, null]
    }
  }

  public async saveDataToRedis(sKey: string, dataType: (typeof CommDataType)[keyof typeof CommDataType], result) {
    Log.info('start to call saveDataToRedis:', sKey)
    try {
      switch (dataType) {
        case CommDataType.list: {
          Log.info('saveDataToRedis list', sKey, 'CommDataType.list')
          return this.redis.rPush(sKey, result)
        }
        case CommDataType.order: {
          Log.info('saveDataToRedis order', sKey, 'CommDataType.order')
          return this.redis.zAdd(sKey, result)
        }
        case CommDataType.hash: {
          Log.info('saveDataToRedis hash', sKey, 'CommDataType.hash')
          return this.redis.hSet(sKey, result)
        }
        default: {
          return this.redis.set(sKey, result)
        }
      }
    } catch (e) {
      throw e
    }
  }

  async asycDataToRedis(sKey: string, dataType = CommDataType.string, value: unknown) {
    try {
      Log.debug('Start to asycDataToRedis:', sKey, value)
      const data = await this.saveDataToRedis(sKey, dataType, value)
      return [null, data]
    } catch (e) {
      return [e, null]
    }
  }
}

export default RedisService

//删除头部yuansu。只能用于全局数据，不要在用户的身上数据使用
// async lpop  (sKey: string) {
//   const [err, reply] = await this.llen(sKey)
//     if (reply > 0) {
//       this.redis.lpop(sKey, function (err, reply) {
//         if (err) {
//           utils.invokeCallback(cb, err, null)
//           return
//         }
//         self.setDirty(sKey, CommDataType.list)
//         utils.invokeCallback(cb, err, reply)
//       })
//     } else {
//       utils.invokeCallback(cb, null, null)
//     }
//   })
// }

// M.lpopBytes = function (sKey, cb) {
//   var self = this
//   this.llen(sKey, function (err, reply) {
//     if (reply > 0) {
//       // var byteKey=[new Buffer(sKey)];
//       self.redis.lpop(sKey, function (err, reply) {
//         if (err) {
//           utils.invokeCallback(cb, err, null)
//           return
//         }
//         self.setDirty(sKey, CommDataType.list)
//         utils.invokeCallback(cb, err, reply)
//       })
//     } else {
//       utils.invokeCallback(cb, null, null)
//     }
//   })
// }

// //移除并返回列表 key 的头元素。只能用于全局数据，不要在用户的身上数据使用
// M.rpop = function (sKey, cb) {
//   var self = this
//   this.llen(sKey, function (err, reply) {
//     if (reply > 0) {
//       self.redis.rpop(sKey, function (err, reply) {
//         if (err) {
//           utils.invokeCallback(cb, err, null)
//           return
//         }
//         self.setDirty(sKey, CommDataType.list)
//         utils.invokeCallback(cb, err, reply)
//       })
//     } else {
//       utils.invokeCallback(cb, null, null)
//     }
//   })
// }

// /**
//  * 获取redis中列表的数据以index为索引
//  * @param {number}sKey
//  * @param {number}nIndex
//  * @param {function}cb
//  */
// M.lindex = function (sKey, nIndex, cb) {
//   if (sKey) {
//     this.redis.lrange(sKey, nIndex, nIndex, function (err, reply) {
//       if (err) {
//         utils.invokeCallback(cb, err, null)
//         return
//       }
//       utils.invokeCallback(cb, err, reply)
//     })
//   }
// }
// /**
//  * 压入数据
//  * @param sKey {string} 数据库的key
//  * @param value {object|Array}数据库的值 ，可以多个值，用数据包起来
//  * @param cb {function}
//  */
// M.lpush = function (sKey, value, cb) {
//   if (sKey) {
//     var self = this
//     //如果是数组
//     if (value instanceof Array) {
//       value.unshift(sKey)
//       value.push(function (err, reply) {
//         if (err) {
//           utils.invokeCallback(cb, err, null)
//           return
//         }
//         self.setDirty(sKey, CommDataType.list, cb)
//         // utils.invokeCallback(cb,err,reply);
//       })
//       //不定参数连续push很多个进去
//       this.redis.lpush.apply(this.redis, value)
//     } else {
//       this.redis.lpush(sKey, value, function (err, reply) {
//         if (err) {
//           utils.invokeCallback(cb, err, null)
//           return
//         }
//         self.setDirty(sKey, CommDataType.list, cb)
//         // utils.invokeCallback(cb,err,reply);
//       })
//     }
//   }
// }

// /**
//  * 压入数据
//  * @param sKey {string} 数据库的key
//  * @param value {object|Array}数据库的值 ，可以多个值，用数据包起来
//  * @param cb {function}
//  */
// M.rpush = function (sKey, value, cb) {
//   if (sKey) {
//     var self = this
//     //如果是数组
//     if (value instanceof Array) {
//       value.unshift(sKey)
//       value.push(function (err, reply) {
//         if (err) {
//           utils.invokeCallback(cb, err, null)
//           return
//         }
//         self.setDirty(sKey, CommDataType.list, cb)
//         // utils.invokeCallback(cb,err,reply);
//       })
//       //不定参数连续push很多个进去
//       this.redis.rpush.apply(this.redis, value)
//     } else {
//       this.redis.rpush(sKey, value, function (err, reply) {
//         if (err) {
//           utils.invokeCallback(cb, err, null)
//           return
//         }
//         self.setDirty(sKey, CommDataType.list, cb)
//         // utils.invokeCallback(cb,err,reply);
//       })
//     }
//   }
// }

// /**
//  * 获取列表的长度
//  * @param {string}sKey
//  * @param {function}cb
//  */
// M.llen = function (sKey, cb) {
//   if (sKey) {
//     this.redis.llen(sKey, function (err, reply) {
//       if (err) {
//         utils.invokeCallback(cb, err, null)
//         return
//       }
//       utils.invokeCallback(cb, err, reply)
//     })
//   }
// }

// /**
//  * redis，数据回收
//  * @param {string} sKey
//  * @param {function} cb
//  */
// M.del = function (sKey, cb) {
//   if (sKey) {
//     this.redis.del(sKey, function (err, reply) {
//       if (err) {
//         utils.invokeCallback(cb, err, null)
//         return
//       }
//       logger.debug('sKey:' + sKey + ',removed')
//       utils.invokeCallback(cb, err, reply)
//     })
//   }
// }

// /**
//  * 设置数据过期时间，在角色退出
//  * @param {string}sKey
//  * @param {number}expireTime
//  */
// M.setExpire = function (sKey, expireTime, dataType, cb) {
//   dataType = dataType || CommDataType.string
//   expireTime = expireTime || EXPIRE_TIME

//   //自己加的一套过期管理机制，可以检查的。
//   if (dataType == CommDataType.list || dataType == CommDataType.order) {
//     this.redisExpireMgr.setExpire(sKey, expireTime, cb)
//     this.redis.expire(sKey, expireTime, function (err, reply) {
//       if (err) {
//         utils.invokeCallback(cb, err, null)
//         return
//       }
//       utils.invokeCallback(cb, err, reply)
//     })
//   } else {
//     this.redis.expire(sKey, expireTime, function (err, reply) {
//       if (err) {
//         utils.invokeCallback(cb, err, null)
//         return
//       }
//       utils.invokeCallback(cb, err, reply)
//     })
//   }
// }

// //list 和 order数据可以用
// M.isExpire = function (sKey, cb) {
//   this.redisExpireMgr.isExpire(sKey, cb)
// }

// //只能读取pb的数据格式的string
// M.asycDataToRedisWidthPB = function (sKey, pbType, callback) {
//   var self = this
//   var mysqlService = this.app.get(Services.MysqlService)
//   async.waterfall(
//     [
//       function (cb) {
//         // var args=[new Buffer(sKey)];
//         self.redis.get(sKey, function (err, reply) {
//           if (reply == null) {
//             //redis没数据
//             logger.info('asycDataToRedisWidthPB not get data:' + sKey)
//             utils.invokeCallback(cb)
//           } else {
//             //redis有数据
//             // logger.info("readData:"+sKey)
//             //有数据
//             utils.invokeCallback(callback, err, pbUtils.decode(pbType, reply))
//             //提前结束，打断
//             utils.invokeCallback(cb, 'err')
//           }
//         })
//       },
//       function (cb) {
//         mysqlService.getValue(sKey, function (err, res) {
//           if (res != null) {
//             //mysql有数据，写入redis ，顺序执行的，给下一个函数调度，cb
//             //null是async.waterfall的固定写法，方便给function定义执行体的比如:this
//             utils.invokeCallback(cb, null, res)
//           } else {
//             //没数据
//             utils.invokeCallback(callback, err, null)
//           }
//         })
//       },
//       function (res, cb) {
//         //有数据写入
//         self.redis.set(sKey, res, function (err, reply) {
//           //写入成功把数据返回
//           if (!err && reply) {
//             utils.invokeCallback(callback, err, pbUtils.decode(pbType, res))
//           } else {
//             utils.invokeCallback(callback, err, null)
//           }
//         })
//       }
//     ],
//     function (err, result) {
//       if (err) {
//         if (typeof err == 'string') {
//           logger.info('asycDataToRedisWidthPB', sKey, '=====finish')
//         } else {
//           //报错了
//           logger.info('loadDataError')
//           utils.invokeCallback(callback, err, null)
//         }
//       }
//     }
//   )
// }
// /**
//  * 批量读取keys，没有的会从mysql数据库中读取，写入redis
//  * @param sKeyList
//  * @param callback
//  */
// M.batchReadRedisKeys = function (sKeyList, callback) {
//   var result
//   var self = this
//   this.redis.mget.apply(this.redis, sKeyList, function (err, reply) {
//     if (!err) {
//       result = reply
//       var maxCount = result.length
//       //执行列表
//       var excuseList = []
//       for (var i = 0; i < maxCount; i++) {
//         if (result[i] == null) {
//           excuseList.push(
//             (function (index) {
//               return function (cb) {
//                 //把数据缺失的数据，加载到redis中
//                 self.asycDataToRedis(sKeyList[index], function (err, outData) {
//                   result[index] = outData
//                   utils.invokeCallback(cb)
//                 })
//               }
//             })(i)
//           )
//         }
//       }
//       async.parallel(excuseList, function (err, re) {
//         if (err) {
//           logger.error('batchReadRedisKeys:' + err)
//           return
//         }
//         //返回数据
//         utils.invokeCallback(callback, result)
//       })
//     }
//   })
// }

// /**
//  * 把redis的脏数据写入mysql
//  * @imortant 全局唯一的，只能给全局唯一的unique服调度
//  */
// M.asycRedisDataToMysql_ForUniqueServer = function () {
//   var mysqlService = this.app.get(Services.MysqlService)
//   var self = this
//   if (this.isWriting) return
//   this.isWriting = true
//   // logger.info("asycRedisDataToMysql_ForUniqueServer start");
//   this.redis.hgetall(DIRTY_KEYS, function (err, reply) {
//     if (!err) {
//       if (!reply) {
//         // logger.info("asycRedisDataToMysql_ForUniqueServer no data return",reply);
//         self.isWriting = false
//         return
//       }
//       var excuseList = []

//       for (var sKey in reply) {
//         logger.info('write data key:', sKey)
//         //写入更新的一个数据
//         excuseList.push(
//           (function (k, dataType) {
//             dataType = parseInt(dataType)
//             switch (dataType) {
//               case CommDataType.list:
//                 {
//                   return function (cb) {
//                     self.redis.lrange(k, 0, -1, function (err, reply) {
//                       // logger.info("asycRedisDataToMysql list:"+k,reply);
//                       // logger.info("dbData:",k,reply);
//                       mysqlService.insertOrUpdate(k, JSON.stringify(reply), function (err, res) {
//                         if (!err) {
//                           logger.info('write data key:', k, 'done')
//                           //写入成功了，才能把脏数据清理掉
//                           self.redis.hdel(DIRTY_KEYS, k)
//                         } else {
//                           logger.error('asycRedisDataToMysql_ForUniqueServer error:', k, err)
//                         }
//                         utils.invokeCallback(cb)
//                       })
//                     })
//                   }
//                 }
//                 break
//               //排行榜
//               case CommDataType.order: {
//                 return function (cb) {
//                   //从大到小排序
//                   self.redis.ZREVRANGE(k, 0, -1, 'WITHSCORES', function (err, reply) {
//                     // logger.info("asycRedisDataToMysql list:"+k);
//                     // logger.info("dbData:",k,reply);
//                     mysqlService.insertOrUpdate(k, JSON.stringify(reply), function (err, res) {
//                       if (!err) {
//                         logger.info('write data key:', k, 'done')
//                         //没有写入成功了，才能把脏数据清理掉
//                         self.redis.hdel(DIRTY_KEYS, k)
//                       } else {
//                         logger.error('asycRedisDataToMysql_ForUniqueServer error:', k, err)
//                       }
//                       utils.invokeCallback(cb)
//                     })
//                   })
//                 }
//               }
//               case CommDataType.hash:
//                 {
//                   return function (cb) {
//                     self.redis.hgetall(k, function (err, reply) {
//                       // logger.info("asycRedisDataToMysql hash:"+k);
//                       // logger.info("dbData:",k,reply);
//                       mysqlService.insertOrUpdate(k, JSON.stringify(reply), function (err, res) {
//                         if (!err) {
//                           logger.info('write data key:', k, 'done')
//                           //没有写入成功了，才能把脏数据清理掉
//                           self.redis.hdel(DIRTY_KEYS, k)
//                         } else {
//                           logger.error('asycRedisDataToMysql_ForUniqueServer error:', k, err)
//                         }
//                         utils.invokeCallback(cb)
//                       })
//                     })
//                   }
//                 }
//                 break
//               default:
//                 {
//                   return function (cb) {
//                     self.redis.get(k, function (err, reply) {
//                       // logger.info("asycRedisDataToMysql string:"+k);
//                       // logger.info("dbData:",k,reply);
//                       mysqlService.insertOrUpdate(k, reply, function (err, res) {
//                         if (!err) {
//                           logger.info('write data key:', k, 'done')
//                           //没有写入成功了，才能把脏数据清理掉
//                           self.redis.hdel(DIRTY_KEYS, k)
//                         } else {
//                           logger.error('asycRedisDataToMysql_ForUniqueServer error:', k, err)
//                         }
//                         utils.invokeCallback(cb)
//                       })
//                     })
//                   }
//                 }
//                 break
//             }
//           })(sKey, reply[sKey])
//         )
//       }

//       //执行队列
//       if (excuseList.length > 0) {
//         async.waterfall(excuseList, function (err, result) {
//           if (err) {
//             logger.error('asycRedisDataToMysql_ForUniqueServer:' + err)
//             return
//           }
//           self.isWriting = false
//           logger.info('=====mysql save finish,effect count:', excuseList.length, '=======')
//         })
//       } else {
//         self.isWriting = false
//       }
//     } else {
//       logger.info('=====asycRedisDataToMysql_ForUniqueServer: err', err)
//     }
//   })
// }
