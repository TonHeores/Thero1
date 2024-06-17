import Constants from "../Constant";
import UIManager from "../UIFrame/UIManager";
import { UIArenaPanel } from "../UIScript/indexPrefab";
import Redux from "../redux";
import ConstEnum from "../utils/EnumeDefine";
import { PomeloMgr } from "../utils/pomelo/PomeloMgr";
import PomeloUtil from "../utils/pomelo/PomeloUtil";
import { ArenaFetchRankRewardsReq, ArenaFetchRankRewardsRsp, ArenaFightTargetReq, ArenaFightTargetRsp, ArenaGetOpponentsReq, ArenaGetOpponentsRsp, ArenaGetTopListReq, ArenaGetTopListRsp, ArenaRefreshOpponentsReq, ArenaRefreshOpponentsRsp, RoleQueryPlayerReq, RoleQueryPlayerRsp } from "../utils/pomelo/ProtoPackage";
import { RequestRoute } from "../utils/pomelo/ProtoRoute";
import FightMode from "./FightMode";
import UserModel from "./UserModel";


export default class ArenaModel {
    static init() {
        // PomeloMgr.onEventHandler(PomeloNetEvent.NET_ONLOGIN, this.onLogin,this);
    }

    //获取竞技场排行
    static getArenaRank(){
        let data:ArenaGetTopListReq = new ArenaGetTopListReq()
        console.log("getArenaRank================",data)
        let self = this
        PomeloMgr.instance.send(RequestRoute.ArenaGetTopList,data,function(rsp){
            console.log("getArenaRank rsp================",rsp)
            let netRsp =   rsp  as ArenaGetTopListRsp
            if(PomeloUtil.checkRsp(netRsp)){
                console.log(netRsp);
                // cb.bind(target,netRsp)();
                Redux.State.dispatch({ type: Redux.ReduxName.arena, rankInfo:netRsp });
                // UIManager.openView(Constants.Panels.UIRewardPanel,{rewardInfos: netRsp.rewardInfos})
                // UserModel.updateAccoutInfo(netRsp.playerInfo)
            }
        });
    
    }

    //获取挑战对手 
    static getOpponents(){
        let data:ArenaGetOpponentsReq = new ArenaGetOpponentsReq()
        console.log("getOpponents================",data)
        let self = this
        PomeloMgr.instance.send(RequestRoute.ArenaGetOpponents,data,function(rsp){
            console.log("getOpponents rsp================",rsp)
            let netRsp =   rsp  as ArenaGetOpponentsRsp
            if(PomeloUtil.checkRsp(netRsp)){
                console.log(netRsp);
                Redux.State.dispatch({ type: Redux.ReduxName.arena, oppoInfos:netRsp.oppoInfos });
                UIManager.openView(Constants.Panels.UIArenaChooseOpponents,{oppoInfos: netRsp.oppoInfos});
            }
        });
    }

    //刷新挑战对手 
    static refreshOpponents(target, cb){
        let data:ArenaRefreshOpponentsReq = new ArenaRefreshOpponentsReq()
        console.log("refreshOpponents================",data)
        let self = this
        PomeloMgr.instance.send(RequestRoute.ArenaRefreshOpponents,data,function(rsp){
            console.log("refreshOpponents rsp================",rsp)
            let netRsp =   rsp  as ArenaRefreshOpponentsRsp
            if(PomeloUtil.checkRsp(netRsp)){
                console.log(netRsp);
                UserModel.updateAccoutInfo(netRsp.playerInfo)
                Redux.State.dispatch({ type: Redux.ReduxName.arena, oppoInfos:netRsp.oppoInfos });
            }
        });
    
    }
    
    //挑战对手 
    static fightOpponents(dstUid:string){
        let data:ArenaFightTargetReq = new ArenaFightTargetReq();
        data.dstUid = dstUid;
        console.log("fightOpponents================",data)
        let self = this
        PomeloMgr.instance.send(RequestRoute.ArenaFightOppenent,data,function(rsp){
            console.log("fightOpponents rsp================",rsp)
            let netRsp =  rsp  as ArenaFightTargetRsp
            if(PomeloUtil.checkRsp(netRsp)){
                console.log(netRsp);
                UserModel.updateAccoutInfo(netRsp.playerInfo)
                Redux.State.dispatch({ type: Redux.ReduxName.arena, oppoInfos:netRsp.oppoInfos });
                Redux.State.dispatch({ type: Redux.ReduxName.arena, fightInfo:netRsp });
                FightMode.initFight(2,netRsp.battleInitData, netRsp.battlePackage, netRsp.rewardInfos)
                
                // Redux.State.dispatch({ type: Redux.ReduxName.user, accInfo:netRsp.playerInfo});
                // UIManager.openView(Constants.Panels.UIArenaFightResult,{netRsp})
            }
        });
    }

    //领取排名奖励 
    static getRankReward(type:ConstEnum.ArenaRankType){
        let data:ArenaFetchRankRewardsReq = new ArenaFetchRankRewardsReq();
        data.rewardType = type;
        console.log("fightOpponents================",data)
        let self = this
        PomeloMgr.instance.send(RequestRoute.ArenaFetchRankRewards,data,function(rsp){
            console.log("fightOpponents rsp================",rsp)
            let netRsp =   rsp  as ArenaFetchRankRewardsRsp
            if(PomeloUtil.checkRsp(netRsp)){
                console.log(netRsp);
                ArenaModel.getArenaRank();
                UserModel.updateAccoutInfo(netRsp.playerInfo)
                UIManager.openView(Constants.Panels.UIRewardPanel,{rewardInfos:netRsp.rewardInfos})
            }
        });
    }

    //获取对手详细信息
    static getOpponentsInfo(uid){
        let data:RoleQueryPlayerReq = new RoleQueryPlayerReq();
        data.targetUid = uid;
        console.log("OpponentsInfo================",data)
        let self = this
        PomeloMgr.instance.send(RequestRoute.RoleQueryPlayer,data,function(rsp){
            console.log("OpponentsInfo rsp================",rsp)
            let netRsp =   rsp  as RoleQueryPlayerRsp
            if(PomeloUtil.checkRsp(netRsp)){
                console.log(netRsp);
                UIManager.openView(Constants.Panels.UIArenaOpponentsInfo,{accInfo:netRsp.playerOutInfo})
            }
        });
    }
    
}