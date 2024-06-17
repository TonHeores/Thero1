import { ActionType } from "./define/BDataComm";
import { BattleActionInfo, BattleAttackInfo, BattleBufExeInfo, BattleData, BattleRoundInfo, BattleSkillUseInfo } from "./define/BattleData";
//抽象出来的部队逻辑
export class BattlePackage {
    //数据
    constructor(battle) {
        this.data = new BattleData();
        this.curRound = new BattleRoundInfo(); //没赋值会报错，先空跑一个
        this.curAction = new BattleActionInfo(); //没赋值会报错，先空跑一个
        this.roundNo = 0;
        this._battle = battle;
    }
    begin() {
    }
    end() {
    }
    //增加一个新round
    addNewRound() {
        this.roundNo++;
        this.curRound = new BattleRoundInfo();
        this.curRound.roundNo = this.roundNo;
        this.data.rounds.push(this.curRound);
    }
    //增加一个新action
    addNewActionInAttack(unit) {
        let actionType = ActionType.Attack;
        this.addNewAction(unit, actionType);
        this.curAction.actAttackInfo = new BattleAttackInfo();
    }
    addNewActionInSkillUse(unit) {
        let actionType = ActionType.Skill;
        this.addNewAction(unit, actionType);
        this.curAction.actSkillUseInfo = new BattleSkillUseInfo();
    }
    addNewActionInBuffExe(unit) {
        let actionType = ActionType.BufExe;
        this.addNewAction(unit, actionType);
        this.curAction.actBufExeInfo = new BattleBufExeInfo();
    }
    addNewAction(unit, actionType) {
        this.curAction = new BattleActionInfo();
        this.curRound.actions.push(this.curAction);
        this.curAction.troopIdx = unit._troop.idx;
        this.curAction.unitIdx = unit.idx;
        this.curAction.actionType = actionType;
    }
}
