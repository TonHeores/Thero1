
import Redux from "../redux";
import { PomeloMgr } from "../utils/pomelo/PomeloMgr";
import PomeloUtil from "../utils/pomelo/PomeloUtil";
import { RankGetTopListReq, RankGetTopListRsp, TaskMainTaskFinishReq, TaskMainTaskFinishRsp } from "../utils/pomelo/ProtoPackage";
import { RequestRoute } from "../utils/pomelo/ProtoRoute";

export default class RankModel {
    static init() {
    }

    static reset() {
    }

    //获取排名
    static getTopList(){
        let data:RankGetTopListReq = new RankGetTopListReq()
        console.log("getTopList================",data)
        PomeloMgr.instance.send(RequestRoute.RankGetTopList,data,function(rsp){
            console.log("getTopList rsp================",rsp)
            let netRsp =   rsp  as RankGetTopListRsp
            if(PomeloUtil.checkRsp(netRsp)){
                console.log("getTopList rsp================2")
                if(netRsp.rankInfos){
                    let {rankInfos,myRank,myBattlePower} = netRsp
                    Redux.State.dispatch({ type: Redux.ReduxName.rank, powerRankData:{rankInfos,myRank,myBattlePower} });
                }
            }
        });
    }
    
}