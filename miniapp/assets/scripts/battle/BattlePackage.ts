import { BUtils } from "./BUtils";
import { Battle } from "./Battle";
import { BattleUnit } from "./BattleUnit";
import { ActionType, AttrType } from "./define/BDataComm";
import {  PkgActionInfo,PkgBattleInitData, PkgBattleRetData, PkgDelBufInfo, PkgEffectInfo, PkgRoundInfo } from "./define/BattlePkgData";
import { BufEffectInfo, BufEffectType } from "./define/BufCfg";

//抽象出来的部队逻辑
export class BattlePackage{
    public battle:Battle;
    public data:PkgBattleRetData = new PkgBattleRetData();
    public initData:PkgBattleInitData = new PkgBattleInitData();

    public curRound:PkgRoundInfo; 
    public curAction:PkgActionInfo;
    public curEffect:PkgEffectInfo;

    public roundNo:number = -1;

    //数据
    constructor(battle:Battle){
        this.battle=battle;
    }


    public init(Battle){

    }



    //增加一个新round
    public addNewRound(){
        this.roundNo++;

        this.curRound = new PkgRoundInfo();
        this.curRound.roundNo = this.roundNo;
        this.data.rounds.push(this.curRound);
    }


    //增加一个新action
    public buildNewAction(unit:BattleUnit,actionType:ActionType,skillId:number=0){

        let action:PkgActionInfo = new PkgActionInfo();
        this.curAction = action;

        action.srcUnit = unit.idx;
        action.actionType = actionType;
        action.skillId = skillId;
    }

    
    public closeAction(){
        if(this.curAction==null)return;
        if(this.curAction.effects.length>0){
            this.curRound.actions.push(this.curAction);
        }
         
        this.curAction =null;
    }


    // public buildNewSuffer(dstUnit:BattleUnit){
    //     let suffer:PkgSufferInfo = new PkgSufferInfo();
    //     suffer.dstUnit.troopIdx = dstUnit.troop.idx;
    //     suffer.dstUnit.unitIdx =dstUnit.idx;

    //     this.curSuffer = suffer;
    // }

    // public handleSuffer(){
    //     if(this.curSuffer==null)return;
    //     if(this.curSuffer.effects.length>0){
    //         this.curAction.suffers.push(this.curSuffer);
    //     }
    //     this.curSuffer =null;
    // }


    public addNewEffect(dstUnit:BattleUnit,type:BufEffectType,val:number,attr:number=0){
        let effect:PkgEffectInfo = new PkgEffectInfo();
        effect.dstUnit = dstUnit.idx;
        effect.type = type;
        effect.val = val;
        effect.attr = attr;
        effect.curHP = dstUnit.getAttr(AttrType.CurHP);

        this.curEffect = effect;
        this.curAction.effects.push(effect);
    }




    public addRoundEndDelBuf(unit:BattleUnit,delBufs:number[]){
        
        let info:PkgDelBufInfo=new PkgDelBufInfo();
        info.unit = unit.idx;
        info.delBufs = delBufs;

        if(this.curRound.end.delBufList==null)this.curRound.end.delBufList=[];
        this.curRound.end.delBufList.push(info);

    }



    public onClose(){
        this.closeAction();
        this.data.winner = this.battle._winner;
        this.data.roundCount = this.roundNo;

        console.log("Round:%d",this.roundNo);

    }
}