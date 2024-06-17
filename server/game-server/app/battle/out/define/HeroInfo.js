export class HeroInfo {
    constructor() {
        this.uid = 0;
        this.id = 0;
        this.lv = 0;
        this.star = 0;
        //一级属性
        this.attack = 0;
        this.defense = 0;
        this.attackS = 0;
        this.defenseS = 0;
        this.speed = 0;
        this.threat = 0;
        this.hp = 0;
        //二级属性
        this.trumpRate = 0;
        this.rsTrumpRate = 0;
        this.trumpDmgRate = 0;
        this.dodgeRate = 0;
        this.rsDodgeRate = 0;
        this.luckRate = 0;
        this.extDmgAll = 0;
        this.extDmgNormal = 0;
        this.extDmgSkill = 0;
        this.extRsDmgAll = 0;
        this.extRsDmgNormal = 0;
        this.extRsDmgSkill = 0;
        //技能
        this.activeSkill = new SkillInfo();
        this.passiveSkills = []; //被动技能，直接在英雄身上永久生效。
        this.triggleSkills = []; //触发技能，进战斗后根据条件触发生效。
    }
}
export class SkillInfo {
    constructor() {
        this.id = 0; //技能id
        this.lv = 0; //技能等级
    }
}
