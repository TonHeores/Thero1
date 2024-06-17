import { dispatch } from './dispatcher'
import Log from './log'

const gameRoute = function (session, msg, app, cb) {
  Log.info('Request come to gameRoute')
  var gameServers = app.getServersByType('game')

  if (!gameServers || gameServers.length === 0) {
    cb(new Error('can not find game servers.'))
    return
  }

  var res = dispatch(session.get('rid'), gameServers)
  cb(null, res.id)
}

export { gameRoute }
