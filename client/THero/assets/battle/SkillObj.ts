import { BDataCfg} from "./BDataCfg";
import { BUtils } from "./BUtils";
import { Battle } from "./Battle";
import { BattlePackage } from "./BattlePackage";
import { BattleUnit } from "./BattleUnit";
import { BufObj } from "./BufObj";
import { ActOccasionType, ActionType, AttrType, BufTriggleType } from "./define/BDataComm";


export class SkillObj{
    public battle:Battle;
    public unit:BattleUnit;
    public pkg:BattlePackage;
    

    public skillUid:number;
    public skillId:number;
    public skillCfg:Object;
    

    constructor(unit:BattleUnit,skillCfg:Object){


        this.unit=unit;
        this.battle = unit.battle;
        this.pkg = unit.battle.pkg;

        if(skillCfg==null)return;
        this.skillCfg = skillCfg;
        this.skillUid = skillCfg["skillUid"];
        this.skillId = this.skillCfg["skillId"];

    }

    

    public canUseSkill(){
        if(this.skillUid<=0)return false; //死了
        if(this.unit.isDead())return false; //死了

        if(this.unit.isCanSkill()==false) return false; //被控了！ 

        //判断是否触发（要加上幸运值）
        let skillRate = this.skillCfg["actRate"] + this.unit.getAttr(AttrType.LuckRate);
        if(BUtils.hitRate(skillRate)==false)return false; //技能没触发

        return true;
    }



    public doingSkill(){

        if(this.skillCfg["bufIds"]==null)return;

        //加入新包
        this.pkg.buildNewAction(this.unit,ActionType.Skill,this.skillId);

        //挂载SKill Buf,
        
        for(let j=0;j<this.skillCfg["bufIds"].length;j++){
            let bufId= this.skillCfg["bufIds"][j];

            let bufCfg = BDataCfg.ins.getBufCfg(bufId);
            if(bufCfg==null)continue;
            let bufObj:BufObj = new BufObj(this.unit);
            bufObj.init(bufCfg);

            //判断场合
            if(bufCfg.isAttr==ActOccasionType.Attr){
                continue; //这个buf不能用
            }

            if(bufCfg.triggleType==BufTriggleType.DoingNow){
                if(BUtils.hitRate(bufCfg.handleRate)){
                    bufObj.running(true);
                }
            }else{
                this.unit.bufMgr.addBuf(bufObj);
            }
        }

        this.pkg.closeAction();
    }



    public static getSkillUid(skillId:number,lv:number){
        return skillId*100+lv;
    }
}