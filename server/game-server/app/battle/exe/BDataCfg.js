import { BufCfg } from './define/BufCfg.js'
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
