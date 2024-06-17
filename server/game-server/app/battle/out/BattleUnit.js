import { FightObj } from "./FightObj";
import { BUtils } from "./BUtils";
import { ActionType, AttrType, BufStatusType, BufTriggleType, SpecAttackType } from "./define/BDataComm";
import { BufMgr } from "./BufMgr";
import { UnitInfo } from "./define/UnitInfo";
import { SkillObj } from "./SkillObj";
//战斗单元
export class BattleUnit {
    constructor(troop, heroInfo, pos) {
        this._info = new UnitInfo();
        this.idx = 0; //在troop中的序号
        this.pos = 0; //阵型位置
        this.curHP = 0;
        this.maxHP = 0;
        this.attrs = new Map();
        this.attrExtVals = new Map(); //额外属性的具体数值
        this.attrExtPers = new Map(); //额外属性的百分比
        this.statusMap = new Map(); //状态球（每个需要有
        this.stampMap = new Map(); //额外属性的百分比
        this.targetUnit = null;
        this._troop = troop;
        this._battle = troop._battle;
        this._info.set(heroInfo, pos);
        this.pkg = this._battle.pkg;
        this.fightObj = new FightObj(this);
        this.bufMgr = new BufMgr(this._battle, this);
    }
    onRoundBegin() {
        this.triggleBufs(BufTriggleType.OnRoundBegin);
    }
    onRoundEnd() {
        this.triggleBufs(BufTriggleType.OnRoundEnd);
        //清除一堆buff（每回合重新生成)
        this.attrExtPers.clear();
        this.attrExtVals.clear();
        this.statusMap.clear();
        this.stampMap.clear();
    }
    //执行被动技能(挂接)
    handleSkills() {
        this.actSkill = new SkillObj(this, this._info.activeSkill);
        for (let i = 0; i < this._info.passiveSkills.length; i++) {
            let skillObj = new SkillObj(this, this._info.passiveSkills[i]);
            skillObj.doingSkill();
        }
    }
    ///////////////////////////////////////////
    //执行一场1v1战斗（Fight）
    runningAction() {
        if (this.isDead())
            return;
        this.triggleBufs(BufTriggleType.OnActionBegin);
        BUtils.trace("OnActionBegin");
        //寻敌
        let targetTroop = this.getEnemyTroop();
        this.targetUnit = targetTroop.findTargetObj.onFindTarget();
        BUtils.trace("onFindTarget", this.targetUnit.idx);
        if (this.targetUnit == null) {
            this.triggleBufs(BufTriggleType.OnActionEnd);
            return;
        }
        //发动主动技能(要看能不能发动)
        if (this.actSkill.canUseSkill() == true) {
            this.triggleBufs(BufTriggleType.OnSkillBegin);
            BUtils.trace("doingSkill");
            this.actSkill.doingSkill();
            this.triggleBufs(BufTriggleType.OnSkillEnd);
        }
        else {
            //进攻
            let attackNum = 1; //连击判断
            if (this.checkAttrStatus(AttrType.StatDblAttack)) {
                this.setAttrStatus(AttrType.StatDblAttack, 0);
                attackNum = 2;
            }
            for (let n = 0; n <= attackNum; n++) {
                //pkg开新action
                this._battle.pkg.addNewAction(this, ActionType.Attack);
                this.triggleBufs(BufTriggleType.OnAttackBegin);
                this.targetUnit.triggleBufs(BufTriggleType.BeAttackBegin);
                BUtils.trace("doingAttack");
                this.doingAttack();
                this.triggleBufs(BufTriggleType.OnAttackEnd);
                this.targetUnit.triggleBufs(BufTriggleType.BeAttackEnd);
            }
        }
        //行动结束
        this.triggleBufs(BufTriggleType.OnActionEnd);
    }
    //##################################################
    //执行普攻
    doingAttack() {
        let dmg = 0;
        let dmgType = 0;
        if (this.targetUnit == null)
            return;
        //被控了无法进攻；
        if (this.isCanAttack() == false)
            return;
        //判断闪避
        if (BUtils.hitRate(this.targetUnit.getAttrInPer(AttrType.DodgeRate) - this.getAttrInPer(AttrType.RsDodgeRate))) {
            dmg = 0;
            dmgType = SpecAttackType.Dodge;
            this.triggleBufs(BufTriggleType.OnEnemyDodge);
            this.targetUnit.triggleBufs(BufTriggleType.OnDodge);
        }
        else {
            dmg = this.fightObj.getDamage(this.targetUnit);
            //判断暴击
            if (BUtils.hitRate(this.getAttrInPer(AttrType.TrumpRate) - this.targetUnit.getAttrInPer(AttrType.RsTrumpRate))) {
                dmg = dmg * (1 + this.getAttrInRate(AttrType.TrumpDmgRate));
                dmgType = SpecAttackType.Trump;
                this.triggleBufs(BufTriggleType.OnTrump);
                this.targetUnit.triggleBufs(BufTriggleType.OnEnemyTrump);
            }
        }
        //执行(dmg1是真实扣血！)
        this.fightObj.doingDamageInAttack(this.targetUnit, dmg);
        this.pkg.curAction.actAttackInfo.specAtkType = dmgType;
        console.log("3333,dmg:", dmg);
        console.log(this.pkg.curAction);
    }
    //##################################################
    onClearStatus(goodBuflag) {
        let statusList = [[
                //0=好的
                BufStatusType.NotBeAttack,
                BufStatusType.NotBeControl,
                BufStatusType.NotBeHurt,
                BufStatusType.NotBeSkill
            ], [
                //1=差的
                BufStatusType.NoAction,
                BufStatusType.NoAttack,
                BufStatusType.NoSkill,
                BufStatusType.NoCure
            ]];
        if (goodBuflag < 0 || goodBuflag > 1)
            return;
        let statusArr = statusList[goodBuflag];
        for (let i = 0; i < statusArr.length; i++) {
            let k = statusArr[i];
            this.statusMap[k] = false;
        }
    }
    ///////////////////////////////////////////////////////////////
    //状态的判断
    isCanAttack() {
        if (this.statusMap[BufStatusType.NoAction])
            return false;
        if (this.statusMap[BufStatusType.NoAttack])
            return false;
        return true;
    }
    isCanSkill() {
        if (this.statusMap[BufStatusType.NoAction])
            return false;
        if (this.statusMap[BufStatusType.NoSkill])
            return false;
        return true;
    }
    isCanCure() {
        if (this.targetUnit == null)
            return false;
        if (this.statusMap[BufStatusType.NoCure])
            return false;
        return true;
    }
    isCanBeAttack() {
        if (this.statusMap[BufStatusType.NotBeAttack])
            return false;
        return true;
    }
    isCanBeSkill() {
        if (this.statusMap[BufStatusType.NotBeSkill])
            return false;
        return true;
    }
    isCanBeHurt() {
        if (this.statusMap[BufStatusType.NotBeHurt])
            return false;
        return true;
    }
    //治疗（技能发动）
    onCure(hp) {
    }
    //////////////////////////////////////////////////
    getAttr(type) {
        let extPer = this.attrExtPers[type] | 0;
        let extVal = this.attrExtVals[type] | 0;
        //console.log(extPer,extVal,this.attrExtPers[type],this.attrExtVals[type])
        let v = this.getAttrBase(type) * (1 + extPer / 100) + extVal;
        return v;
    }
    //读取状态
    checkAttrStatus(type) {
        //特殊属性值，每点=0.1%概率(per返回是*100)
        return (this.attrExtVals[type] > 0);
    }
    //取出状态并减1
    useAttrStatus(type) {
        //特殊属性值，每点=0.1%概率(per返回是*100)
        this.attrExtVals[type]--;
    }
    //设置状态
    setAttrStatus(type, val) {
        //特殊属性值，每点=0.1%概率(per返回是*100)
        this.attrExtVals[type] = val;
    }
    getAttrInPer(type) {
        //特殊属性值，每点=0.1%概率(per返回是*100)
        return this.getAttr(type) / 10;
    }
    getAttrInRate(type) {
        //特殊属性值，每点=0.1%概率(返回是*100)
        return this.getAttr(type) / 1000;
    }
    addAttrExt(type, val0, isPercent = false) {
        let val1 = val0;
        if (isPercent == true) {
            val1 = this.getAttrBase(type) * (1 + val0 / 100);
        }
        this.attrExtVals[type] += val1;
        return val1;
    }
    getAttrBase(type) {
        switch (type) {
            case AttrType.Attack: {
                return this._info.attack;
            }
            case AttrType.Defence: {
                return this._info.defense;
            }
            case AttrType.Speed: {
                return this._info.speed;
            }
            case AttrType.CurHP: {
                return this._info.curHP;
            }
            case AttrType.MaxHP: {
                return this._info.maxHP;
            }
        }
        //都娶不到！
        return 0;
    }
    getBufStatus(type) {
        return 0;
    }
    getBufStamp(type) {
        return 0;
    }
    isDead() {
        if (this.getAttr(AttrType.CurHP) <= 0)
            return true;
        return false;
    }
    getEnemyTroop() {
        return this._battle.troops[1 - this._troop.idx];
        ;
    }
    triggleBufs(type) {
        return this.bufMgr.triggleBufs(type); //跳转而已
    }
}
