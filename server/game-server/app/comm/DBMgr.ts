import { Application } from 'pinus'
import MysqlService, { MysqlValueTypes } from '../services/mysqlService'
import RedisService, { CommDataType } from '../services/redisService'
import Log from '../utils/log'
import { PlayerInfo } from '../../proto/DataDefine'
import { GameMgr } from './GameMgr'



//数据存储的key运算
export class DBStructKeys {
  public static getUserKey(uid: string) {
    return 'userInfo_' + uid
  }
}



export class DBMgr {
  public static _ins: DBMgr = null
  
  public mysqlInstance: MysqlService
  public redisInstance: RedisService

  
  //单键类入口
  public static ins(): DBMgr {
    if (DBMgr._ins == null) {
      DBMgr._ins = new DBMgr();
      DBMgr._ins.init();
    }
    return DBMgr._ins;
  }
  

  //初始化
  public init(){
    GameMgr.app.loadConfig('dbConfig', GameMgr.app.getBase() + '/config/dbConfig')
    const dbConfig = GameMgr.app.get('dbConfig')

    this.mysqlInstance = new MysqlService(GameMgr.app, dbConfig)
    this.redisInstance = new RedisService(GameMgr.app, dbConfig.redis.host, dbConfig.redis.port, dbConfig.redis.db)
    Log.info(`Start to create mysql service --- config: ${JSON.stringify(dbConfig)}`)
    Log.info(`Start to create redis service --- host=${dbConfig.redis.host} port=${dbConfig.redis.port} db=${dbConfig.redis.db}`)
  }  


  
  // 读操作，先读redis，读不到再读mysql
  static async readPlayerInfo(uid: string): Promise<PlayerInfo> {

    // 尝试redis
    const [err, data] = await DBMgr.ins().redisInstance.checkDataFromRedis(DBStructKeys.getUserKey(uid))
    if (!err && data) {
      try {
        const playerInfo = JSON.parse(data) as PlayerInfo;
        return playerInfo;
      } catch (e) {
        Log.logError('Failed to parse playerInfo as json: ', data)
      }
    }


    //读数据库
    try {
      const result = await DBMgr.ins().mysqlInstance.getValue(uid, MysqlValueTypes.PlayerInfo)
      Log.info('Mysql querying result: ', result)

      if (result.length) {
        const playerInfo = JSON.parse(result[0].playerInfo)
        // 写入redis
        await DBMgr.ins().redisInstance.saveDataToRedis(DBStructKeys.getUserKey(uid), CommDataType.string, result[0].playerInfo);
        return playerInfo;
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }
  }


  // 写操作，先写mysql，再写redis //返回错误码
  static async writePlayerInfo(playerInfo: PlayerInfo): Promise<number> {
    const{uid} = playerInfo;

    try {
      await DBMgr.ins().mysqlInstance.savePlayerInfo(playerInfo)
      await DBMgr.ins().redisInstance.saveDataToRedis(DBStructKeys.getUserKey(uid), CommDataType.string, JSON.stringify(playerInfo))
      return 0;
      
    } catch (e) {
      Log.logError("writePlayerInfo error,uid=",uid,",ERROR:",JSON.stringify(e));
      return -1;
    }
  }
}