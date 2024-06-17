import { BUtils } from "./BUtils";
import { AoeTargetRange, BufEffectType, BufFilterCmpCmd, BufFilterOptCmd, BufFilterOwnerType, BufTargetType, BufTriggleType } from "./define/BDataComm";
import { BufCfg } from "./define/BufCfg";
import { BDataCfg } from "./BDataCfg";
export class BufObj {
    constructor(battleObj, unit) {
        this.info = new BufCfg();
        this.cfg = null;
        this._battleObj = battleObj;
        this._unit = unit;
    }
    init(bufId) {
        this.cfg = BDataCfg.ins.getBufCfg(bufId);
        if (this.cfg == null)
            return;
        BUtils.copyObj(this.info, this.cfg);
    }
    //////////////////////////////////////////
    //  +++ 入口函数！！+++
    //////////////////////////////////////////
    running() {
        //挂状态 OnBufExeBegin
        this._unit.triggleBufs(BufTriggleType.OnBufExeBegin);
        //Buf是否可用
        if (this.isActived() == false)
            return;
        //检查触发概率
        if (this.hitTriggleRate() == false)
            return;
        //检查状态条件
        for (let i = 0; i < this.info.fitlerInfos.length; i++) {
            if (this.checkBufFilter(this.info.fitlerInfos[i]) == false)
                return;
        }
        //寻找目标//执行效果
        let targetUnits = this.findTargetList();
        for (let j = 0; j < targetUnits.length; j++) {
            let targetUnit = targetUnits[j];
            if (targetUnit == null)
                continue;
            targetUnit.triggleBufs(BufTriggleType.BeBufExeBegin);
            let reduceRate = 1 - this.info.targetReduceRate / 100 * j;
            this.doingEffect(targetUnit, reduceRate);
            targetUnit.triggleBufs(BufTriggleType.BeBufExeEnd);
        }
        //次数！
        this.info.useCount--;
        //挂状态 OnBufExeEnd
        this._unit.triggleBufs(BufTriggleType.OnBufExeEnd);
    }
    //////////////////////////////////////////
    // 检查一个状态条件
    checkBufFilter(filterInfo) {
        //根据命令字把多个item合起来
        let srcVal = 0;
        if (filterInfo == null)
            return false;
        for (let i = 0; i < filterInfo.items.length; i++) {
            let item = filterInfo.items[i];
            let v = this.getFilterItemVal(item);
            switch (item.opt) {
                case BufFilterOptCmd.None:
                case BufFilterOptCmd.Add: {
                    srcVal += v;
                    break;
                }
                case BufFilterOptCmd.Sub: {
                    srcVal -= v;
                    break;
                }
                case BufFilterOptCmd.Mul: {
                    srcVal *= v;
                    break;
                }
                case BufFilterOptCmd.Div: {
                    srcVal /= v;
                    break;
                }
            }
        }
        //后项的值
        let dstVal = filterInfo.val;
        //前后项比较
        let ret = true;
        switch (filterInfo.cmp) {
            case BufFilterCmpCmd.CmpEQ: {
                ret = (srcVal == dstVal);
                break;
            }
            case BufFilterCmpCmd.CmpLT: {
                ret = (srcVal < dstVal);
                break;
            }
            case BufFilterCmpCmd.CmpGT: {
                ret = (srcVal > dstVal);
                break;
            }
            case BufFilterCmpCmd.CmpLE: {
                ret = (srcVal <= dstVal);
                break;
            }
            case BufFilterCmpCmd.CmpGE: {
                ret = (srcVal >= dstVal);
                break;
            }
        }
        return ret;
    }
    ///////////////////////////////////////////////////////////////////////////
    //根据状态条件项的类型来取值
    getFilterItemVal(item) {
        switch (item.owner) {
            case BufFilterOwnerType.Mine: {
                return this._unit.getAttr(item.type);
            }
            case BufFilterOwnerType.Enemy: {
                if (this._unit.targetUnit != null)
                    return this._unit.targetUnit.getAttr(item.type);
            }
        }
        return 0;
    }
    ///////////////////////////////////////////////////////////////////////////
    //  寻找对手（多个）
    findTargetList() {
        if (this.info.targetType == BufTargetType.Mine) {
            return [this._unit];
        }
        //得到troop和excludePosList
        let targetTroop = this._unit._troop;
        let skipPosList = [];
        if (this._unit.targetUnit != null) {
            if (this.info.targetType == BufTargetType.Enemy) {
                if (this._unit.targetUnit != null)
                    return [this._unit.targetUnit];
            }
            switch (this.info.targetType) {
                case BufTargetType.EnemyTroop: {
                    targetTroop = this._unit.getEnemyTroop();
                }
                case BufTargetType.EnemyFriend: {
                    targetTroop = this._unit.getEnemyTroop();
                    skipPosList.push(this._unit.targetUnit.pos);
                }
            }
        }
        //根据AOE范围类型选对手
        switch (this.info.targetRangeType) {
            case AoeTargetRange.Normal: {
                return targetTroop.findTargetObj.onFindTargetsOnNormal(true, this.info.targetCount, skipPosList);
            }
            case AoeTargetRange.Contrary: {
                return targetTroop.findTargetObj.onFindTargetsOnContrary(true, this.info.targetCount, skipPosList);
            }
            case AoeTargetRange.Random: {
                return targetTroop.findTargetObj.onFindTargetsOnRandom(true, this.info.targetCount, skipPosList);
            }
        }
        //保底
        return []; //#（不要用null，否则外面就要去判断）
    }
    ///////////////////////////////////////////////////////////////////////////
    //  执行技能效果
    // //Buf效果模块(个性化：效果参数[[]])
    // export class BufEffectInfo{
    //     type:number; //效果类型BufEffectType
    //     id:number;
    //     public pars:Array<number>=[];//参数
    // }
    //BufEffectType=Damage     val|是否百分比
    //BufEffectType=Cure       val|是否百分比
    //BufEffectType=AttrExt    val|是否百分比|放大器属性ID|放大器值|id
    //BufEffectType=LaunchTo   BufID[]；
    //BufEffectType=Cure,p1=val,p2=isPercent;
    getEffectParVal(val, ampAttr, ampEach) {
        if (ampAttr != null && ampEach != null) {
            return val * (1 + this._unit.getAttrBase(ampAttr) * (ampEach / 10000));
        }
        else {
            return val;
        }
    }
    doingEffect(targetUnit, reduceRate) {
        switch (this.info.effectType) {
            case BufEffectType.Damage: {
                let dmg0 = this._unit.fightObj.getSkillDamage(targetUnit);
                let dmg = dmg0 * this.info.effectPars[0] / 10000;
                this._unit.fightObj.doingDamage(targetUnit, dmg);
                break;
            }
            case BufEffectType.Cure: {
                let hp0 = this._unit.fightObj.getBaseCureHP(this._unit, targetUnit);
                let hp = hp0 * this.info.effectPars[0] / 10000;
                targetUnit.onCure(hp);
                break;
            }
            case BufEffectType.AttrExt: {
                let type = this.info.effectPars[0];
                let val0 = this.info.effectPars[1];
                let isPer = (this.info.effectPars[2] > 0) ? true : false;
                let val = targetUnit.addAttrExt(type, val0, isPer);
                break;
            }
            //清除Buf
            case BufEffectType.ClearBuf: {
                targetUnit.onClearStatus(this.info.effectPars[0]);
                break;
            }
            //跳转调用buf
            case BufEffectType.LaunchTo: {
                for (let i = 0; i < this.info.effectPars.length; i++) {
                    let bufId = this.info.effectPars[i];
                    this._unit.bufMgr.addBuf(bufId);
                }
                break;
            }
        }
    }
    //Buf是否处于可用状态
    isActived() {
        if (this.info.waitRound > 0)
            return false; //还在等呢
        if (this.info.liveRound <= 0)
            return false; //可用回合数用完了
        if (this.info.useCount <= 0)
            return false; //可用次数用完了
        return true;
    }
    //计算概率（要算上进准值
    hitTriggleRate() {
        if (BUtils.hitRate(this.info.triggleRate))
            return true;
        return false;
    }
    //回合开始！
    OnRoundBegin() {
        if (this.info.waitRound > 0)
            this.info.waitRound--;
        if (this.info.liveRound > 0)
            this.info.liveRound--;
    }
    //激活
    triggle(activeBufType) {
        return true;
    }
    //释放的时候
    onExit() {
    }
    //释放接口
    dispose() {
        this.onExit();
    }
}
