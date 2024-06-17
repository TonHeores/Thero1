import { BufCfg } from './define/BufCfg'
export class SkillCfg {
  constructor() {
    this.skillId = 0
    this.skillName = ''
    this.skillType = 0
    this.skillActType = 0 //SkillActType
    this.actRate = 0 //触发概率(百分)
    this.BufIds = []
    //.....
  }
}
export class BDataCfg {
  constructor() {
    this.dataMap = {}
    // //标准json
    // private loadDataByJson1(cfgJsonFile:string){
    //     for(let setName in g_jsonData){
    //         let srcDataBlock = g_jsonData[setName];
    //         this.dataMap[setName]= srcDataBlock["d"];
    //     }
    // }
    // //压缩表头的json
    // private loadDataByJson2(cfgJsonFile:string){
    //     HeroInfo
    //     for(let setName in g_jsonData){
    //         let srcDataBlock = g_jsonData[setName];
    //         let srcDataTitle = srcDataBlock["t"];
    //         let srcDataContent= srcDataBlock["d"];
    //         let dstDataBlock={}
    //         for(let i=0;i<srcDataContent.length;i++){
    //             let srcDataInfo = srcDataContent[i];
    //             let dstDataInfo={};
    //             let id = srcDataInfo[0];
    //             for(let j=0;j<srcDataInfo.length;j++){
    //                 dstDataInfo[srcDataTitle[j]]=srcDataInfo[j];
    //             }
    //             dstDataBlock[id]=dstDataInfo;
    //         }
    //         this.dataMap[setName]= dstDataBlock
    //     }
    // }
  }
  //统一大入口！！！
  init(cfgJsonFile) {}
  getSet(setName) {
    return this.dataMap[setName]
  }
  getCfg(setName, id) {
    return this.dataMap[setName][id]
  }
  //=====================================================
  //=====================================================
  getSkillCfg(skillId, lv) {
    let cfg = new SkillCfg()
    return cfg
  }
  getBufCfg(bufId) {
    let cfg = new BufCfg()
    return cfg
  }
}
BDataCfg.ins = new BDataCfg()
