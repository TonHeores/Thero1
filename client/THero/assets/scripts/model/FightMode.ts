import  { EventName } from "../Constant";
import { EventCenter } from "../UIFrame/indexFrame";
import FightMgr, { FightTroopInfo, TroopMemberInfo } from "../module/fight/FightMgr";
import { ConfigHelper } from "../utils/ConfigHelper";
import { AttrType } from "../utils/ConstDefine";
import { PomeloMgr } from "../utils/pomelo/PomeloMgr";
import PomeloUtil from "../utils/pomelo/PomeloUtil";
import { BattleFightMatchReq, BattleFightMatchRsp, GmExeGmCmdRsp, } from "../utils/pomelo/ProtoPackage";
import { RequestRoute } from "../utils/pomelo/ProtoRoute";
import UserModel from "./UserModel";

export default class FightMode {
    public static myTs = 0;

    public static countDownObj = {
        chestUpgradeTs: 0,//宝箱升级剩余时间
        chestAutoAddTs: 0,//宝箱+1剩余时间
    }
    static init() {
        // PomeloMgr.onEventHandler(PomeloNetEvent.NET_ONLOGIN, this.onLogin,this);
    }

    //匹配
    static matchFightLevel() {
        let data = new BattleFightMatchReq()
        PomeloMgr.instance.send(RequestRoute.MatchFightLevel, data, function (rsp) {
            console.log("matchFightLevel rsp================", rsp)
            let netRsp = rsp as BattleFightMatchRsp
            if (PomeloUtil.checkRsp(netRsp)) {
                UserModel.updateAccoutInfo(netRsp.playerInfo)
                let data = netRsp.battlePackage
                console.log("battle data========", data)
                let lv = netRsp.playerInfo.curMatchLv;
                if (netRsp.battlePackage["winner"] == 1) {
                    lv--
                }
                let troopData = FightMode.initTroopData(lv,netRsp.battleInitData["troopInfos"])
                //初始化队伍信息
                FightMgr.getInstance().resetData(troopData, netRsp.battlePackage, netRsp.rewardInfos)
                EventCenter.emit(EventName.StartFight)
            } else {
                console.log("matchFightLevel fail")
            }
        });
    }

    static initTroopData(lv,initData) {
        let leftAttr = initData[0].heroInfos[0].attrs
        let rightAttr = initData[1].heroInfos[0].attrs
        let arr = []
        let leftData = new FightTroopInfo()
        leftData.teamId = 1;
        let heroInfo1 = new TroopMemberInfo()
        heroInfo1.id = 0
        heroInfo1.uid = 1
        heroInfo1.HP = leftAttr[AttrType.HP]
        leftData.heroInfos.push(heroInfo1)
        arr.push(leftData)

        let rightData = new FightTroopInfo()
        rightData.teamId = 2;
        let cfg = ConfigHelper.getCfg("MatchInfoCfg", lv)
        let heroInfo2 = new TroopMemberInfo()
        heroInfo2.id = cfg.monsterId
        heroInfo1.uid = 6
        heroInfo2.HP = rightAttr[AttrType.HP]
        rightData.heroInfos.push(heroInfo2)
        arr.push(rightData)
        return arr
    }

    //匹配
    static testFight() {
        let data = new BattleFightMatchReq()
        PomeloMgr.instance.send("game.battleHandler.testMatch", data, function (rsp) {
            console.log("matchFightLevel rsp================", rsp)
            let netRsp = rsp as BattleFightMatchRsp
            if (PomeloUtil.checkRsp(netRsp)) {
                UserModel.updateAccoutInfo(netRsp.playerInfo)
                let data = netRsp.battlePackage
                console.log("battle data========", data)
                // FightMgr.getInstance().resetData(,netRsp.rewardInfos)
            } else {
                console.log("matchFightLevel fail")
            }
        });
    }

    static reset() {
    }

}