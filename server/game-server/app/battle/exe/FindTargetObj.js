import { BUtils } from "./BUtils.js";
export class FindTargetObj {
    constructor(troop) {
        this.troop = troop;
    }
    ///////////////////////////////////////////////
    //被对手执行寻敌规则
    onFindTarget(isSkill = false) {
        console.log("*********");
        let units = this.onFindTargetsOnNormal();
        console.log("*********");
        if (units.length > 0)
            return units[0];
        return null;
    }
    //标准次序受击排序(actType来指出是普攻还是技能)
    onFindTargetsOnNormal(isSkill = false, count = 1, skipPosList = []) {
        let posList = [];
        for (let i = 0; i < this.troop.units.length; i++) {
            posList.push(i);
        }
        return this.getUnitsByPosList(isSkill, count, skipPosList, posList);
    }
    //后排优先受击排序(Buff执行)
    onFindTargetsOnContrary(isSkill = false, count = 1, skipPosList = []) {
        let posList = [];
        for (let i = 0; i < this.troop.units.length; i++) {
            posList.push(this.troop.units.length - i - 1);
        }
        return this.getUnitsByPosList(isSkill, count, skipPosList, posList, true);
    }
    //随机次序受击排序(Buff执行)
    onFindTargetsOnRandom(isSkill = false, count = 1, skipPosList = []) {
        let posList = BUtils.genRndOrderList(this.troop.units.length);
        return this.getUnitsByPosList(isSkill, count, skipPosList, posList);
    }
    //指定次序排序(Buff执行)
    onFindTargetsOnSetPos(isSkill = false, count = 1, posList, skipPosList = []) {
        return this.getUnitsByPosList(isSkill, count, skipPosList, posList);
    }
    //根据位置来找到目标units
    getUnitsByPosList(isSkill, count, skipPosList, posList, isBackFirst = false) {
        let units = [];
        let findCount = 0;
        let beginRow = 0;
        let sign = 1;
        if (isBackFirst) {
            beginRow = 2;
            sign = -1;
        }
        for (let i = 0; i < posList.length; i++) {
            let pos = (isBackFirst == false) ? posList[i] : posList[posList.length - i - 1];
            if (skipPosList.length > 0) {
                if (skipPosList.indexOf(pos) >= 0)
                    continue;
            }
            let unit = this.troop.getUnitByPos(pos);
            if (unit == null)
                continue;
            if (unit.isDead())
                continue;
            //受攻击/受技能的判断
            if (isSkill == false) {
                if (unit.isCanBeAttack() == false)
                    continue;
            }
            else {
                if (unit.isCanBeSkill() == false)
                    continue;
            }
            //找到
            units.push(unit);
            findCount++;
            if (findCount >= count) {
                return units;
            }
        }
        return units;
    }
}
