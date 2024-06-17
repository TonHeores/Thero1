import { BDataCfg } from "./BDataCfg";
import { BUtils } from "./BUtils";
import { AttrType, BufTriggleType } from "./define/BDataComm";
export class SkillObj {
    constructor(unit, info) {
        this._unit = unit;
        this._battle = unit._battle;
        this.pkg = unit._battle.pkg;
        this.info = info;
        this.cfg = BDataCfg.ins.getSkillCfg(info.id, info.lv);
        this.skillUid = SkillObj.getSkillUid(info.id, info.lv);
    }
    canUseSkill() {
        if (this._unit.isDead())
            return false; //死了
        if (this._unit.isCanSkill() == false)
            return false; //被控了！ 
        //判断是否触发（要加上幸运值）
        let skillRate = this.cfg.actRate + this._unit.getAttrInPer(AttrType.LuckRate);
        if (BUtils.hitRate(skillRate) == false)
            return false; //技能没触发
        return true;
    }
    doingSkill() {
        //挂载SKill  Buf
        for (let j = 0; j < this.cfg.BufIds.length; j++) {
            let bufId = this.cfg.BufIds[j];
            let ret = this._unit.bufMgr.addBuf(bufId);
        }
        //！！！马上执行RightNow触发型
        this._unit.triggleBufs(BufTriggleType.DoingNow);
        //加入新包
        this.pkg.addNewActionInSkillUse(this._unit);
        this.pkg.curAction.actSkillUseInfo.skillId = this.info.id;
    }
    static getSkillUid(skillId, lv) {
        return skillId * 100 + lv;
    }
}
