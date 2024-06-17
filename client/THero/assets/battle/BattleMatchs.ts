import { BUtils } from "./BUtils";
import { BattlePackage } from "./BattlePackage";
import { BattleTroop } from "./BattleTroop";
import { BattleUnit } from "./BattleUnit";
import { RndMgr } from "./RndMgr";
import { AttrType, BufTriggleType, SkillType } from "./define/BDataComm";
import { PkgBattleInitData } from "./define/BattlePkgData";


//外围的战斗类
export class Battle{
    public pkg:BattlePackage;
    public troops:Array<BattleTroop> = [];
    public units:Array<BattleUnit>=[];
    public tmpUnits:Array<BattleUnit>=[];
    public _winner:number = 2; //平局


    //////////////////////////////////////////////////////////////////////
    //战斗类初始化部分
    //////////////////////////////////////////////////////////////////////

    constructor(){
        this.pkg = new BattlePackage(this);
    }



    public init(initData:PkgBattleInitData):void{
   
        this.pkg.initData = initData;
    
        //随机数种子
        RndMgr.ins.init(initData.rndSeedStr);

        let t1:BattleTroop = new BattleTroop(this,1,initData.troopInfos[0]);
        let t2:BattleTroop = new BattleTroop(this,2,initData.troopInfos[1]);
        this.troops.push(t1);
        this.troops.push(t2);
       
   
        //生成allUnits
        for(let k=0;k<2;k++){
            let troop:BattleTroop = this.troops[k];
            for(let j=0;j<troop.units.length;j++){
                this.units.push(troop.units[j]);
            }
        }
    }





    //////////////////////////////////////////////////////////////////////
    //战斗主循环
    //////////////////////////////////////////////////////////////////////

    public running():void{

        //挂载所有技能；触发battleBegin的buff
        this.pkg.addNewRound();//战斗开始包round=0

        for(let i=0;i<this.units.length;i++){
            this.units[i].handleSkills();
            this.units[i].triggleBufs(BufTriggleType.OnBattleBegin);
        }


        //回合循环
        for(let n=1;n<=100;n++){
            
            this.pkg.addNewRound();//新回合包
            
            
            //所有units按speed排序
            this.units.sort(function(u1:BattleUnit,u2:BattleUnit){
                if(u1!=null && u2!=null)
                    return (u2.getAttr(AttrType.Speed) - u1.getAttr(AttrType.Speed));
                return 0;
            });


            //每troop的units按威胁值排序
            for(let i=0;i<2;i++){
                this.troops[i].sortUnitThreats();
            }
            


            //每个unit要处理(begin,action,end要分别处理！！)
            for(let i=0;i<this.units.length;i++){
                this.units[i].onRoundBegin();
            }
            for(let i=0;i<this.units.length;i++){
                this.units[i].onRoundAction();
            }
            for(let i=0;i<this.units.length;i++){
                this.units[i].onRoundEnd();
            }

            //清除死人（要放后面，万一上一步units[i].onRoundEnd()复活了呢？）
            for(let i=0;i<this.units.length;i++){
                if(this.units[i].isDead()){
                    this.units.splice(i--,1); //一定要把i--,才不会跳过   
                }
            }

            //battleEnd判断
            if(this.isClose())break; 
        }


        ///////////////////////////////////
         //战斗结束
         this.pkg.onClose();
         console.log("EEEE");
    }


    
    //检查Battle是否结束
    public isClose():boolean{
        let troopStatus:Array<number>=[];
        let liveTroopCount:number=0;
        for(let k=0;k<2;k++){
            if(this.troops[k].isDead()==true){
                this._winner= (1-k)+1;

                return true;
            }
        }

        return false; 
    }

}