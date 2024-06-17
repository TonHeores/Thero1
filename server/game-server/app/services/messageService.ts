import { Application } from 'pinus'
import Log from '../utils/log'

class MessageService {
  uid2sidMap: Record<string, { uid: string; sid: string; brocastKey: boolean }>
  constructor(private app: Application) {
    this.uid2sidMap = {}
  }

  addRecore(uid: string, sid: string, brocastKey: boolean = false) {
    Log.info(0, 'addRecore:', uid)
    if (!this.uid2sidMap[uid]) {
      this.uid2sidMap[uid] = {
        uid,
        sid,
        //把分组加上，默认情况下可以不用填
        brocastKey
      }
    } else {
      this.uid2sidMap[uid].sid = sid
    }
  }

  remoteRecore(uid: string) {
    Log.info(0, 'removeRecord:', uid)
    delete this.uid2sidMap[uid]
  }

  getSid(uid: string) {
    var sessionData = this.uid2sidMap[uid]
    if (sessionData) {
      return sessionData.sid
    }
    return 0
  }

  async pushMessageByUids(sessionDatas, route, msg) {
    if (!sessionDatas) {
      Log.logWarn('sessionDatas is empty')
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

  pushMessageToPlayer = function (uid: string, route, msg, cb) {
    var sessionData = this.uid2sidMap[uid]
    if (!sessionData) {
      Log.logWarn('pushMessageToPlayer [sessionData] is empty')
      return
    }

    //add log
    //utils.log("pushMessageToPlayer."+route,msg);
    this.pushMessageByUids([sessionData], route, msg, cb)
  }

  notifyAll(route, msg, cb, brocastKey) {
    var sessionDataList = []
    Log.trace('notifyAll start', this.uid2sidMap)
    for (var uid in this.uid2sidMap) {
      var sessionData = this.uid2sidMap[uid]
      Log.trace('notifyAll:', 'uid:', uid, 'brocastKey:', brocastKey, 'sessionData.brocastKey:', sessionData.brocastKey)
      if (brocastKey) {
        if (sessionData.brocastKey == brocastKey) {
          sessionDataList.push(sessionData)
        }
      } else {
        sessionDataList.push(sessionData)
      }
    }
    if (sessionDataList.length > 0) {
      this.pushMessageByUids(sessionDataList, route, msg)
    }
  }

  errHandler(err) {
    if (!!err) {
      Log.logError('Push Message error! %j', err.stack)
    }
  }
}

export default MessageService
