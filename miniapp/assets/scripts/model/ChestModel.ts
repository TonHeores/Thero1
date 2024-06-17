import { sys } from "cc";
import Constants, { EventName } from "../Constant";
import SoundMgr from "../UIFrame/SoundMgr";
import { EventCenter, UIManager } from "../UIFrame/indexFrame";
import { CHECK_KEY, SOUND_RES } from "../config/basecfg";
import Redux from "../redux";
import State from "../redux/state";
import { ConfigHelper } from "../utils/ConfigHelper";
import Common from "../utils/common";
import { AttrInfo, EquipInfo, PlayerInfo } from "../utils/pomelo/DataDefine";
import { PomeloNetEvent, RetCode } from "../utils/pomelo/GCode";
import { PomeloMgr } from "../utils/pomelo/PomeloMgr";
import PomeloUtil from "../utils/pomelo/PomeloUtil";
import { MainChestUpgSpeedUpReq, MainChestUpgSpeedUpRsp, MainChestUpgradeReq, MainChestUpgradeRsp, MainEquipSaleReq, MainEquipSaleRsp, MainEquipWearReq, MainEquipWearRsp, MainOpenChestReq, MainOpenChestRsp, RoleEnterGameReq } from "../utils/pomelo/ProtoPackage";
import { NotifyRoute, RequestRoute } from "../utils/pomelo/ProtoRoute";
import UserModel from "./UserModel";
import { ItemType } from "../utils/pomelo/ConstDefine";

export default class ChestModel {
    static init() {
        PomeloMgr.onEventHandler(NotifyRoute.ChestLevelUp, this.notifyChestLevelUp,this);
        PomeloMgr.onEventHandler(NotifyRoute.ChestCountUpdate, this.notifyChestCountUpdate,this);
    }

    static notifyChestLevelUp(data){
        console.log("notifyChestLevelUp",data)
    }

    static notifyChestCountUpdate(data){
        console.log("notifyChestCountUpdate",data)
        let info:PlayerInfo = data as PlayerInfo
        UserModel.updateAccoutInfo(info)
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
                 //开宝箱统计
                 let saveKey = CHECK_KEY.OPENBOXCOUNT + "_check_"+ netRsp.playerInfo.uid;
                 let hasNum = sys.localStorage.getItem(saveKey) ? sys.localStorage.getItem(saveKey) : 0;
                 let addNum = UserModel.getItemByType(ItemType.ChestCount) - netRsp.playerInfo.items[ItemType.ChestCount]
                 let saveNum = Number(hasNum) + addNum
                 sys.localStorage.setItem(saveKey,saveNum);

                UserModel.updateAccoutInfo(netRsp.playerInfo)
            }
        });
	}

    //穿装备
    static wearEquip(needSell:boolean = false){
        let data = new MainEquipWearReq()
		PomeloMgr.instance.send(RequestRoute.MainEquipWear,data,function(rsp){
            console.log("wearEquip rsp================",rsp)
            let netRsp =   rsp  as MainEquipWearRsp
            if(PomeloUtil.checkRsp(netRsp)){
                UserModel.updateAccoutInfo(netRsp.playerInfo)
                SoundMgr.inst.playEffect(SOUND_RES.GetEquip)
                let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
                let saveKey = CHECK_KEY.AUTOSELLEQUIP + "_check_"+ accInfo.uid;
                if(/* JSON.parse(sys.localStorage.getItem(saveKey)) */needSell && netRsp.playerInfo.curEquip)
                    ChestModel.saleEquip()
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
                // SoundMgr.inst.playEffect(SOUND_RES.AddMoney)
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