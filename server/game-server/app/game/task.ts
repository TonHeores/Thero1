import { PlayerInfo, TaskCfg } from "../../proto/DataDefine";
import { ItemType, TaskMode, TaskType } from "../../proto/ConstDefine";
import { ConfigMgr } from "../comm/ConfigMgr";
import { Player } from "./player";

export class Task{


  
  //挂接任务监听
  public static addTaskStatEvent(player:Player,taskType: TaskType) {

    //成就项累计
    let task = player.playerInfo.task;

    let myStats = task.achieveSumStats;
    if (myStats[taskType] == null) myStats[taskType] = 0;
    myStats[taskType]++;

    //主线任务监听
    if (task.mainTaskMode == TaskMode.Stat && task.mainTaskType == taskType) {
      task.mainTaskStatCount++;

      let taskCfg:TaskCfg = ConfigMgr.getCfg("MainTaskCfg",task.mainTaskId);
      if(Task.checkTaskFinished(player,taskCfg)){
        player.playerInfo.task.mainTaskFinishedFlag = true;
        player.notifyMainTaskFinish(); //下推任务完成提示
      }
    }
  }
  

  //完成主线任务
  public static checkTaskFinished(player:Player,taskCfg: TaskCfg):boolean {

    let playerInfo = player.playerInfo;

    if(taskCfg==null)return false;
    let isFinished = false;

    if (taskCfg.taskMode == TaskMode.Stat) {
      //统计型任务，判断statCount
      if (taskCfg.pars[0] <= playerInfo.task.mainTaskStatCount) {
        isFinished = true
      }
    } else if (taskCfg.taskMode == TaskMode.Sum) {
      //累计型任务，判断statCount
      if (taskCfg.pars[0] <= playerInfo.task.achieveSumStats[taskCfg.taskType]) {
        isFinished = true
      }
    } else {
      //校验类任务
      switch (taskCfg.taskType) {
        //1 主角等级
        case TaskType.RoleLv: {
          if (taskCfg.pars[0] <= playerInfo.lv) {
            isFinished = true
          }
          break
        }
        //2 宝箱等级
        case TaskType.ChestLv: {
          if (taskCfg.pars[0] <= playerInfo.chestLevel) {
            isFinished = true
          }
          break
        }
        //3 关卡等级
        case TaskType.MatchLv: {
          if (taskCfg.pars[0] <= playerInfo.curMatchLv) {
            isFinished = true
          }
          break
        }
        //4 战力达成
        case TaskType.BattlePower: {
          if (taskCfg.pars[0] <= playerInfo.battlePower) {
            isFinished = true
          }
          break
        }
        //5 拥有资源
        case TaskType.HaveGold: {
          if (taskCfg.pars[1] <= playerInfo.items[ItemType.GoldCoin]) {
            isFinished = true
          }
          break
        }

      }
    }

    return isFinished;
  }

  
}