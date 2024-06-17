import { BufCfg } from './define/BufCfg'
import { BUtils } from './BUtils'

export class BDataCfg {
  public static ins: BDataCfg = new BDataCfg()
  public dataMap: Object = {}

  public init(cfgFilepath: string) {
    let rawData = BUtils.fileReadObj(cfgFilepath)
    this.loadDataByJsonSvr(rawData)
  }

  public getSet(setName: string): object {
    return this.dataMap[setName]
  }

  public getCfg(setName: string, id: number) {
    let myset = this.dataMap[setName]
    if (myset == null) return null
    return myset[id]
  }

  //=====================================================
  //=====================================================

  public getSkillCfg(id: number): Object {
    let cfg = BDataCfg.ins.getCfg('SkillCfg', id)
    return cfg
  }

  public getBufCfg(bufId: number): BufCfg {
    let cfg: BufCfg = BDataCfg.ins.getCfg('BufCfg', bufId)

    return cfg
  }

  public getRestrainVal(type1: number, type2: number): number {
    let cfg = BDataCfg.ins.getCfg('PetTypeCfg', type1)
    let n = type2 - 1
    return cfg['restrainList'][n]
  }

  public getPetCfg(id: number): Object {
    return BDataCfg.ins.getCfg('PetCfg', id)
  }

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
      this.dataMap[setName] = dstDataBlock
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
      this.dataMap[setName] = dstDataBlock
    }
  }
}
