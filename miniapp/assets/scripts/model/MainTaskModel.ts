import { sys } from "cc";
import Constants from "../Constant";
import SoundMgr from "../UIFrame/SoundMgr";
import { UIManager } from "../UIFrame/indexFrame";
import { CHECK_KEY, SOUND_RES } from "../config/basecfg";
import { ItemType } from "../utils/pomelo/ConstDefine";
import { PomeloMgr } from "../utils/pomelo/PomeloMgr";
import PomeloUtil from "../utils/pomelo/PomeloUtil";
import { TaskMainTaskFinishReq, TaskMainTaskFinishRsp } from "../utils/pomelo/ProtoPackage";
import { NotifyRoute, RequestRoute } from "../utils/pomelo/ProtoRoute";
import UserModel from "./UserModel";

export default class MainTaskModel {
    static init() {
        PomeloMgr.onEventHandler(NotifyRoute.MainTaskFinish, this.notifyMainTaskFinish,this);
    }

    static notifyMainTaskFinish(data){
        console.log("notifyMainTaskFinish",data)
    }

    static reset() {
    }

    //领取任务奖励
    static taskReward(){
        let data:TaskMainTaskFinishReq = new TaskMainTaskFinishReq()
        console.log("taskReward================",data)
        let self = this
        PomeloMgr.instance.send(RequestRoute.TaskFinishMainTask,data,function(rsp){
            console.log("taskReward rsp================",rsp)
            let netRsp =   rsp  as TaskMainTaskFinishRsp
            if(PomeloUtil.checkRsp(netRsp)){
                console.log(netRsp);
                //获取宝箱统计
                let saveKey = CHECK_KEY.GETBOXCOUNT + "_check_"+ netRsp.playerInfo.uid;
                let hasNum = sys.localStorage.getItem(saveKey) ? sys.localStorage.getItem(saveKey) : 0;
                let addNum = netRsp.playerInfo.items[ItemType.ChestCount] - UserModel.getItemByType(ItemType.ChestCount)
                let saveNum = Number(hasNum) + addNum
                sys.localStorage.setItem(saveKey,saveNum);

                UserModel.updateAccoutInfo(netRsp.playerInfo)
            }
        });
    }
    
}