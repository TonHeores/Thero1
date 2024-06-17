import Constants, { EventName } from "../Constant";
import { EventCenter, UIManager } from "../UIFrame/indexFrame";
import Redux from "../redux";
import State from "../redux/state";
import { ConfigHelper } from "../utils/ConfigHelper";
import { ItemType } from "../utils/ConstDefine";
import  ConstEnum  from "../utils/EnumeDefine";
import GameUtils from "../utils/GameUtils";
import Common from "../utils/common";
import Ext from "../utils/exts";
import { AttrInfo, EquipInfo, PlayerInfo } from "../utils/pomelo/DataDefine";
import { PomeloNetEvent, RetCode } from "../utils/pomelo/GCode";
import { PomeloMgr } from "../utils/pomelo/PomeloMgr";
import PomeloUtil from "../utils/pomelo/PomeloUtil";
import { GmExeGmCmdReq, GmExeGmCmdRsp, RoleChangeGenderReq, RoleChangeGenderRsp, RoleChangeNameReq, RoleChangeNameRsp, RoleEnterGameReq, RoleEnterGameRsp, RoleUpdateDataReq, RoleUpdateDataRsp } from "../utils/pomelo/ProtoPackage";
import { RequestRoute } from "../utils/pomelo/ProtoRoute";

export default class UserModel {
    public static myTs = 0;
    public static isInGame = false
    public static countDownObj = {
        chestUpgradeTs: 0,//宝箱升级剩余时间
        chestAutoAddTs: 0,//宝箱+1剩余时间
    }
    static init() {
        // PomeloMgr.onEventHandler(PomeloNetEvent.NET_ONLOGIN, this.onLogin,this);
        GameUtils.resetAllCheckremenber()
        this.myTs = new Date().valueOf();
    }

    //后台检测token 后自动登陆 用于重连或者静默登陆
    static silenceLogin() {
        let token = localStorage.getItem("THeroToken")
        let userName = "play"+token
        let userImgUri = ""
        let platFormType = 1
        UserModel.login(token,userName,userImgUri,platFormType)
    }

    static login(token,username,userImg,platform) {
        console.log("login================")
        let req = new RoleEnterGameReq
        req.token = token
        req.platFormType = platform
        req.userImgUri = userImg
        username = username
        PomeloMgr.instance.send(RequestRoute.LoginEnterGame, req, function (rsp) {
            console.log("rsp================", rsp)
            UIManager.hideWaiting()
            let netRsp =   rsp  as RoleEnterGameRsp
            if(PomeloUtil.checkRsp(netRsp)){
                localStorage.setItem("THeroToken",token)
                EventCenter.emit(EventName.LoginSucc)
                let accInfo = rsp.playerInfo as PlayerInfo
                UserModel.updateAccoutInfo(accInfo)
            }else {
                EventCenter.emit(EventName.LoginFail)
            }
        });
        this.startTs();
    }

    

    static updateRoleData() {
        console.log("login================")
        let req = new RoleUpdateDataReq()
        PomeloMgr.instance.send(RequestRoute.RoleUpdateData, req, function (rsp) {
            console.log("rsp================", rsp)
            UIManager.hideWaiting()
            let netRsp =   rsp  as RoleUpdateDataRsp
            if(PomeloUtil.checkRsp(netRsp)){
                let accInfo = rsp.playerInfo as PlayerInfo
                UserModel.updateAccoutInfo(accInfo)
            }else {
                EventCenter.emit(EventName.LoginFail)
            }
        });
        this.startTs();
    }

    //网络连接成功
    static onLogin(reObj: object): void {
        if (reObj["ret"] == RetCode.ROLE_NAME_IS_EMPTY || reObj["ret"] == RetCode.ROLE_NAME_IS_EXIST || reObj["ret"] == RetCode.ROLE_REG_IS_FULL) {
            // this.dispatchEvent(NetEvent.NET_ONLOGIN,reObj);
            return;
        }
        //验证过期了
        if (reObj["ret"] != RetCode.OK && reObj["ret"] != RetCode.ROLE_NOT_EXIST) {
            // GameMgr.tipsMgr.showErrorTips(reObj["ret"]);
            // SceneMgr.toLogin();
            return;
        }
    }

    //GM指令
    static sendGm(cdmd:string,params){
        let data = new GmExeGmCmdReq()
        data.cmd = cdmd
        data.pars = params;
		PomeloMgr.instance.send(RequestRoute.GMExeCmd,data,function(rsp){
            console.log("GMExeCmd rsp================",rsp)
            let netRsp =   rsp  as GmExeGmCmdRsp
            UserModel.updateAccoutInfo(netRsp.playerInfo)
            if(PomeloUtil.checkRsp(netRsp)){
                console.log("GM 提交成功")
            }else{
                console.log("GM 提交失败")
            }
        });
    }

    //更改昵称
    static roleChangeName(name:string){
        let req = new RoleChangeNameReq()
        req.name = name
		PomeloMgr.instance.send(RequestRoute.RoleChangeName,req,function(rsp){
            console.log("roleUpdateData rsp================",rsp)
            let netRsp =   rsp  as RoleChangeNameRsp
            UserModel.updateAccoutInfo(netRsp.playerInfo)
            if(PomeloUtil.checkRsp(netRsp)){
                EventCenter.emit(EventName.EditNameSucc)
            }
        });
    }

   
    //更改性别
    static roleChangeGender(gender:number){
        let req = new RoleChangeGenderReq()
        req.gender = gender
		PomeloMgr.instance.send(RequestRoute.RoleChangeGender,req,function(rsp){
            console.log("roleChangeGender rsp================",rsp)
            let netRsp =   rsp  as RoleChangeGenderRsp
            UserModel.updateAccoutInfo(netRsp.playerInfo)
            if(PomeloUtil.checkRsp(netRsp)){
                EventCenter.emit(EventName.EditNameSucc)
            }
        });
    }

    static changeTs(mTs){
        console.log("changeTs mTs="+mTs+" myTs="+this.myTs)
        this.myTs = mTs
        Redux.State.dispatch({ type: Redux.ReduxName.user, myTs: { ts: this.myTs } })
    }
    
     static t1 = null
    static startTs() {
        UserModel.stopTs()
        UserModel.t1 = setInterval(() => {
            this.myTs += 1000;
            UserModel.TimeFun()
            Redux.State.dispatch({ type: Redux.ReduxName.user, myTs: { ts: this.myTs } })
        }, 1000)
    }

    static stopTs(){
        if(UserModel.t1){
            clearInterval(UserModel.t1)
            UserModel.t1 = null
        }
    }

    refreshEquip(newEquip: EquipInfo) {
        let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
        let equips = accInfo.equips
        let arr = []
        let newEquipCfg = ConfigHelper.getCfg("EquipCfg", newEquip.equipId)
        equips.forEach(element => {
            let equipCfg = ConfigHelper.getCfg("EquipCfg", element.equipId)
            if (equipCfg.part != newEquipCfg.part) {
                arr.push(element)
            } else {
            }
        });
        arr.push(newEquip)
        accInfo.equips = arr
        Redux.State.dispatch({ type: Redux.ReduxName.user, accInfo });
    }

    static testLogin() {
        EventCenter.emit(EventName.LoginSucc)
        this.makeAccountInfo()
    }

    static makeAccountInfo() {
        console.log("makeAccountInfo============")
        let accInfo = State.getState(Redux.ReduxName.user, "accInfo");
        for (let i = 0; i < 19; i++) {
            let info = new EquipInfo()
            info.equipId = 0
            accInfo.equips.push(info)
        }
        for (let i = 0; i < 30; i++) {
            accInfo.heroAttrs[i] = i + 1
        }
        Redux.State.dispatch({ type: Redux.ReduxName.user, accInfo });
    }

    static reset() {
    }

    static TimeFun(){
      let keys =  Object.keys(UserModel.countDownObj) 
      keys.forEach(key => {
        if(UserModel.countDownObj[key]>0){
            UserModel.countDownObj[key]--
            if(UserModel.countDownObj[key] == 0){
                //请求刷新数据

            }
        }
      });
    }

    static updateAccoutInfo(accInfo:PlayerInfo) {
        if(accInfo == null) return
        //处理倒计时
        if(accInfo.chestUpgradeFinishTime >0 ){
            UserModel.countDownObj.chestUpgradeTs = Math.floor((accInfo.chestUpgradeFinishTime - this.myTs)/1000)
        }else{
            UserModel.countDownObj.chestUpgradeTs = 0
        }
        //处理宝箱自增倒计时
        let chestNum = accInfo.items[ItemType.ChestCount]
        if(ConstEnum.Consts.ChestSupplyMaxCount > chestNum){
            let chestLastAddTime = accInfo.chestLastAddTime
            let nextTime = chestLastAddTime + (60*60*1000)
            UserModel.countDownObj.chestAutoAddTs = Math.floor((nextTime - this.myTs)/1000)
        }else{
            UserModel.countDownObj.chestAutoAddTs = 0 
        }
        Redux.State.dispatch({ type: Redux.ReduxName.user, accInfo });
    }

    static getItemByType(type: ConstEnum.ItemType) {
        let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
        return accInfo.items[type]
    }

    //模拟数据
    static EquipAttrInfos: Array<AttrInfo[]> = [
        [{ attrId: 1, attrVal: 10 }, { attrId: 2, attrVal: 14 }, { attrId: 5, attrVal: 0.6 }],
        [{ attrId: 1, attrVal: 23 }, { attrId: 2, attrVal: 10 }, { attrId: 5, attrVal: 0.3 }],
        [{ attrId: 1, attrVal: 9 }, { attrId: 2, attrVal: 15 }, { attrId: 5, attrVal: 0.3 }],
        [{ attrId: 1, attrVal: 13 }, { attrId: 2, attrVal: 12 }, { attrId: 5, attrVal: 0.5 }],
    ]
}