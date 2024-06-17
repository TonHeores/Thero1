import { readFileSync } from 'fs'
import Log from '../utils/log'
import * as gameDataConfig from '../../datas/server_game_data.json'

export class ConfigMgr {
  public static _ins: ConfigMgr = null
  public _dataMap: Object = {}

  //单键类入口
  //ConfigMgr.getCfg();
  public static ins(): ConfigMgr {
    if (ConfigMgr._ins == null) {
      ConfigMgr._ins = new ConfigMgr()
      ConfigMgr._ins.loadDataByJsonSvr(gameDataConfig)
    }
    return ConfigMgr._ins
  }

  public static init(cfgFilepath: string) {
    let rawData = ConfigMgr.fileReadObj(cfgFilepath)
    ConfigMgr.ins().loadDataByJsonSvr(rawData)
  }

  public static getSet(setName: string):Array<any> {
    return ConfigMgr.ins()._dataMap[setName];
  }

  public static getCfg(setName: string, key: any) {
    let myset = ConfigMgr.ins()._dataMap[setName];
    if (myset == null) return null
    return myset[key];
  }





  //读取global设置
  public static getGlobalSetting(key: string) {
    let mycfg = ConfigMgr.getCfg("GlobalCfg",key)
    if (mycfg == null) return null;
    return mycfg?.val;
  }




  public static fileReadObj(filepath: string): object {
    let str = readFileSync(filepath, 'utf8')
    if (str == '') return null
    let obj = JSON.parse(str)
    return obj
  }
  // public getRestrainVal(type1: number, type2: number): number {
  //   let cfg = BDataCfg.ins.getCfg('PetTypeCfg', type1)
  //   let n = type2 - 1
  //   return cfg['restrainList'][n]
  // }




  //压缩表头的json
  private loadDataByJsonClt(rawData: object) {
    for (let setName in rawData) {
      let srcDataBlock = rawData[setName]
      let srcDataTitle = srcDataBlock['t']
      let srcDataContent = srcDataBlock['d']

      let dstDataBlock = {}
      for (let i = 0; i < srcDataContent.length; i++) {
        let srcDataInfo = srcDataContent[i]
        let dstDataInfo = {}
        let id = srcDataInfo[0]

        for (let j = 0; j < srcDataInfo.length; j++) {
          dstDataInfo[srcDataTitle[j]] = srcDataInfo[j]
        }
        dstDataBlock[id] = dstDataInfo
      }
      this._dataMap[setName] = dstDataBlock
    }
  }

  //标准json
  private loadDataByJsonSvr(rawData: object) {
    for (let setName in rawData) {
      let srcDataBlock = rawData[setName]
      let srcDataTitle = srcDataBlock['t']
      let srcDataContent = srcDataBlock['d']

      let keyName: string = srcDataTitle[0]
      let dstDataBlock = {}
      for (let i = 0; i < srcDataContent.length; i++) {
        let dstDataInfo = srcDataContent[i]
        let id = dstDataInfo[keyName]
        dstDataBlock[id] = dstDataInfo
      }
      this._dataMap[setName] = dstDataBlock
      Log.info(`Cfg add ${setName}: `, dstDataBlock)
    }
  }
}
