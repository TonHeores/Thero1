import { BUtils } from "./BUtils.js";
import { BufObj } from "./BufObj.js";
//普攻
export class BufMgr {
    constructor(battle, unit) {
        this.bufList = [];
        this.bufMapByTriggle = new Map();
        this._battle = battle;
        this._unit = unit;
    }
    // public init(battle:Battle,unit:BattleUnit){
    //     this._battle = battle;
    //     this._unit = unit;
    // }
    //增加BUF，成功返回true
    addBuf(bufId) {
        //生成与挂接BufObj
        let ret = 0;
        let obj = new BufObj(this._battle, this._unit);
        obj.init(bufId);
        //检查挂接概率
        if (BUtils.hitRate(obj.info.handleRate)) {
            this.bufList.push(obj);
            this.bufMapByTriggle[obj.info.triggleType].push(obj);
            return true;
        }
        return false;
    }
    //触发Buf（根据BufTriggleType选择触发时机)
    triggleBufs(type) {
        let bufs = this.bufMapByTriggle[type];
        // BUtils.trace("triggleBufs:",type);
        if (bufs == null)
            return;
        //  BUtils.trace("CCCCCCCCCC:",type);
        for (let i = 0; i < bufs.length; i++) {
            let bufObj = bufs[i];
            bufObj.running();
        }
    }
    //回合开始处理（处理回合数）
    OnRoundBegin() {
        for (let i = 0; i < this.bufList.length; i++) {
            let bufObj = this.bufList[i];
            if (bufObj == null)
                continue;
            bufObj.OnRoundBegin();
        }
    }
    //回合结束的处理(定期清理Buff)
    OnRoundEnd() {
        for (let i = 0; i < this.bufList.length; i++) {
            let bufObj = this.bufList[i];
            if (bufObj == null || bufObj.isActived() == false) {
                this.bufList.splice(i--, 1); //buff失效了，删除！
            }
        }
    }
}
