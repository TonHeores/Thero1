import { Battle } from "./Battle";
import { BattleTroop } from "./BattleTroop";
import { BattleUnit } from "./BattleUnit";
import { BUtils } from "./BUtils";
import {  BufTriggleType, OverlayLimit, SpecActType } from "./define/BDataComm";
import { TargetRangeType, BufCfg, BufEffectInfo, BufEffectType, BufFilterCmpCmd, BufFilterInfo, BufFilterItem, BufFilterOptCmd, BufFilterOwnerType, BufTargetType} from "./define/BufCfg";
import { ActionType, AttrType } from "./define/BDataComm";
import { BDataCfg } from "./BDataCfg";
import {  PkgEffectInfo} from "./define/BattlePkgData";
import { BattlePackage } from "./BattlePackage";




export class BufObj{
    public unit:BattleUnit;
    public pkg:BattlePackage;

    public info:BufCfg = new BufCfg();
    public cfg:BufCfg = null;
    public bufIdx:number = 0;

    public roundSum:number=0; //本buf已经工作多少回合了

    constructor(unit:BattleUnit){
        this.unit= unit;
        this.pkg = this.unit.pkg;
    }


    public init(bufCfg:BufCfg=null){
        
        if(bufCfg!=null){
            this.cfg = bufCfg;
            if(this.cfg==null)return;
            BUtils.copyObj(this.info,this.cfg);
        }else{
            this.cfg = null;
        }

        //初始值的处理
        if(this.info.triggleRate==0)this.info.triggleRate=100;
        if(this.info.handleRate==0)this.info.handleRate=100;
        if(this.info.liveRound==0)this.info.liveRound=9999;
        if(this.info.useCount==0)this.info.useCount=9999;
        if(this.info.targetCounts.length==0)this.info.targetCounts=[1];
        if(this.info.targetType==null || this.info.targetType==0)this.info.targetType=BufTargetType.Mine;
    }

    

    //////////////////////////////////////////
    //  +++ 入口函数！！+++
    //////////////////////////////////////////
    public running(isOldAction:boolean=false):void{


        //Buf是否可用
        if(this.isActived()==false)return;
        //检查触发概率
        if(this.hitTriggleRate()==false)return;

    
        //检查状态条件
        for(let i=0;i<this.info.filterInfos.length;i++){
            if(this.checkBufFilter(this.info.filterInfos[i])==false)return;
        }

        //检查叠加
        if(this.info.overLimit==OverlayLimit.Skill){
            for(let i=0;i<this.unit.bufMgr.bufList.length;i++){
                let tmpBufObj = this.unit.bufMgr.bufList[i];
                if(tmpBufObj.info.bufId==this.info.bufId){
                    return;
                }
            }
        }
        //类型互斥在effect里判断


        //开新包：Action
        if(isOldAction==false){
            this.pkg.buildNewAction(this.unit,ActionType.Buff);
        }

        //寻找目标//执行效果
        let targetUnits:Array<BattleUnit>=this.findTargetList();

        for(let j=0;j<targetUnits.length;j++){
            let targetUnit:BattleUnit|null = targetUnits[j];
            if(targetUnit==null)continue;
            if(targetUnit.isDead())continue; //死亡的不可复活
            
            targetUnit.triggleBufs(BufTriggleType.OnBufExe);
            let aoeReduce = this.info.targetReduce*j/100;
           
            //产生影响
            for(let k=0;k<this.info.effectInfos.length;k++){
                let curEffect:BufEffectInfo = this.info.effectInfos[k];
               
                // if(curEffect.overLimit==OverlayLimit.Type || this.info.overLimit==OverlayLimit.Type){
                //     let isOverLimit:boolean = false;

                //     // for(let i=0;i<this.unit.bufMgr.bufList.length;i++){
                //     //     let tmpBufObj = this.unit.bufMgr.bufList[i];
                //     //     for(let j=0;j<tmpBufObj.info.effectInfos.length;j++){
                //     //         let tmpEffect:BufEffectInfo = tmpBufObj.info.effectInfos[j];
                //     //         if(tmpEffect.type ==curEffect.type && tmpEffect.id == curEffect.id ){
                //     //             isOverLimit=true;
                //     //             break;
                //     //         }
                //     //     }
                //     //     if(isOverLimit)break;
                //     // }
                //     // if(isOverLimit)continue;
                // }

                this.doingEffect(targetUnit,this.info.effectInfos[k],aoeReduce);
            }
         }

         //挂包：Action
         if(isOldAction==false){
             this.pkg.closeAction();
         }

       

        //次数！
        this.info.useCount--;

        //挂状态 OnBufExeEnd
        this.unit.triggleBufs(BufTriggleType.OnBufExe);
    }




    //////////////////////////////////////////
    // 检查一个状态条件
    public checkBufFilter(filterInfo:BufFilterInfo|null):boolean{
        //根据命令字把多个item合起来
        let srcVal:number=0;

        if(filterInfo==null)return false;
        for(let i=0;i<filterInfo.items.length;i++){

            let item:BufFilterItem = filterInfo.items[i];

            let v = this.getFilterItemVal(item);
            switch(item.opt){
                case BufFilterOptCmd.None:
                case BufFilterOptCmd.Add:{
                    srcVal += v;
                    break;
                }
                case BufFilterOptCmd.Sub:{
                    srcVal -= v;
                    break;
                }
                case BufFilterOptCmd.Mul:{
                    srcVal *= v;
                    break;
                }
                case BufFilterOptCmd.Div:{
                    srcVal /= v;
                    break;
                }
            }
        }

        //后项的值
        let dstVal:number = filterInfo.val;

        //前后项比较
        let ret:boolean=true;
        switch(filterInfo.cmp){
            case BufFilterCmpCmd.CmpEQ:{
                ret = (srcVal == dstVal);
                break;
            }
            case BufFilterCmpCmd.CmpLT:{
                ret = (srcVal < dstVal);
                break;
            }
            case BufFilterCmpCmd.CmpGT:{
                ret = (srcVal > dstVal);
                break;
            }
            case BufFilterCmpCmd.CmpLE:{
                ret = (srcVal <= dstVal);
                break;
            }
            case BufFilterCmpCmd.CmpGE:{
                ret = (srcVal >= dstVal);
                break;
            }
        } 

        return ret;
    }
    

    ///////////////////////////////////////////////////////////////////////////
    //根据状态条件项的类型来取值
    public getFilterItemVal(item:BufFilterItem):number{
        switch(item.owner){
            case BufFilterOwnerType.Mine:{
                return this.unit.getAttr(item.attr);
            }
            case BufFilterOwnerType.Enemy:{
                if(this.unit.targetUnit!=null) return this.unit.targetUnit.getAttr(item.attr);
            }
        }
        return 0;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  寻找对手（多个）
    public findTargetList():Array<BattleUnit>{

        //没有目标？bug了
        if(this.unit.targetUnit!=null)return [];

        //单目标
        if(this.info.targetType == BufTargetType.Mine){
            return [this.unit];
        }else if(this.info.targetType == BufTargetType.Enemy){
            return [this.unit.targetUnit];
        }
        

        //多目标
        
        //先把数量计算出来！
        let count = 1;
        if(this.info.targetCounts.length==1){
            count= this.info.targetCounts[0];
        }else if(this.info.targetCounts.length>=2){
            count = BUtils.rndNum(this.info.targetCounts[0],this.info.targetCounts[1]);
        }

        //得到troop
        let targetTroop:BattleTroop= null;
        let skipPosList=[];

        if(this.info.targetType == BufTargetType.MyTroop){
            targetTroop = this.unit.troop;
        } else if(this.info.targetType == BufTargetType.MyFriend){
            targetTroop = this.unit.troop;
            skipPosList.push(this.unit.idx);
        } else if(this.info.targetType == BufTargetType.EnemyTroop){
            targetTroop = this.unit.targetUnit.troop;
        }else if(this.info.targetType == BufTargetType.EnemyFriend){
            targetTroop = this.unit.targetUnit.troop;
            skipPosList.push(this.unit.targetUnit.idx);
        }

        //根据AOE范围类型选对手
        return targetTroop.findTargets(count,skipPosList,this.info.targetRange);
    }





    ///////////////////////////////////////////////////////////////////////////
    //  执行技能效果
    public doingEffect(unit2:BattleUnit,effect:BufEffectInfo,aoeReduce:number=0):void{
       
        let unit1:BattleUnit =this.unit;


        //先判断概率！effect.rate 有设置时采用
        if(effect.rate>0){
            if(BUtils.hitRate(effect.rate)==false){
                return;
            }
        }
    
        //数值会每回合递增哦！
        if(effect.inc==null)effect.inc=0;
        let v0 = Math.floor(effect.val * (1+ (effect.inc/100)*this.roundSum)*(1-aoeReduce));


        //分头处理type
        switch(effect.type){

            case BufEffectType.Damage:{ //注意：damage都是伤害率！不需要管per字段
                
                if(unit2.isCanBeAttack()==false)break;


                let dmg0:number = this.unit.getSkillDamage(unit2);
                let dmg1:number = Math.floor(dmg0 * (v0/100));
                
                
                //闪避和无敌需要判断！
                let specAct:number=0;
                if(unit2.isCanBeHurt()==false){//判断无敌
                    dmg1 = 0;
                    specAct = SpecActType.NoHurt;
                }else if(unit1.checkDodge(unit2)){//判断闪避
                    dmg1 = 0;
                    specAct = SpecActType.Dodge;
                    unit1.triggleBufs(BufTriggleType.OnEnemyDodge);
                    unit2.triggleBufs(BufTriggleType.OnDodge);
                }

                //进行damage
                unit2.onDamage(unit1,dmg1);
    

                //掛包
                this.pkg.addNewEffect(unit2,BufEffectType.Damage,dmg1);
                if(specAct>0) this.pkg.curEffect.specActs.push(specAct);
                break;
            }

            case BufEffectType.Cure:{//注意：cure 都是治疗率！不需要管per字段

                if(unit2.isCanBeCure()==false)break;

                let hp0 = unit2.getBaseCureHP();
                let hp1 = Math.floor(hp0 *(v0/100));
                unit2.onCure(hp1);

                //掛包
                this.pkg.addNewEffect(unit2,BufEffectType.Cure,hp1);
                break;
            }

            //包含AttrAdd和AttrSub
            case BufEffectType.AddAttr:{
                //执行效果
                unit2.addAttrExt(effect.id,v0,effect.per);
                //这里要挂一个以后每回合执行的包
                let bufObj:BufObj = unit2.bufMgr.addEffectExeBuf(effect);

                //pkg处理
                this.pkg.addNewEffect(unit2,effect.type,v0,effect.id);
                this.pkg.curEffect.bufIdx = bufObj.bufIdx;
                break;
               
            }
            case BufEffectType.AddStatus:{
                //执行效果
                unit2.setAttrStatus(effect.id,1);
                //这里要挂一个以后每回合执行的包
                let bufObj:BufObj = unit2.bufMgr.addEffectExeBuf(effect);

                //pkg处理
                this.pkg.addNewEffect(unit2,effect.type,1,effect.id);
                this.pkg.curEffect.bufIdx = bufObj.bufIdx;
                break;
            }

            //清除Buf
            case BufEffectType.CleanBuf:{
                unit2.onClearStatusForm(effect.id);
                this.pkg.addNewEffect(unit2,BufEffectType.CleanBuf,effect.id);

                break;
            }

            //跳转调用buf
            case BufEffectType.LaunchTo:{

                unit2.bufMgr.addBufById(effect.id);   
                //注意这里不发包！
                break;
            }

            //////////////////////////////////
            //下面是执行类的type
            case BufEffectType.ExeAttr:{
                let v1= unit2.addAttrExt(effect.id,v0,effect.per);
                //注意这里不发包！
                break;
            }
            case BufEffectType.ExeStatus:{
                let v1= unit2.setAttrStatus(effect.id,1);
                //注意这里不发包！
                break;
            }
        }
     
    }

    



    //Buf是否处于可用状态
    public isActived():boolean{
        if(this.info.waitRound>0) return false; //还在等呢
        if(this.info.liveRound<=0) return false; //可用回合数用完了
        if(this.info.useCount<=0) return false; //可用次数用完了
        return true;        
    }

    

    
    //计算概率（要算上进准值
    public hitTriggleRate():boolean {
        if(BUtils.hitRate(this.info.triggleRate)) return true;
        return false;
    }



    //回合开始！
    public OnRoundBegin(){
    }

    //回合开始！
    public OnRoundEnd(){
        if(this.info.waitRound>0)this.info.waitRound--;
        if(this.info.liveRound>0)this.info.liveRound--;
        this.roundSum++;
    }

    //激活
    triggle(activeBufType:number):boolean{
        return true;
    }


    //释放的时候
    onExit(){

    }

    //释放接口
    dispose(){
        this.onExit();
    }
}



