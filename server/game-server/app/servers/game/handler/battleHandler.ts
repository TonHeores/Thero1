import { Application, BackendSession } from 'pinus'
import { BaseHandler } from '../../../comm/BaseHandler'
import { HeroInfo, PkgBattleInitData, TroopInfo } from '../../../battle/define/BattlePkgData'
import { Battle } from '../../../battle/Battle'
import { ConfigMgr } from '../../../comm/ConfigMgr'
import { BattleFightMatchReq, BattleFightMatchRsp } from '../../../../proto/ProtoPackage'
import { ItemInfo } from '../../../../proto/DataDefine'
import { AttrType, TaskType } from '../../../../proto/ConstDefine'
import { Task } from '../../../game/task'

 class BattleHanlder extends BaseHandler {
  async fightMatch(req: BattleFightMatchReq, session: BackendSession) {
    //初始化
    if ((await this.loadPlayer(req, session)) == false) return this.onError()

    const { playerInfo } = this.player

    //战斗启动数据
    let initData: PkgBattleInitData = new PkgBattleInitData()

    //玩家
    let heroInfo1: HeroInfo = new HeroInfo()
    heroInfo1.attrs = playerInfo.heroAttrs
    initData.troopInfos[0].heroInfos.push(heroInfo1)

    //怪物
    let heroInfo2: HeroInfo = new HeroInfo()
    let matchCfg = ConfigMgr.getCfg('MatchInfoCfg', playerInfo.curMatchLv)
    let matchChapterCfg = ConfigMgr.getCfg('MatchChapterCfg', matchCfg["chapter"]);

    heroInfo2.attrs = matchCfg['heroAttrs']
    initData.troopInfos[1].heroInfos.push(heroInfo2)

    let battle: Battle = new Battle()
    battle.init(initData)
    battle.battleType = 2 //THero需指定为2
    battle.running()

    //挂接任务监听器
    Task.addTaskStatEvent(this.player,TaskType.StatMatchFight);

    //胜利处理
    let retRewardInfos:Map<number,number> = new Map();
    let rewardInfos: ItemInfo[] = []
    if (battle._winner == 1) {
      //关卡进一
      playerInfo.curMatchLv++

      //发放奖励（进攻者winner=1）
      rewardInfos = matchCfg['rewardInfos']
      for (let i = 0; i < rewardInfos.length; i++) {
        const{type,count} = rewardInfos[i];
        playerInfo.items[type] += count;

        if(retRewardInfos[type]==null)retRewardInfos[type]=0;
        retRewardInfos[type] +=count;
      }

      //如果是boss关，就要发放boss奖励
      if(matchCfg["bossFlag"]==1){
          //发放奖励（进攻者winner=1）
        let bossRewardInfos = matchChapterCfg['rewardInfos']
        for (let i = 0; i < bossRewardInfos.length; i++) {
          const{type,count} = bossRewardInfos[i];
          playerInfo.items[type] += count;

          if(retRewardInfos[type]==null)retRewardInfos[type]=0;
          retRewardInfos[type] +=count;
        }
      }
    }

    //返回
    let rsp: BattleFightMatchRsp = new BattleFightMatchRsp()

    rsp.battlePackage = battle.pkg.data //战斗包
    rsp.battleInitData = battle.pkg.initData; //战斗初始包

    for(let i=0;i<retRewardInfos.keys.length;i++){
      let key = retRewardInfos.keys[i];
      let itemInfo:ItemInfo =new ItemInfo();
      itemInfo.type = key;
      itemInfo.count = retRewardInfos[key];
      rsp.rewardInfos.push(itemInfo);
    }
    
    rsp.rewardInfos = rewardInfos
    rsp.playerInfo = playerInfo

    return this.response(rsp)
  }
}

export default (app: Application) => {
  return new BattleHanlder(app)
}
