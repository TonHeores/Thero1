import { Application } from 'pinus'
import { ConfigMgr } from '../comm/ConfigMgr'
import { AttrType, Consts, ItemType, TaskMode, TaskType } from '../../proto/ConstDefine'
import Log from '../utils/log'
import HelpUtil from '../utils/helpUtil'
import { Task } from './task'
import { PlayerInfo } from '../../proto/DataDefine'
import { CommUtil } from '../../proto/CommUtil'
import { Chest } from './chest'
import PlayerMgr from '../comm/PlayerMgr'
import { GameMgr } from '../comm/GameMgr'

export class Player {
  public playerInfo: PlayerInfo;


  constructor(playerInfo: PlayerInfo) {
    this.playerInfo = playerInfo;
  }


  //计算英雄属性值（还有战力哦！)
  public updateHeroAttrs() {
    this.playerInfo.heroAttrs = new Array(26).fill(0);

    let roleCfg = ConfigMgr.getCfg("RoleLevelCfg", this.playerInfo.lv);
    if (roleCfg == null) return;

    for (let i = Consts.AttrTypeBaseMin; i <= Consts.AttrTypeBaseMax; i++) {
      this.playerInfo.heroAttrs[i] = roleCfg["baseAttrs"][i] ?? 0;
    }

    this.playerInfo.equips
      .filter(equip => !!equip)
      .forEach(equip => {
        const { attrInfos = [] } = equip
        attrInfos.forEach(attr => {
          this.playerInfo.heroAttrs[attr.attrId] += attr.attrVal
        })
      })

    this.playerInfo.heroAttrs = this.playerInfo.heroAttrs.map(attr => HelpUtil.formatNumber(attr))

    //计算战力
    CommUtil.calcBattlePower(this.playerInfo.heroAttrs);
  }


  //定时更新处理
  public async checkUpdateData(): Promise<boolean> {

    let isUpdate = false;

    //player层面
    //这里把装备baseAttr重算一下
    for (let i = Consts.AttrTypeBaseMin; i <= Consts.AttrTypeBaseMax; i++) {
      this.playerInfo.heroAttrs[i] = Math.floor(this.playerInfo.heroAttrs[i]);
    }

    //宝箱
    if (Chest.checkUpdateData(this)) isUpdate = true;

    //有更新就要存储！
    if (isUpdate) {
      Log.info('Userinfo isUpdate');
      await this.saveData();
    }
    return isUpdate;
  }



  //=====================================================================================
  //  
  //=====================================================================================

  //ccg0518，加经验接口
  public addExp(exp: number) {
    this.playerInfo.exp += exp

    //升等级
    let isLevelUp: boolean = false
    let roleLvCfg = ConfigMgr.getCfg('RoleLevelCfg', this.playerInfo.lv)
    Log.info('Start to check userUpgrade... ')
    while (this.playerInfo.exp > roleLvCfg.exp) {
      this.playerInfo.lv++
      isLevelUp = true
      this.playerInfo.exp -= roleLvCfg.exp //升级之后exp要减去上一级exp，就是当前exp的值。
    }

    if (isLevelUp) {
      this.notifyRoleLevelUp()
    }
  }

  //加金币
  public addGold(gold: number) {
    this.addItem(ItemType.GoldCoin, gold)
  }

  //给player加东西 
  public addItem(type: number, count: number) {
    this.playerInfo.items[type] += count

    //任务监听
    if (type == ItemType.GoldCoin) {
      Task.addTaskStatEvent(this, TaskType.StatGetGold)
    } else if (type == ItemType.ChestCount) {
      this.onChestCountChange(count)
    }
  }

  //给player扣东西
  public reduceItem(type: number, count: number) {
    this.playerInfo.items[type] -= count

    //任务监听
    if (type == ItemType.GoldCoin) {
    } else if (type == ItemType.ChestCount) {
      this.onChestCountChange(-count)
    }
  }

  //加宝箱
  public async onChestCountChange(changeCount) {
    //判断是否停止自增 逻辑是大于等于50（Const.ChestSupplyMaxCount）后就不自增了
    //  假如改变之前>=50 改变之后<50 就刷新最后更新时间为now ，也就是下次自增从现在开始计时
    // 注意 全部箱子增减逻辑必须经过这里，以免导致时间更新不准确
    if (this.playerInfo.items[ItemType.ChestCount] < Consts.ChestSupplyMaxCount) {
      let OriNum = this.playerInfo.items[ItemType.ChestCount] - changeCount
      if(OriNum >=50){
        let now = Date.now()
        this.playerInfo.chestLastAddTime = CommUtil.getLastWholeHour(now).valueOf()
        console.log("change chestLastAddTime============")
      }
    }
    //最大数量保护
    if (this.playerInfo.items[ItemType.ChestCount] > Consts.MaxChestCount) {
      this.playerInfo.items[ItemType.ChestCount] = Consts.MaxChestCount;
    }
    Log.info('checkAutoAddCountStatus chestCount to: ', this.playerInfo.items[ItemType.ChestCount])

    //下推宝箱包更新
    await this.notifyChestCount();
  }





  //=====================================================================================
  //  
  //=====================================================================================


  //下推角色升级信息
  public async notifyRoleLevelUp() { }

  public async notifyMainTaskFinish() { }


  //下推宝箱升级成功信息
  public async notifyChestLevelUp() {

  }


  public async notifyChestCount() {


  }


  public async saveData() {
    await PlayerMgr.savePlayer(this);
  }

}
