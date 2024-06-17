import { AttrType, BufTriggleType } from "./define/BDataComm.js";
//回合中的战斗类
export class FightObj {
    constructor(unit) {
        this._unit = unit;
        this._battle = unit._battle;
        this.pkg = unit._battle.pkg;
    }
    getDamage(unit2) {
        let unit1 = this._unit;
        let dmg0 = this.getBaseDamage(unit2);
        //乘以双方的增伤减伤
        let r = 0;
        r += unit1.getAttr(AttrType.ExtDmgAll);
        r += unit1.getAttr(AttrType.ExtDmgNormal);
        r -= unit2.getAttr(AttrType.ExtRsDmgAll);
        r -= unit2.getAttr(AttrType.ExtRsDmgNormal);
        let dmg = dmg0 * (1 + r);
        return dmg;
    }
    getSkillDamage(unit2) {
        let unit1 = this._unit;
        let dmg0 = this.getBaseDamage(unit2);
        //乘以双方的增伤减伤
        let r = 0;
        r += unit1.getAttr(AttrType.ExtDmgAll);
        r += unit1.getAttr(AttrType.ExtDmgSkill);
        r -= unit2.getAttr(AttrType.ExtRsDmgAll);
        r -= unit2.getAttr(AttrType.ExtRsDmgSkill);
        let dmg = dmg0 * (1 + r);
        return dmg;
    }
    //基准伤害计算
    getBaseDamage(unit2) {
        let unit1 = this._unit;
        let c = 1;
        let A = unit1.getAttr(AttrType.Attack);
        let B = unit2.getAttr(AttrType.Defence);
        let HP = unit2.getAttr(AttrType.CurHP);
        let dmg = c * A * A / (A + B);
        //克制
        let inhibitRate = this.getInhibitRate(unit2);
        dmg = dmg * (1 + inhibitRate);
        return dmg;
    }
    //克制系数计算
    getInhibitRate(unit2) {
        let inhibitRate = 0;
        //根据敌我的type得出克制系数
        return inhibitRate;
    }
    //基础医疗值
    //暂定=maxHP
    getBaseCureHP(unit1, unit2) {
        let v = unit1.getAttr(AttrType.MaxHP);
        return v;
    }
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    //doing伤害
    doingDamageInAttack(unit2, dmg) {
        this.pkg.addNewActionInAttack(this._unit);
        let dmg1 = 0;
        if (unit2.isCanBeHurt() == false) {
            dmg1 = 0;
        }
        else {
            dmg1 = (unit2._info.curHP < dmg) ? unit2._info.curHP : dmg;
            unit2._info.curHP -= dmg1;
        }
        this.pkg.curAction.actAttackInfo.troopIdx = this._unit._troop.idx;
        this.pkg.curAction.actAttackInfo.unitIdx = this._unit.idx;
        this.pkg.curAction.actAttackInfo.damage = dmg;
        unit2.triggleBufs(BufTriggleType.BeDamage);
    }
}
