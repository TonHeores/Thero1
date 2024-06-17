//战斗中队伍
const C_TroopMaxUnitCount=9;
    
import { Battle } from "./Battle";
import { BattleUnit } from "./BattleUnit";
import { BUtils } from "./BUtils";
import { TroopInfo } from "./define/BattlePkgData";
import {  AttrType } from "./define/BDataComm";
import { TargetRangeType } from "./define/BufCfg";

//抽象出来的部队逻辑
export class BattleTroop{
    //数据
    public battle:Battle;
    public info:TroopInfo;
    public units:Array<BattleUnit>=[];
    public tmpUnits:Array<BattleUnit>=[];

    public idx:number;


    

    constructor(battle:Battle,idx:number,troopInfo:TroopInfo){
        this.battle = battle;
        this.idx = idx;
        this.info=troopInfo;
       
      

        for(let i=0;i<this.info.heroInfos.length;i++){
           let unit:BattleUnit = new BattleUnit(this,this.info.heroInfos[i],i+1);
           this.units.push(unit);
           this.tmpUnits.push(unit);

         }
    }



    //死了没有？
    public isDead():boolean{
        for(let i=0;i<this.units.length;i++){
            if(this.units[i].isDead()==false){
                return false;
            }
        }
        return true;
    }


    public getUnitByIdx(idx:number):BattleUnit{
        if(idx>=0 && idx<this.units.length){
            return this.units[idx];
        }else{
            return null;
        }        
    }




    


    ////////////////////////////////////////////////////////////////////////////
    //被对手执行寻敌规则
    ////////////////////////////////////////////////////////////////////////////


    public sortUnitThreats():void{
        this.tmpUnits.sort(function(u1:BattleUnit,u2:BattleUnit){
            if(u1!=null && u2!=null)
                return (u2.getAttr(AttrType.Threat) - u1.getAttr(AttrType.Threat));
            return 0;
        });
    }
    
    
    //普通寻敌，寻1只
    public onFindTarget(isSkill:boolean=false):BattleUnit{
        for(let i=0;i<this.tmpUnits.length;i++){ 
            
            let unit:BattleUnit = this.tmpUnits[i];

            if(unit==null)continue;
            if(unit.isDead())continue;
            
            //受攻击/受技能的判断
            if(isSkill==false){
                if(unit.isCanBeAttack()==false)continue;
            }else{
                if(unit.isCanBeSkill()==false)continue;
            }

            return this.tmpUnits[i];
        }

        return null;
    }
    



    //根据位置来找到目标units
    public findTargets(count:number,skipPosList:number[],rangeType:TargetRangeType):Array<BattleUnit>{
        let units:Array<BattleUnit>=[];
        let findCount:number=0;

        //随机逻辑
        let arr=[];
        if(rangeType==TargetRangeType.Random){
            arr =BUtils.genRndOrderList(this.tmpUnits.length);
        }else{
            for(let i=0;i<this.tmpUnits.length;i++){ 
                let idx = (rangeType==TargetRangeType.Contrary)? i:(this.tmpUnits.length-i-1);
                arr.push(idx);
            }
        }

        for(let i=0;i<arr.length;i++){ 
            let idx = arr[i];

            //判断在不在skipPos中
            if(skipPosList.indexOf(idx)>=0)continue;

            //unit
            let unit:BattleUnit = this.tmpUnits[idx];
            if(unit==null)continue;
            if(unit.isDead())continue;
            if(unit.isCanBeSkill()==false)continue;//受技能的判断(寻找多目标就是skill！)

            //找到
            units.push(unit);

            //计数
            findCount++;
            if(findCount>=count){
                return units;
            }
        }

        return units;    
    }


}