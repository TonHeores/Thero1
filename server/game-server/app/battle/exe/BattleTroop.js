//战斗中队伍
const C_TroopMaxUnitCount = 9;
import { BattleUnit } from "./BattleUnit.js";
import { FindTargetObj } from "./FindTargetObj.js";
//抽象出来的部队逻辑
export class BattleTroop {
    constructor(battle, idx, troopInfo) {
        this.units = [];
        this.arrIdxByPos = [];
        this._battle = battle;
        this.idx = idx;
        this._info = troopInfo;
        this.findTargetObj = new FindTargetObj(this);
        //阵型初始化
        for (let i = 0; i < C_TroopMaxUnitCount; i++) {
            this.arrIdxByPos[i] = -1;
        }
        if (this._info.heroPoses == null || this._info.heroPoses.length == 0) {
            this._info.heroPoses = [];
            for (let i = 0; i < this._info.heroInfos.length; i++) {
                this._info.heroPoses[i] = i;
            }
        }
        for (let i = 0; i < this._info.heroInfos.length; i++) {
            let pos = this._info.heroPoses[i];
            let unit = new BattleUnit(this, this._info.heroInfos[i], pos);
            this.units.push(unit);
            //阵型赋值！
            this.arrIdxByPos[pos] = i;
        }
    }
    //死了没有？
    isDead() {
        for (let i = 0; i < this.units.length; i++) {
            if (this.units[i].isDead() == false) {
                return false;
            }
        }
        return true;
    }
    getUnitByPos(pos) {
        if (pos >= 0 && pos < 9) {
            return this.units[this.arrIdxByPos[pos]];
        }
        else {
            return null;
        }
    }
    getUnitByCell(r, c) {
        let pos = r * 3 + c;
        if (pos >= 0 && pos < 9) {
            return this.getUnitByPos(pos);
        }
        else {
            return null;
        }
    }
    getUnitsByRow(r) {
        let units = [];
        if (r >= 0 && r < 3) {
            for (let c = 0; c < 3; c++) {
                let pos = r + c * 3;
                units.push(this.units[this.arrIdxByPos[pos]]);
            }
        }
        return units;
    }
    getUnitsByCol(c) {
        let units = [];
        if (c >= 0 && c < 3) {
            for (let r = 0; r < 3; r++) {
                let pos = r * 3 + c;
                units.push(this.units[this.arrIdxByPos[pos]]);
            }
        }
        return units;
    }
}
