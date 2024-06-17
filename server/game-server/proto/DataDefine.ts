import { Consts } from "./ConstDefine"

export class PlayerInfo {
  public uid: string //用户唯一标识号

  public lv: number
  public exp: number

  public name: string
  public gender:number; //性别 1=男，2=女
  public titleId: number //称号
  public platformUid: number
  public avatar?: string

  public curEquip: EquipInfo | null // 刚刚拿到还没穿戴的装备
  public chestUpgradeFinishTime: number // 宝箱升级冷却时间

  //宝箱次数
  //宝箱生成时间（定期增加次数——未确定方案）
  public chestLevel: number //宝箱等级
  public chestLastAddTime: number // 上一次自动生成宝箱的时间

  //关卡信息（当前关卡等级，ccg改05/17)
  public curMatchLv: number

  //装备信息（1-12）equips[AtttrType]
  public equips: EquipInfo[] = new Array(Consts.EquipPartCount + 1).fill(null);

  //英雄属性信息(0位放空)
  public heroAttrs: number[] = new Array(Consts.AttrCount + 1).fill(0);

  // 物品数量(0位放空)
  public items: number[] = new Array(Consts.ItemTypeCount + 1).fill(0);

  


  //战斗属性 heroAttrs[AttrType]=attrVal;
  public battlePower: number //战力

  //任务信息
  public task: TaskObj = new TaskObj()
}

export class TaskObj {
  public mainTaskId: number = 1 //当前主线任务id，从1开始
  public mainTaskMode: number = 0 //当前任务模式
  public mainTaskType: number = 0 //当前任务类型
  public mainTaskFinishedFlag: boolean = false //任务完成标记
  public mainTaskStatCount: number = 0 //当前主线任务统计数

  public achieveSumStats: Map<number, number> = new Map<number, number>() //成就累积统计 <taskType, sum>
  public achieveTaskFlags: Map<number, boolean> = new Map<number, boolean>() //成就任务标记（0=未领取，1=已领取）<taskId, 是否已領取>

  public matchChapterTaskFlags: boolean[] = [] //关卡章节任务标记（0=未领取，1=已领取）
  //主线任务不需要！
}

export class EquipInfo {
  equipId: number
  lv: number
  attrInfos: AttrInfo[] = []
}

export class AttrInfo {
  attrId: number
  attrVal: number
}

export class ItemInfo {
  public type: number
  public count: number
}

//===============================================================\
// 配置表
//===============================================================\

export class TaskCfg {
  public taskId: number
  public taskType: number
  public taskMode: number
  public pars: number[]
  public rewardInfos: ItemInfo[]
}
