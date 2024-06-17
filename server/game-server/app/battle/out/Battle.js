import { BUtils } from "./BUtils";
import { BattlePackage } from "./BattlePackage";
import { BattleTroop } from "./BattleTroop";
import { AttrType, BufTriggleType } from "./define/BDataComm";
//外围的战斗类
export class Battle {
    //////////////////////////////////////////////////////////////////////
    //战斗类初始化部分
    //////////////////////////////////////////////////////////////////////
    constructor() {
        this.troops = [];
        this.units = [];
        this._winner = 2; //平局
        this.pkg = new BattlePackage(this);
    }
    init(td1, td2) {
        let t1 = new BattleTroop(this, 0, td1);
        let t2 = new BattleTroop(this, 1, td2);
        this.troops.push(t1);
        this.troops.push(t2);
        //生成allUnits
        for (let k = 0; k < 2; k++) {
            let troop = this.troops[k];
            for (let j = 0; j < troop.units.length; j++) {
                this.units.push(troop.units[j]);
            }
        }
    }
    //////////////////////////////////////////////////////////////////////
    //战斗主循环
    //////////////////////////////////////////////////////////////////////
    running() {
        //战斗开始
        this.battleBegin();
        BUtils.trace("battleBegin--");
        //回合循环
        for (let n = 1; n <= 1; n++) {
            BUtils.trace("roundwork,no=", n);
            this.roundBegin();
            for (let i = 0; i < this.units.length; i++) {
                BUtils.trace("units[i].runningAction,i=", i);
                this.units[i].runningAction();
                //debug
                break;
            }
            this.roundEnd();
            if (this.isClose())
                break; //battleEnd判断
        }
        console.log("EEEE");
        //战斗结束
        this.battleEnd();
    }
    ///////////////////////////////////////////
    ///////////////////////////////////////////
    //战斗开始 battleBegin
    battleBegin() {
        //挂载所有技能
        for (let i = 0; i < this.units.length; i++) {
            this.units[i].handleSkills();
        }
        //触发技能Buf
        for (let i = 0; i < this.units.length; i++) {
            this.units[i].triggleBufs(BufTriggleType.OnBattleBegin);
        }
    }
    //战斗结束 battleEnd
    battleEnd() {
    }
    //每回合开始roundBegin
    roundBegin() {
        this.pkg.addNewRound(); //新回合包
        this.sortUnitsBySpeed(); //按速度出手排序后执行
        this.sortUnitsByThreat();
        //回合开始的Buf处理
        for (let i = 0; i < this.units.length; i++) {
            this.units[i].onRoundBegin();
        }
    }
    //每回合结束roundEnd
    roundEnd() {
        //每个unit要处理
        for (let i = 0; i < this.units.length; i++) {
            this.units[i].onRoundEnd();
        }
        //清除死人（要放后面，万一上一步units[i].onRoundEnd()复活了呢？）
        for (let i = 0; i < this.units.length; i++) {
            if (this.units[i].isDead()) {
                this.units.splice(i--, 1); //一定要把i--,才不会跳过   
            }
        }
    }
    ///////////////////////////////////////////
    ///////////////////////////////////////////
    //units速度排序
    sortUnitsBySpeed() {
        this.units.sort(function (u1, u2) {
            if (u1 != null && u2 != null)
                return (u1.getAttr(AttrType.Speed) - u2.getAttr(AttrType.Speed));
            return 0;
        });
    }
    //unit威胁排序
    sortUnitsByThreat() {
        this.units.sort(function (u1, u2) {
            if (u1 != null && u2 != null)
                return (u1.getAttr(AttrType.Thread) - u2.getAttr(AttrType.Thread));
            return 0;
        });
    }
    //检查Battle是否结束
    isClose() {
        let troopStatus = [];
        let liveTroopCount = 0;
        for (let k = 0; k < 2; k++) {
            if (this.troops[k].isDead() == true) {
                this._winner = 1 - k;
                return true;
            }
        }
        return false;
    }
}
