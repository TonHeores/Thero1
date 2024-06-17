import { SkillInfo } from "./HeroInfo";
export class BattleData {
    constructor() {
        this.winner = 0; //1、2是troopIdx+1，0表示平局
        this.rounds = [];
        //public troops:Array<TroopInfo>=[]; //这个不需要了，因为troops信息是客户端传进来的
    }
}
//战斗轮
export class BattleRoundInfo {
    constructor() {
        this.roundNo = 0; //第几轮
        this.actions = [];
    }
}
export class BattleActionInfo {
    constructor() {
        this.troopIdx = 0;
        this.unitIdx = 0;
        this.actionType = 0; //行动类型
        //以下可以为空
        this.actAttackInfo = null;
        this.actSkillUseInfo = null;
        this.actBufExeInfo = null;
    }
}
//普攻Action结构
export class BattleAttackInfo {
    constructor() {
        this.troopIdx = 0;
        this.unitIdx = 0;
        this.damage = 0; //扣血（扣血是正!)
        this.specAtkType = 0; //特殊攻击类型 普通|暴击|闪避|连击
    }
}
//挂接技能Action结构
export class BattleSkillUseInfo {
    constructor() {
        this.skillId = 0; //技能id
        this.bufIds = []; //技能生效后挂接的buf
    }
}
//挂接技能Action结构
export class BattleBufExeInfo extends SkillInfo {
    constructor() {
        super(...arguments);
        this.bufId = 0;
        this.effItems = []; //技能生效后挂接的bufInfo    
    }
}
export class BattleBufEffectItem {
    constructor() {
        this.troopIdx = 0; //目标troop
        this.unitIdx = 0; //目标unit
        this.effType = 0;
        //影响效果
        this.rstId = 0;
        this.rstVal = 0;
    }
}
