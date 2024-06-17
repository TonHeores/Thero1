import { pinus } from 'pinus'
import { preload } from './preload'
import PlayerMgr from './app/comm/PlayerMgr'
import Log from './app/utils/log'
import { gameRoute } from './app/utils/routeUtil'
import { config } from 'dotenv'
import { resolve } from 'path'
import { GameMgr, Services } from './app/comm/GameMgr'
import { DBMgr } from './app/comm/DBMgr'

// import * as fs from 'fs'
// import * as tls from 'tls'

config({
  path: resolve(__dirname, '.env')
})

/**
 *  替换全局Promise
 *  自动解析sourcemap
 *  捕获全局错误
 */
preload()

/**
 * Init app for client.
 */
const app = pinus.createApp()
app.set('name', 'thero')
GameMgr.app = app;

// const sslKeyPath = '../shared/server.key'
// const sslCertPath = '../shared/server.crt'

// FIXME: 添加了认证以后无法访问了
// function readCertsSync() {
//   return {
//     key: fs.readFileSync(sslKeyPath),
//     cert: fs.readFileSync(sslCertPath)
//   }
// }

// app configuration
app.configure('production|development', 'connector', function () {
  // const sslOpt: tls.SecureContextOptions = readCertsSync()
  app.set('connectorConfig', {
    connector: pinus.connectors.hybridconnector,
    heartbeat: 3,
    useDict: true,
    useProtobuf: true
    // ssl: sslOpt,
    // sslWatcher: cb => {
    //   fs.watch(sslKeyPath, () => {
    //     cb(readCertsSync())
    //   })
    // }
  })

  DBMgr.ins().init();
  app.set(Services.DatabaseService, DBMgr.ins());

  // const playerMgr = new PlayerMgr()
  // app.set(Services.PlayerMgr, playerMgr)

  app.set('serverConfig', {
    reloadHandlers: true
  })
})

app.configure('production|development', 'game', function () {
  try {
    DBMgr.ins().init();

    app.set(Services.DatabaseService, DBMgr.ins())
    // 玩家数据管理
    // const playerMgr = new PlayerMgr(app)
    // app.set(Services.PlayerMgr, playerMgr)
    app.set('rpc', true)
  } catch (e) {
    console.log('-------------')
    console.log(e)
  }
})

// app configure
app.configure('production|development', function () {
  Log.log('Request comes....')
  // route configures
  app.route('game', gameRoute)

  // filter configures
  app.filter(new pinus.filters.timeout())
})

app.configure('development', function () {
  // enable the system monitor modules
  app.enable('systemMonitor')
})

// if (app.isMaster()) {
//   app.use(createRobotPlugin({ scriptFile: __dirname + '/robot/robot.js' }))
// }

// start app
app.start()
