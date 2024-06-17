import { Application } from 'pinus'
import Log from '../utils/log'

var utils = require('../util/utils')

class PlayerMsgService {
  constructor(private app: Application) {}

  async pushMessageByUids(sessionDatas, route, msg, cb) {
    if (!sessionDatas) {
      utils.myPrint('sessionDatas is empty')
      return
    }
    const channelService = this.app.get('channelService')
    return new Promise((resolve, reject) => {
      channelService.pushMessageByUids(route, msg, sessionDatas, function (err, fails) {
        if (err) {
          this.errHandler(err, fails)
          reject(err)
        } else {
          resolve({})
        }
      })
    })
  }

  pushMessageToPlayer = function (uid: string, sid: string, route, msg) {
    return this.pushMessageByUids([{ uid: uid, sid: sid }], route, msg)
  }

  errHandler(err, fails) {
    if (!!err) {
      Log.logError('Push Message error! %j', err.stack)
    }
  }
}

export default PlayerMsgService
