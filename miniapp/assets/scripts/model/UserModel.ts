import Constants, { EventName } from "../Constant";
import SoundMgr from "../UIFrame/SoundMgr";
import { EventCenter, UIManager } from "../UIFrame/indexFrame";
import { LangTxt } from "../config/basecfg";
import { GameRoot } from "../manager/GameRoot";
import PlatformMgr from "../platform/PlatformMgr";
import Redux from "../redux";
import State from "../redux/state";
import { ConfigHelper } from "../utils/ConfigHelper";
import  ConstEnum  from "../utils/EnumeDefine";
import GameUtils from "../utils/GameUtils";
import Common from "../utils/common";
import Ext from "../utils/exts";
import { AttrInfo, EquipInfo, PlayerInfo, SysSettingType } from "../utils/pomelo/DataDefine";
import { PomeloNetEvent, RetCode } from "../utils/pomelo/GCode";
import { PomeloMgr } from "../utils/pomelo/PomeloMgr";
import PomeloUtil from "../utils/pomelo/PomeloUtil";
import { GmExeGmCmdReq, GmExeGmCmdRsp, MainFetchGiftReq, MainFetchGiftRsp, PlayerInfoRsp, RoleChangeAvatarReq, RoleChangeAvatarRsp, RoleChangeGenderReq, RoleChangeGenderRsp, RoleChangeNameReq, RoleChangeNameRsp, RoleEnterGameReq, RoleEnterGameRsp, RoleKillMeReq, RoleSysSettingReq, RoleUpdateDataReq, RoleUpdateDataRsp, SettingInfo } from "../utils/pomelo/ProtoPackage";
import { NotifyRoute, RequestRoute } from "../utils/pomelo/ProtoRoute";

export default class UserModel {
    public static myTs = 0;
    public static saveKey = ""
    public static isLogin = false
    public static countDownObj = {
        chestUpgradeTs: 0,//宝箱升级剩余时间
        chestAutoAddTs: 0,//宝箱+1剩余时间
    }
    static init() {
        GameUtils.resetAllCheckremenber()
        this.myTs = new Date().valueOf();
        UserModel.saveKey = "THeroToken_"+PlatformMgr.getCurPlatFormType()
        PomeloMgr.onEventHandler(NotifyRoute.PlayerInfoUpdate, this.notifyPlayerInfoUpdate,this);
        PomeloMgr.onEventHandler(NotifyRoute.RoleLevelUp, this.notifyRoleLevelUp,this);
    }

    static notifyPlayerInfoUpdate(data){
        console.log("notifyPlayerInfoUpdate",data)
    }

    static notifyRoleLevelUp(data){
        console.log("notifyRoleLevelUp",data)
    }

    static haveSaveToken(){
        let token = localStorage.getItem(UserModel.saveKey)
        if(token){
            return true
        }else{
            return false
        }
    }

    static login(token,username,userImg,platform) {
        if(!PomeloMgr.instance || !PomeloMgr.instance.netIsConnected()){
            return
        }
        console.log("login================")
        let req = new RoleEnterGameReq
        req.token = token
        req.platFormType = platform
        req.userImgUri = userImg
        req.userName = username
        PomeloMgr.instance.send(RequestRoute.LoginEnterGame, req, function (rsp) {
            console.log("rsp================", rsp)
            UIManager.hideWaiting()
            let netRsp =   rsp  as RoleEnterGameRsp
            if(PomeloUtil.checkRsp(netRsp)){
                localStorage.setItem(UserModel.saveKey,token)
                EventCenter.emit(EventName.LoginSucc)
                let accInfo = rsp.playerInfo as PlayerInfo
                UserModel.updateAccoutInfo(accInfo)
            }else {
                EventCenter.emit(EventName.LoginFail)
            }
            UserModel.isLogin = false
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

    //设置数据
    static setSysSetting(type:SysSettingType,value){
        let info = new SettingInfo()
        info.type = type
        info.val = value
        let settingInfos = [info]
        let data = new RoleSysSettingReq()
        data.settingInfos = settingInfos
		PomeloMgr.instance.send(RequestRoute.RoleSysSetting,data,function(rsp){
            let netRsp =   rsp  as PlayerInfoRsp
            console.log("setSysSetting rsp================",netRsp)
            if(PomeloUtil.checkRsp(netRsp)){
                UserModel.updateAccoutInfo(netRsp.playerInfo)
            }
        });
    }

    //GM指令
    static sendGm(cdmd:string,params){
        let data = new GmExeGmCmdReq()
        data.cmd = cdmd
        data.pars = params;
		PomeloMgr.instance.send(RequestRoute.GMExeCmd,data,function(rsp){
            console.log("GMExeCmd rsp================",rsp)
            let netRsp =   rsp  as GmExeGmCmdRsp
            if(PomeloUtil.checkRsp(netRsp)){
                console.log("GM 提交成功")
                UserModel.updateAccoutInfo(netRsp.playerInfo)
            }else{
                console.log("GM 提交失败")
            }
        });
    }

    //删除角色
    static roleDelete(){
        let req = new RoleKillMeReq()
		PomeloMgr.instance.send(RequestRoute.RoleKillMe,req,function(rsp){
            console.log("roleDelete rsp================",rsp)
            let netRsp =   rsp  as PlayerInfoRsp
            if(PomeloUtil.checkRsp(netRsp)){
                //退出到登陆界面
                GameRoot.Instance.logOut(1)
            }
        });
    }

    //领取离线奖励
    static mainFetchGift(){
        let req = new MainFetchGiftReq()
		PomeloMgr.instance.send(RequestRoute.MainFetchGift,req,function(rsp){
            console.log("mainFetchGift rsp================",rsp)
            let netRsp =   rsp  as MainFetchGiftRsp
            if(PomeloUtil.checkRsp(netRsp)){
                UserModel.updateAccoutInfo(netRsp.playerInfo)
                Redux.State.dispatch({ type: Redux.ReduxName.user, mainGiftReWard: netRsp.rewardInfos })
                UserModel.updateRoleData()
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
            if(PomeloUtil.checkRsp(netRsp)){
                UserModel.updateAccoutInfo(netRsp.playerInfo)
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
            if(PomeloUtil.checkRsp(netRsp)){
                UserModel.updateAccoutInfo(netRsp.playerInfo)
            }
        });
    }

    //更改头像
    static roleChangeAvatar(avatar){
        let req = new RoleChangeAvatarReq()
        req.avatar = avatar
		PomeloMgr.instance.send(RequestRoute.RoleChangeAvatar,req,function(rsp){
            console.log("roleChangeAvatar rsp================",rsp)
            let netRsp =   rsp  as RoleChangeAvatarRsp
            if(PomeloUtil.checkRsp(netRsp)){
                UserModel.updateAccoutInfo(netRsp.playerInfo)
            }
        });
    }

    static changeTs(mTs){
        console.log("changeTs mTs="+mTs+" myTs="+this.myTs)
        this.myTs = mTs
        Redux.State.dispatch({ type: Redux.ReduxName.user, myTs: this.myTs })
    }
    
     static t1 = null
    static startTs() {
        UserModel.stopTs()
        UserModel.t1 = setInterval(() => {
            this.myTs += 1000;
            UserModel.TimeFun()
            Redux.State.dispatch({ type: Redux.ReduxName.user, myTs: this.myTs })
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
                UserModel.updateRoleData()
            }
        }
      });
    }

    static updateAccoutInfo(accInfo:PlayerInfo) {
        if(accInfo == null) return
        //处理倒计时
        if(accInfo.chestUpgradeFinishTime >0 ){
            let del = accInfo.chestUpgradeFinishTime - this.myTs
            console.log("accInfo.chestUpgradeFinishTime="+accInfo.chestUpgradeFinishTime+" now="+this.myTs+" del="+del)
            UserModel.countDownObj.chestUpgradeTs = Math.floor((del)/1000)
            if(del < 1000){
                UserModel.updateRoleData()
            }
        }else{
            UserModel.countDownObj.chestUpgradeTs = 0
        }
        //处理宝箱自增倒计时
        let chestNum = accInfo.items[ConstEnum.ItemType.ChestCount]
        if(ConstEnum.Consts.ChestSupplyMaxCount > chestNum){
            let chestLastAddTime = accInfo.chestLastAddTime
            let nextTime = chestLastAddTime + (60*60*1000)
            UserModel.countDownObj.chestAutoAddTs = Math.floor((nextTime - this.myTs)/1000)
        }else{
            UserModel.countDownObj.chestAutoAddTs = 0 
        }
        this.initSetting(accInfo)
        Redux.State.dispatch({ type: Redux.ReduxName.user, accInfo });
    }

    static initSetting(accInfo:PlayerInfo){
        if(accInfo.settings == null){
            accInfo.settings = new Array(11).fill(0)
            accInfo.settings[SysSettingType.Music] = 1
            accInfo.settings[SysSettingType.Sound] = 1
        }
        let settingInfos = accInfo.settings
        if(settingInfos.length>0){
            for(let i = 0;i<settingInfos.length;i++){
                if(i == SysSettingType.Music){
                    SoundMgr.inst.setMusicVolume(settingInfos[i])
                }
                if(i == SysSettingType.Sound){
                    SoundMgr.inst.setEffectVolume(settingInfos[i])
                }
                if(i == SysSettingType.Lang){
                    this.changeLang(settingInfos[i])
                }
            }
        }
    }

    static changeLang(idx){
        let lanArr = Object.keys(LangTxt)
        let lang = lanArr[idx]
        Common.changeLang(lang);
    }

    static getItemByType(type: ConstEnum.ItemType) {
        let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
        return accInfo.items[type]
    }
}