import { Application, BackendSession } from 'pinus'
import { BaseHandler } from '../../../comm/BaseHandler'
import { HeroInfo, PkgBattleInitData, TroopInfo } from '../../../battle/define/BattlePkgData'
import { ConfigMgr } from '../../../comm/ConfigMgr'
import { ItemType, TaskMode, TaskType } from '../../../../proto/ConstDefine'
import { ItemInfo, TaskCfg } from '../../../../proto/DataDefine'
import { TaskAchieveTaskFinishReq, TaskAchieveTaskFinishRsp, TaskMainTaskFinishReq, TaskMainTaskFinishRsp } from '../../../../proto/ProtoPackage'
import { Task } from '../../../game/task'

 class TaskHanlder extends BaseHandler {
 
 
  //完成主线任务
  async finishMainTask(req: TaskMainTaskFinishReq, session: BackendSession) {
    if ((await this.loadPlayer(req, session)) == false) return this.onError()

    const { playerInfo } = this.player

    //let taskCfg:TaskCfg = ConfigMgr.getCfg("MatchInfoCfg",taskId);
    let taskCfg: TaskCfg = ConfigMgr.getCfg('MainTaskCfg', playerInfo.task.mainTaskId)
    let isFinished = Task.checkTaskFinished(this.player,taskCfg)
    if (isFinished == false) {
      return this.onError('The task is not finished') //错了吧？作弊！
    }

    //发奖品
    for (let i = 0; i < taskCfg.rewardInfos.length; i++) {
      let itemInfo: ItemInfo = taskCfg.rewardInfos[i]
      this.player.addItem(itemInfo.type, itemInfo.count)
      if(itemInfo.type == ItemType.Exp){
        console.log("addExp==============================="+itemInfo.count)
        this.player.addExp(itemInfo.count)
      }
    }
    //任务进一！
    playerInfo.task.mainTaskId++
    playerInfo.task.mainTaskStatCount = 0
    playerInfo.task.mainTaskFinishedFlag = false

    //返回包
    let rsp: TaskMainTaskFinishRsp = new TaskMainTaskFinishRsp()
    rsp.playerInfo = playerInfo
    rsp.rewardInfos = taskCfg.rewardInfos
    return this.response(rsp)
  }


  //完成成就任务
  public async finishAchieveTask(req: TaskAchieveTaskFinishReq, session: BackendSession) {
    if ((await this.loadPlayer(req, session)) == false) return this.onError()

    const { playerInfo } = this.player
    let taskCfg: TaskCfg = ConfigMgr.getCfg('AchieveTaskCfg', req.taskId)
    if (taskCfg == null) {
      return this.onError('curr taskCfg is empty.taskId=' + req.taskId) //被领过了啊？作弊！
    }

    if (playerInfo.task.achieveTaskFlags[req.taskId] == true) {
      return this.onError('curr task have been fetch.taskId=' + req.taskId) //被领过了啊？作弊！
    }

    let isFinished = Task.checkTaskFinished(this.player,taskCfg)
    if (isFinished == false) {
      return this.onError('The task is not finished') //错了吧？作弊！
    }

    //发奖品
    for (let i = 0; i < taskCfg.rewardInfos.length; i++) {
      let itemInfo: ItemInfo = taskCfg.rewardInfos[i]
      this.player.addItem(itemInfo.type, itemInfo.count)
    }
    //已领取标记！
    playerInfo.task.achieveTaskFlags[taskCfg.taskId] = true

    //返回包
    let rsp: TaskAchieveTaskFinishRsp = new TaskAchieveTaskFinishRsp()
    rsp.playerInfo = playerInfo
    rsp.rewardInfos = taskCfg.rewardInfos
    return this.response(rsp)
  }

}

export default (app: Application) => {
  return new TaskHanlder(app)
}
