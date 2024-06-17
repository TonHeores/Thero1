import { BDataCfg } from "./BDataCfg";
import { BUtils } from "./BUtils";
import { Battle } from "./Battle";
import { BattleUnit } from "./BattleUnit";
import { BufObj } from "./BufObj";
import { BufTriggleType } from "./define/BDataComm";
import { BufCfg, BufEffectInfo, BufEffectType, BufTargetType } from "./define/BufCfg";


//普攻
export class BufMgr{
    public battle:Battle;
    public unit:BattleUnit;
    
    public bufList:Array<BufObj> =[];
    public bufMapByTriggle:Map<BufTriggleType,Array<BufObj>> = new Map();
    public curBufIdx:number = 0;

    constructor(battle:Battle,unit:BattleUnit){
        this.battle = battle;
        this.unit = unit;

        //必须的触点
        for(let i=0;i<=BufTriggleType.EnumLength;i++){
            this.bufMapByTriggle[i]=[];
        }
    }

    
    // public init(battle:Battle,unit:BattleUnit){
    //     this.battle = battle;
    //     this.unit = unit;
    // }


    public addBufById(bufId:number){
        let bufCfg = BDataCfg.ins.getBufCfg(bufId);
        if(bufCfg==null)return;
        let bufObj:BufObj = new BufObj(this.unit);
        bufObj.init(bufCfg);

        this.addBuf(bufObj);
    }



    //增加BUF，成功返回true
    public addBuf(obj:BufObj){
        //生成与挂接BufObj
        let ret = 0;
       
        //检查挂接概率
        if(BUtils.hitRate(obj.info.handleRate)==false)return;
        
        this.curBufIdx++;
        obj.bufIdx = this.curBufIdx;

        this.bufList.push(obj);
        this.bufMapByTriggle[obj.info.triggleType].push(obj);
        
        return;
    }




    //addBufByAttrExt
    public addEffectExeBuf(oldEffInfo:BufEffectInfo):BufObj{

        let newEffInfo:BufEffectInfo = new BufEffectInfo();
        BUtils.copyObj(newEffInfo,oldEffInfo);

        if(oldEffInfo.type==BufEffectType.AddAttr){
            newEffInfo.type = BufEffectType.ExeAttr;
        }else if(oldEffInfo.type==BufEffectType.AddStatus){
            newEffInfo.type = BufEffectType.ExeStatus;
        }


        let ret = 0;
        let obj:BufObj = new BufObj(this.unit);
        obj.init();

        obj.info.triggleType =BufTriggleType.OnRoundBegin;
        obj.info.targetType=BufTargetType.Mine;
        obj.info.handleRate=100;
        obj.info.triggleRate=100;
        obj.info.waitRound = newEffInfo.wait;
        obj.info.liveRound = newEffInfo.live;
        obj.info.useCount = newEffInfo.count;
        if(obj.info.waitRound==null)obj.info.waitRound=0;
        if(obj.info.liveRound==null)obj.info.liveRound=9999;
        if(obj.info.useCount==null)obj.info.useCount=9999;

        obj.info.effectInfos.push(newEffInfo);

        this.addBuf(obj);

        return obj;
    }



    //触发Buf（根据BufTriggleType选择触发时机)
    public triggleBufs(type:BufTriggleType){
        let bufs:Array<BufObj> = this.bufMapByTriggle[type] ;
       // BUtils.trace("triggleBufs:",type);
        if(bufs==null)return;

      //  BUtils.trace("CCCCCCCCCC:",type);

        for(let i=0;i<bufs.length;i++){
            let bufObj:BufObj = bufs[i];
            bufObj.running();
        }
    }




    //回合开始处理（处理回合数）
    public onRoundBegin(){
        for(let i=0;i<this.bufList.length;i++){
            let bufObj:BufObj = this.bufList[i];
            if(bufObj==null)continue;
            bufObj.OnRoundBegin();
        } 
    }

    //回合结束的处理(定期清理Buff)
    public onRoundEnd(){

        let delBufList:number[]=[];

        for(let i=0;i<this.bufList.length;i++){
            let bufObj:BufObj = this.bufList[i];
            if(bufObj==null)continue;
            
            bufObj.OnRoundEnd();

            if(bufObj.isActived()==false ){
                delBufList.push(bufObj.bufIdx);
                this.bufList.splice(i--,1); //buff失效了，删除！
            }
        } 

        //有删除的bufIds要下发
        if(delBufList.length>0){
            this.battle.pkg.addRoundEndDelBuf(this.unit,delBufList);
        }
    }


}