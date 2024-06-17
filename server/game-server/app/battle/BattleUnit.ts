import { Battle } from "./Battle";
import { BattlePackage } from "./BattlePackage";
import { BattleTroop } from "./BattleTroop";
import { BUtils } from "./BUtils";
import { ActionType, AttrType, BufStampType, BufTriggleType, SkillType, SpecActType, StatusType} from "./define/BDataComm";
import { BufMgr } from "./BufMgr";
import { BDataCfg } from "./BDataCfg";
import { SkillObj } from "./SkillObj";
import { BufEffectType, BufStatusFormType } from "./define/BufCfg";
import { HeroInfo } from "./define/BattlePkgData";




//战斗单元
export class BattleUnit{

    public battle:Battle;
    public troop:BattleTroop;
    public pkg:BattlePackage;
    public bufMgr:BufMgr;

    public info:Object;
    public unitCfg:Object ={};

    public idx:number=0; //在troop中的序号
    public pos:number=0; //阵型位置

    //  public attrs:Map<AttrType,number> =new Map();
    public attrVals:number[]=[];; //额外属性的具体数值
    public attrExtVals:number[]=[]; //额外属性的具体数值

    public statusList:number[]=[]; //状态球（每个需要有

    public targetUnit:BattleUnit|null=null;
    public activeSkills:SkillObj[]=[];
    

    

    public constructor(troop:BattleTroop,heroInfo:HeroInfo,idx:number){
        this.troop = troop;
        this.battle = troop.battle;
        //this.idx = idx;
        this.idx = troop.idx*10 + idx;
        

        this.pkg = this.battle.pkg;
        this.bufMgr = new BufMgr(this.battle,this);

        this.info = heroInfo;
        this.unitCfg = BDataCfg.ins.getPetCfg(heroInfo["id"]);

        //硬copy
        for(let i=0;i<heroInfo.attrs.length;i++){
            this.attrVals.push(heroInfo.attrs[i]);
        }
        //当前血量要赋值！
        this.attrVals[AttrType.CurHP]=this.attrVals[AttrType.HP];
    }








    /////////////////////////////////////////////////////////////////////
    //  回合操作入口
    /////////////////////////////////////////////////////////////////////

    //回合开始
    public onRoundBegin(){

        if(this.pkg.roundNo==6 && this.idx==22){
            let ttt=0;
        }

        this.triggleBufs(BufTriggleType.OnRoundBegin);
        this.bufMgr.onRoundBegin();

      
    }


    //回合结束
    public onRoundEnd(){

        //死了就不要跑！
        if(this.isDead())return; 

        this.triggleBufs(BufTriggleType.OnRoundEnd);
        this.bufMgr.onRoundEnd();

        //自愈率在这里处理！每回合都治！
        if(this.getAttr(AttrType.CureRate)>0){
            let cureHP = Math.floor(this.getAttr(AttrType.HP)*this.getAttr(AttrType.CureRate)/100);
            let hp=this.addHP(cureHP);

            //这里要加个包
            this.pkg.buildNewAction(this,ActionType.Cure);
            this.pkg.addNewEffect(this,BufEffectType.Cure,hp);
        }

        //清除一堆buff（每回合重新生成)
        this.statusList=[];
        this.attrExtVals=[];
    }


    public clearStatusList(){
        this.statusList=[];
    }
    


    //回合执行
    public onRoundAction():void{

        if(this.isDead())return ;
        this.triggleBufs(BufTriggleType.OnActionBegin); 
        

        //寻敌onFindTarget
        let targetTroop:BattleTroop = this.getEnemyTroop();
        this.targetUnit = targetTroop.onFindTarget();
        if(this.targetUnit==null){
            this.triggleBufs(BufTriggleType.OnActionEnd); 
            return;
        }else{
            this.targetUnit.targetUnit = this; //反过来也需要标记！互为对手！
        }


        let unit1:BattleUnit=this;
        let unit2:BattleUnit = this.targetUnit;
        let isSkillUsed:boolean=false;

        //发动主动技能(要看能不能发动)
        if(this.isCanSkill()==true){

            for(let i=0;i<this.activeSkills.length;i++){
                let skillObj:SkillObj = this.activeSkills[i];
                if(skillObj==null)continue;

                if(skillObj.canUseSkill()==true){

                    BUtils.trace("doingSkill");

                    this.triggleBufs(BufTriggleType.OnSkillBegin);
                    skillObj.doingSkill();
                    isSkillUsed=true;

                    this.triggleBufs(BufTriggleType.OnSkillEnd);
                }
            } 
        }

        //没执行技能，就发动普攻
        if(isSkillUsed==false){

            //判断连击次数
            let isCombo:boolean=false;
            let comboCount:number=0;
            if(this.checkAttrStatus(StatusType.DblAttack)){
                this.useAttrStatus(StatusType.DblAttack);
                isCombo = true;
                comboCount=1;
            }else{
                do{
                    if (this.checkCombo(unit2)==false) {
                        break;
                    }else{
                        isCombo = true;
                        comboCount++;
                    }
                }while(isCombo && comboCount<3); //最多只能连击3次
            } 

            for(let i=0;i<comboCount+1;i++){
                //判断对方是否被打死了
                if(this.targetUnit.isDead())break;
                
                this.triggleBufs(BufTriggleType.OnAttackBegin);
                this.targetUnit.triggleBufs(BufTriggleType.BeAttackBegin);

                if(i==0){
                    //普攻的处理
                    this.doingAttack(ActionType.Attack);
                }else{
                    //连击的处理
                    this.doingAttack(ActionType.Combo);
                }

                this.triggleBufs(BufTriggleType.OnAttackEnd);
                unit2.triggleBufs(BufTriggleType.BeAttackEnd);
            }
        }

        //行动结束
        this.targetUnit = null; //目标要清空
        this.triggleBufs(BufTriggleType.OnActionEnd); 
    }




    
    /////////////////////////////////////////////////////////////////////
    //  功能函数
    /////////////////////////////////////////////////////////////////////

    //挂接技能
    public handleSkills():void{

        if(this.info["skills"]==null)return;
        for ( let i=0;i< this.info["skills"].length;i++){
            let skillUid:number = this.info["skills"][i];
            let skillCfg = BDataCfg.ins.getSkillCfg(skillUid);
            if(skillCfg==null)continue;
            
            if(skillCfg["skillType"]==SkillType.AttrSkill)continue; //属性型技能不在战斗中起作用

            let skillObj:SkillObj = new SkillObj(this,skillCfg);

            if(skillCfg["skillType"]==SkillType.PassiveSkill){  //被动技能马上执行
                skillObj.doingSkill();
            }else if(skillCfg["skillType"]==SkillType.ActiveSkill){
                this.activeSkills.push(skillObj);
            }
        }
    } 


    //执行普攻
    public doingAttack(actType:ActionType=0,targetUnit:BattleUnit=null){

        if(targetUnit!=null)this.targetUnit = targetUnit;
        if(this.targetUnit==null)return;
        
        //被控了无法进攻；
        if(this.isCanAttack()==false)return;


        let dmg = 0;
        let unit1:BattleUnit = this;
        let unit2:BattleUnit = this.targetUnit;
        let specAct:SpecActType=0;

        //计算标准伤害
        dmg =this.getDamage(this.targetUnit);
        let isTrump=false;

                
        //闪避和无敌需要判断！
        if(unit2.isCanBeHurt()==false){//判断无敌
            dmg = 0;
            specAct = SpecActType.NoHurt;
        }else if(BUtils.hitRate(unit2.getAttr(AttrType.DodgeRate)-unit1.getAttr(AttrType.RsDodgeRate))){//判断闪避
            dmg = 0;
            specAct = SpecActType.Dodge;
        }else if( BUtils.hitRate(unit1.getAttr(AttrType.TrumpRate)-unit2.getAttr(AttrType.RsTrumpRate)) ){//判断暴击
            dmg = dmg * ( 1 + unit1.getAttrInRate(AttrType.TrumpDmgRate) -unit2.getAttrInRate(AttrType.RsTrumpDmgRate));
            specAct = SpecActType.Trump;
        }
   
        
        let dmg1 = unit2.onDamage(unit1,dmg);

        this.pkg.buildNewAction(this,actType);
        this.pkg.addNewEffect(unit2,BufEffectType.Damage,dmg1);
        if(specAct>0) this.pkg.curEffect.specActs.push(specAct);

        //有没有击晕
        if( this.checkStun(unit2) ){
            //对手晕了！
            unit2.setAttrStatus(StatusType.NoAction);
            this.pkg.curEffect.specActs.push(SpecActType.Stun);
        }

        //有没有吸血？（挂新包）
        let bloodRate = unit1.getAttr(AttrType.BloodRate)-unit2.getAttr(AttrType.RsBloodRate);
        if(bloodRate>0){
            let bloodHP = Math.floor(dmg1*bloodRate/100); //吸血数量=damage*吸血率；
            unit1.addHP(bloodHP);

            this.pkg.addNewEffect(this,BufEffectType.Cure,bloodHP);
            this.pkg.curEffect.specActs.push(SpecActType.Blood);
        }

        //pkg包关闭
        this.pkg.closeAction();


        //打人之后要判断反击(注意！本次是反击的attack，不能再次反击)
        if(actType!=ActionType.Counter){
            if( this.checkCounter(unit2) ){
                unit2.doingAttack(ActionType.Counter,unit1);
            }
        }


        this.pkg.closeAction();

        if(specAct==SpecActType.Trump){
            this.triggleBufs(BufTriggleType.OnTrump);
            unit2.triggleBufs(BufTriggleType.OnEnemyTrump);
        }else if(specAct==SpecActType.Dodge){
            this.triggleBufs(BufTriggleType.OnEnemyDodge);
            unit2.triggleBufs(BufTriggleType.OnDodge);
        }

    }

   
   
   
    //##################################################


    public onClearStatusForm(formType:BufStatusFormType){
        let statusList = [ [
                //0=好的
                StatusType.NotBeAttack,
                StatusType.NotBeControl,
                StatusType.NotBeHurt,
                StatusType.NotBeSkill
            ],[
                //1=差的
                StatusType.NoAction,
                StatusType.NoAttack,
                StatusType.NoSkill,
                StatusType.NoCure
            ],[
                //印记
            ]        
        ];

        if(formType<0||formType>2)return;
        let statusArr = statusList[formType];

        for(let i=0;i<statusArr.length;i++){
            let k = statusArr[i];
            this.statusList[k]=0;
        }
    }


    ///////////////////////////////////////////////////////////////
    //状态的判断

    public isCanAttack():boolean{
        if(this.checkAttrStatus(StatusType.NoAction))return false; 
        if(this.checkAttrStatus(StatusType.NoAttack))return false; 
        return true;
    }

    public isCanSkill():boolean{
        if(this.checkAttrStatus(StatusType.NoAction))return false; 
        if(this.checkAttrStatus(StatusType.NoSkill))return false; 
        return true;
    }

    public isCanBeCure():boolean{
        if(this.targetUnit==null)return false;
        if(this.checkAttrStatus(StatusType.NoCure))return false; 
        return true;
    }

    public isCanBeAttack():boolean{
        if(this.checkAttrStatus(StatusType.NotBeAttack))return false; 
        return true;
    }

    public isCanBeSkill():boolean{
        if(this.checkAttrStatus(StatusType.NotBeSkill))return false; 
        return true;
    }

    public isCanBeHurt():boolean{
        if(this.checkAttrStatus(StatusType.NotBeHurt))return false; 
        return true;
    }






    

    //被伤害
    public onDamage(srcUnit:BattleUnit,dmg0:number):number{
        let dmg = Math.floor(dmg0);
        
        //真实扣血
        let curHP = this.getAttr(AttrType.CurHP);
        dmg = ( curHP <dmg) ? curHP :dmg;
        this.addAttr(AttrType.CurHP,0-dmg);


        //buff触发处理
        this.triggleBufs(BufTriggleType.BeDamage);

        return dmg;
    }




    //被治疗（技能发动）
    public onCure(hp0:number):number{

        //死了不可复活！
        if(this.isDead())return;
        let hp = this.addHP(hp0);

        //buff触发处理
        this.triggleBufs(BufTriggleType.OnCure);
        return hp;
    }


    public addHP(hp0:number):number{
        let hp = Math.floor(hp0);
        let maxAddHp = this.getAttr(AttrType.HP) - this.getAttr(AttrType.CurHP);
        hp = ( maxAddHp <hp) ? maxAddHp :hp;
        this.addAttr(AttrType.CurHP,hp);

        return hp;
    }

    


    //////////////////////////////////////////////////

    public getAttr(type:number):number{

       
        //特殊处理
        if(type ==AttrType.CurHPPer){
            return this.getAttr(AttrType.CurHP)/this.getAttr(AttrType.HP);
        }

        let extVal:number=this.attrExtVals[type]|0;
        let v = this.getAttrBase(type)  + extVal;

        if(v<0) v=0;

        return v;
    }
  
    public addAttr(type:number,val:number){
        this.attrVals[type] +=BUtils.toInt(val);
    }


    public setAttr(type:number,val:number){
        this.attrVals[type] =BUtils.toInt(val);
    }
    
    
    
    //读取状态
    public checkAttrStatus(type:number):boolean{
        //特殊属性值，每点=0.1%概率(per返回是*100)
        return (this.statusList[type]>0);
    }
    
    //取出状态并减1
    public useAttrStatus(type:number):void{
        //特殊属性值，每点=0.1%概率(per返回是*100)
        if(this.statusList[type]==null){
            this.statusList[type]=0;
            return;
        }else{
            this.statusList[type]--;
        }
    }

    //设置状态
    public setAttrStatus(type:number,val:number=1):void{
        //特殊属性值，每点=0.1%概率(per返回是*100)
        if(this.statusList[type]==null){
            this.statusList[type]=0;
        }        
        
        this.statusList[type]=val;
    }


    

    public getAttrInRate(type:number):number{
        //特殊属性值，每点=0.1%概率(返回是*100)
        return this.getAttr(type)/100;
    }


    public addAttrExt(type:number,val0:number,isPercent:boolean=false){
        let val1 = val0;
        if(isPercent==true){
            val1 = BUtils.toInt(this.getAttrBase(type) * val0/100);
        }

        if(this.attrExtVals[type]==null)this.attrExtVals[type]=0;
        this.attrExtVals[type] += val1;
        return val1;
    }
    
    


     public getAttrBase(type:number):number{
        if(this.attrVals[type]!=null){
            return this.attrVals[type];
        }else{
            return 0;
        }
    }


       
    public isDead():boolean{
        if(this.getAttr(AttrType.CurHP)<=0) return true;
        return false;
    }

    public getEnemyTroop():BattleTroop{
        return this.battle.troops[1-(this.troop.idx-1)];;
    }

    public triggleBufs(type:BufTriggleType){
        return this.bufMgr.triggleBufs(type); //跳转而已
    }

    

    ///////////////////////////////////////////////////////////////////////////
    //  暴连闪反晕的概率判断
    ///////////////////////////////////////////////////////////////////////////

    //判断暴击
    public checkTrump(unit2:BattleUnit):boolean{
        if(unit2==null)return;
        let rate:number = this.getAttr(AttrType.TrumpRate)-unit2.getAttr(AttrType.RsTrumpRate);
        if( BUtils.hitRate(rate) ==false)return false;
        return true;         
    }
    

    //判断连击
    public checkCombo(unit2:BattleUnit):boolean{
        if(unit2==null)return;
        let rate:number = this.getAttr(AttrType.ComboRate)-unit2.getAttr(AttrType.RsComboRate);
        if( BUtils.hitRate(rate) ==false)return false;
        return true;         
    }

    
    //判断击晕
    public checkStun(unit2:BattleUnit):boolean{
        if(unit2==null)return;
        let rate:number = this.getAttr(AttrType.StunRate)-unit2.getAttr(AttrType.RsStunRate);
        if( BUtils.hitRate(rate) ==false)return false;
        return true;         
    }

  
    //判断闪避(对手)
    public checkDodge(unit2:BattleUnit):boolean{
        if(unit2==null)return;
        let rate:number = unit2.getAttr(AttrType.DodgeRate)-this.getAttr(AttrType.RsDodgeRate);
        if( BUtils.hitRate(rate) ==false)return false;
        return true;         
    }

    //判断反击(对手)
    public checkCounter(unit2:BattleUnit):boolean{
        if(unit2==null)return;
        let rate:number = unit2.getAttr(AttrType.CounterRate)-this.getAttr(AttrType.RsCounterRate);
        if( BUtils.hitRate(rate) ==false)return false;
        return true;         
    }

    
    //获得暴伤率
    public getTrumpDmgRate(unit2:BattleUnit):boolean{
        if(unit2==null)return;

        //暴伤率默认为150%，爆伤范围在[120%，300%]之间
        let rate:number = 1.5 + this.getAttrInRate(AttrType.TrumpDmgRate)-unit2.getAttrInRate(AttrType.RsTrumpDmgRate);
        if(rate<1.2)rate=1.2;
        if(rate>3.0)rate=3.0;
       
        unit2.getAttr(AttrType.CounterRate)-this.getAttr(AttrType.RsCounterRate);
        if( BUtils.hitRate(rate) ==false)return false;
        return true;         
    }




    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////

    public getDamage(unit2:BattleUnit){

        let dmg0 = this.getBaseDamage(unit2);
        //乘以双方的增伤减伤
        let r=0;
        r += this.getAttr(AttrType.DmgExtRate);
        r -= unit2.getAttr(AttrType.RsDmgExtRate);
        let dmg = dmg0 * (1+r/100);
        return dmg;
    }


    public getSkillDamage(unit2:BattleUnit){

        let dmg0 = this.getBaseDamage(unit2,true);
        //乘以双方的增伤减伤
        let r=0;
        r += this.getAttr(AttrType.DmgExtRate);
        r -= unit2.getAttr(AttrType.RsDmgExtRate);
        let dmg = Math.floor(dmg0 * (1+r/100)) ;

        return dmg;
    }
    
        
    //基准伤害计算
    public getBaseDamage(unit2:BattleUnit,isSkill:boolean=false){

        let A = 1;
        let B = 1;

        if(isSkill==false){
            let blockRate  =unit2.getAttr(AttrType.BlockRate)-this.getAttr(AttrType.RsBlockRate);
            let pierceRate  =this.getAttr(AttrType.PierceRate)-unit2.getAttr(AttrType.RsPierceRate);
            if(blockRate<0)blockRate=0;
            if(blockRate>80)blockRate=80;
            if(pierceRate<0)pierceRate=0;
            if(pierceRate>80)pierceRate=80;
            
            A = this.getAttr(AttrType.Attack)*(1-blockRate/100);
            B = unit2.getAttr(AttrType.Defense)*(1-pierceRate/100);
        }else{
            let blockRate  =unit2.getAttr(AttrType.BlockRateS)-this.getAttr(AttrType.RsBlockRateS);
            let pierceRate  =this.getAttr(AttrType.PierceRateS)-unit2.getAttr(AttrType.RsPierceRateS);
            if(blockRate<0)blockRate=0;
            if(blockRate>80)blockRate=80;
            if(pierceRate<0)pierceRate=0;
            if(pierceRate>80)pierceRate=80;

            A = this.getAttr(AttrType.AttackS)*(1-blockRate/100);
            B = unit2.getAttr(AttrType.DefenseS)*(1-pierceRate/100);
        }
    
        
        //克制
        let dmg=0;
        if(this.battle.battleType==2){
            dmg = this.calcDamageByFomula02(A,B);
        }else{
            dmg = this.calcDamageByFomula01(A,B);
        }

        dmg = dmg* this.getRestrainRate(this,unit2);

        return dmg;
    }


    public getRestrainRate(unit1:BattleUnit,unit2:BattleUnit){
        if(unit1.unitCfg!=null&&unit2.unitCfg!=null){
            let restrainRate:number = BDataCfg.ins.getRestrainVal(unit1.unitCfg["petType"],unit2.unitCfg["petType"]);
            return restrainRate;
        }
        return 1;
    }

    
    public calcDamageByFomula01(A:number,B:number){
        let dmg = 1.5 * A* A/ (1+A/2+B) ;
        return dmg;
    }

    public calcDamageByFomula02(A:number,B:number){
        let dmg = A-B;
        if(dmg<0)dmg=0;
        return dmg;
    }


    //基础医疗值
    //暂定=maxHP
    public getBaseCureHP(){
        
        //暂定，每一点特攻加1点血
        let A = this.getAttr(AttrType.AttackS);
        let hp = A;

        return hp;
    }
    


}




