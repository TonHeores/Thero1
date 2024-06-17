import Constants, { EventName } from "../Constant";
import SoundMgr from "../UIFrame/SoundMgr";
import { EventCenter, UIManager } from "../UIFrame/indexFrame";
import { SOUND_RES } from "../config/basecfg";
import Redux from "../redux";
import State from "../redux/state";
import { ConfigHelper } from "../utils/ConfigHelper";
import Common from "../utils/common";
import { AttrInfo, EquipInfo, PlayerInfo } from "../utils/pomelo/DataDefine";
import { PomeloNetEvent, RetCode } from "../utils/pomelo/GCode";
import { PomeloMgr } from "../utils/pomelo/PomeloMgr";
import PomeloUtil from "../utils/pomelo/PomeloUtil";
import { MainChestUpgSpeedUpReq, MainChestUpgSpeedUpRsp, MainChestUpgradeReq, MainChestUpgradeRsp, MainEquipSaleReq, MainEquipSaleRsp, MainEquipWearReq, MainEquipWearRsp, MainOpenChestReq, MainOpenChestRsp, RoleEnterGameReq } from "../utils/pomelo/ProtoPackage";
import { RequestRoute } from "../utils/pomelo/ProtoRoute";
import UserModel from "./UserModel";

export default class ChestModel {
    static init() {
        // PomeloMgr.onEventHandler(PomeloNetEvent.NET_ONLOGIN, this.onLogin,this);
    }

    //开箱子
    static openChest(){
        let data:MainOpenChestReq = new MainOpenChestReq()
        console.log("openChest================",data)
        let self = this
		PomeloMgr.instance.send(RequestRoute.MainOpenChest,data,function(rsp){
            console.log("openChest rsp================",rsp)
            let netRsp =   rsp  as MainOpenChestRsp
            if(PomeloUtil.checkRsp(netRsp)){
                UserModel.updateAccoutInfo(netRsp.playerInfo)
                SoundMgr.inst.playEffect(SOUND_RES.Openbox)
            }
        });
	}

    //穿装备
    static wearEquip(){
        let data = new MainEquipWearReq()
		PomeloMgr.instance.send(RequestRoute.MainEquipWear,data,function(rsp){
            console.log("wearEquip rsp================",rsp)
            let netRsp =   rsp  as MainEquipWearRsp
            if(PomeloUtil.checkRsp(netRsp)){
                UserModel.updateAccoutInfo(netRsp.playerInfo)
                SoundMgr.inst.playEffect(SOUND_RES.GetEquip)
            }
        });
    }

    //出售装备
    static saleEquip(){
        let data = new MainEquipSaleReq()
		PomeloMgr.instance.send(RequestRoute.MainEquipSale,data,function(rsp){
            console.log("saleEquip rsp================",rsp)
            let netRsp =   rsp  as MainEquipSaleRsp
            if(PomeloUtil.checkRsp(netRsp)){
                UserModel.updateAccoutInfo(netRsp.playerInfo)
                EventCenter.emit(EventName.SellEquip);
                SoundMgr.inst.playEffect(SOUND_RES.AddMoney)
            }
        });
    }

    //宝箱升级
    static chestUpgrade(){
        let data = new MainChestUpgradeReq()
		PomeloMgr.instance.send(RequestRoute.MainChestUpgrade,data,function(rsp){
            console.log("chestUpgrade rsp================",rsp)
            let netRsp =   rsp  as MainChestUpgradeRsp
            if(PomeloUtil.checkRsp(netRsp)){
                UserModel.updateAccoutInfo(netRsp.playerInfo)
            }
        });
    }

    //宝箱加速
    static chestUpgradeAcc(cardCount){
        let data = new MainChestUpgSpeedUpReq()
        data.cardCount = cardCount
		PomeloMgr.instance.send(RequestRoute.MainChestUpgSpeedUp,data,function(rsp){
            console.log("chestUpgrade rsp================",rsp)
            let netRsp =   rsp  as MainChestUpgSpeedUpRsp
            if(PomeloUtil.checkRsp(netRsp)){
                // let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
                // accInfo.chestUpgradeFinishTime = netRsp.chestUpgradeFinishTime
                UserModel.updateAccoutInfo(netRsp.playerInfo)
            }
        });
    }

    static reset(){
        
    }
}