import  { EventName } from "../Constant";
import { EventCenter } from "../UIFrame/indexFrame";
import FightMgr, { FightTroopInfo, TroopMemberInfo } from "../module/fight/FightMgr";
import Redux from "../redux";
import State from "../redux/state";
import { ConfigHelper } from "../utils/ConfigHelper";
import ConstEnum from "../utils/EnumeDefine";
import { PlayerInfo } from "../utils/pomelo/DataDefine";
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
                //初始化队伍信息
                FightMode.initFight(1,netRsp.battleInitData, netRsp.battlePackage, netRsp.rewardInfos)
            } else {
                console.log("matchFightLevel fail")
            }
        });
    }

    //type 1 为副本  2为竞技场
    static initFight(type,battleInitData,battlePackage,rewardInfos){
        if(FightMgr.getInstance().checkIsFighting()){
            return;
        }
        let troopInfos = battleInitData.troopInfos
        let troopData = []
        let idx = 1
        console.log("troopInfos=====",troopInfos)
        let sceneId = 0
        let cfg = null;
        if(type == 1){
            //如果是副本，对面怪要写好使用的资源ID
            let accInfo:PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
            let lv = accInfo.curMatchLv;
            console.log("lv==="+lv)
            if (battlePackage["winner"] == 1) {
                lv--
            }
            if(lv==0){
                lv = 1
            }
            cfg = ConfigHelper.getCfg("MatchInfoCfg", lv)
            sceneId = cfg.sceneId
        }

        troopInfos.forEach(team => {
            console.log("team===",team)
            let teamInfo = new FightTroopInfo()
            teamInfo.teamId = idx;
            team.heroInfos.forEach(member => {
                let heroInfo = new TroopMemberInfo()
                heroInfo.uid = member.unitId
                let attrs = member.attrs
                heroInfo.HP = attrs[ConstEnum.AttrType.HP]
                teamInfo.heroInfos.push(heroInfo)
                if(type == 1 ){
                    if(idx == 1){
                        heroInfo.id = 0
                        let accInfo:PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
                        if(accInfo.lv <20){
                            heroInfo.id = 901
                        }else if(accInfo.lv <40){
                            heroInfo.id = 902
                        }else if(accInfo.lv <60){
                            heroInfo.id = 903
                        }else if(accInfo.lv <80){
                            heroInfo.id = 904
                        }else {
                            heroInfo.id = 905
                        }
                    }else if(idx == 2){
                        heroInfo.id = cfg.monsterId
                    }
                }else{
                    heroInfo.id = member.id
                }
            });
            troopData.push(teamInfo)
            idx++
        });
        EventCenter.emit(EventName.StartFight)
        FightMgr.getInstance().resetData(type,troopData, battlePackage, rewardInfos,sceneId)
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