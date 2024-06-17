import { createPool } from 'generic-pool'
import { createConnection } from 'mysql2'
import Log from '../../utils/log'

/*
 * Create mysql connection pool.
 */
var createMysqlPool = function (dbConfig: Record<string, string>) {
  var mysqlConfig = dbConfig
  const factory = {
    create: function () {
      return new Promise(function (resolve) {
        var dbObj = {
          client: null
        }

        function handleConnect() {
          Log.info('Start to handle mysql connect')
          Log.log(
            {
              host: mysqlConfig.host,
              user: mysqlConfig.user,
              password: mysqlConfig.password,
              database: mysqlConfig.database
            },
            'mysqlConfig'
          )

          dbObj.client = createConnection({
            host: mysqlConfig.host,
            user: mysqlConfig.user,
            password: mysqlConfig.password,
            database: mysqlConfig.database
          })

          dbObj.client.connect(function (err) {
            if (err) {
              Log.logError('error when connecting to db:', err)
              // setTimeout(handleConnect, 2000)
            } else {
              console.log('====connect mysql done=====')
              resolve(dbObj)
            }
          })

          var onError = function (err) {
            Log.log('db error', err)
            // 如果是连接断开，自动重新连接
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
              // dbObj.client.off('error',onError );
              // dbObj.client.disconnect()
              Log.info('[mysql PROTOCOL_CONNECTION_LOST to destory and connnect]')
              dbObj.client.destroy()
              // handleConnect()
            } else {
              Log.info('[mysql error:]', err)
              dbObj.client.destroy()
              // handleConnect()
            }
          }
          //断线后重连
          dbObj.client.on('error', onError)

          dbObj.client.on('connect', function () {
            Log.info('mysql  connnect!!!!')
            resolve(dbObj)
          })
        }
        handleConnect()
      })
    },
    destroy: function (dbObj) {
      Log.info('We are going to destroy')
      return new Promise(function (resolve) {
        dbObj.client.on('end', function () {
          resolve(dbObj)
        })
        dbObj.client.end() // Use end() method instead of disconnect()
      })
    }
  }
  return createPool(factory as any, { max: 10, min: 2 })
}

export { createMysqlPool }
