import { BUtils } from "../BUtils";
import { HeroInfo } from "./HeroInfo";
//战斗单元Unit
export class UnitInfo extends HeroInfo {
    constructor() {
        super(...arguments);
        //public armyInfo:ArmyData;
        this.curHP = 0;
        this.maxHP = 0;
        this.pos = -1;
    }
    set(heroInfo, pos) {
        BUtils.copyObj(this, heroInfo);
        this.maxHP = this.hp;
        this.curHP = this.hp;
        this.pos = (pos) ? pos : 0;
    }
}
