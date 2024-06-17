export class BufCfg {
    constructor() {
        this.actPoint = 0; //行动点（时机）。战斗中，只有activeType=battle才能用，否则不用
        this.triggleType = 0; //触发类型
        this.handleRate = 0; //挂接概率
        this.triggleRate = 0; //触发概率
        //Buf数据
        this.fitlerInfos = []; //状态条件模块
        this.effectInfo = [];
        this.targetType = 0; //目标类型
        this.targetCount = 1; //目标数量
        this.targetRangeType = 0; //范围类型
        this.targetPosMatrix = []; //位置矩阵，按指定位置来打 
        this.targetReduceRate = 0; //AOE衰减率
        //{"effectType":"1","val":"1000","isPer":"true",}
        this.effectType = 0; //效果类型
        this.effectPars = [];
        //Damage/cure：0:val
        //AttrExt:  0:attrType|1:val|2:isPer
        //AttrSet:  0:attrType|1:val(boolean格式)
        //ClearBuf: 0:statusForm 状态类别
        //LaunchTo: pars是bufIds[]数组
        this.effectAttr = 0; //效果影响的属性type
        this.effectVal = 0; //影响值
        this.effectIsPer = 0; //效果类型 BufEffectType
        this.waitRound = 0; //等待回合数
        this.liveRound = 9999; //持续回合数
        this.useCount = 9999; //可用数量
        this.overlayType = 0; //叠加类型
        this.overlayLayerMax = 9999; //叠加层数限制
    }
}
//Buf效果模块(个性化：效果参数[[]])
export class BufEffectInfo {
    constructor() {
        this.type = 0; //效果类型 BufEffectType
        this.val = 0;
        this.isNum = 0; //固定值：1,比例：0
        this.attr = 0; //影响的attrType
        this.pars = []; //参数
    }
}
//说明：
//BufEffectType=Damage     val|是否百分比|放大器属性ID|放大器值
//BufEffectType=Cure       val|是否百分比|放大器属性ID|放大器值
//BufEffectType=Blood      val|是否百分比|放大器属性ID|放大器值
//BufEffectType=AttrExt    val|是否百分比|放大器属性ID|放大器值|id
//BufEffectType=LaunchTo   BufID[]；
//BufEffectType=Cure,p1=val,p2=isPercent;
//BufEffectType=Blood,p1=val,p2=isPercent;
//状态类别
export var BufStatusForm;
(function (BufStatusForm) {
    BufStatusForm[BufStatusForm["GoodStatus"] = 1] = "GoodStatus";
    BufStatusForm[BufStatusForm["BadStatus"] = 2] = "BadStatus";
    BufStatusForm[BufStatusForm["Stamp"] = 3] = "Stamp"; //印记
})(BufStatusForm || (BufStatusForm = {}));
//触发条件模块(个性化：触发概率)
export class BufTriggleInfo {
    constructor() {
        this.type = 0; //触发类型
        this.rate = 0; //触发概率
    }
}
//状态条件模块(个性化:dstItem.par,当type=ConstNum时)
export class BufFilterInfo {
    constructor() {
        this.items = []; //状态项(把这些item用操作符opt连接起来，第一个item的opt为null)
        this.cmp = 0; //比较符号
        this.val = 0; //值
    }
}
export class BufFilterItem {
    constructor() {
        this.owner = 0; //属性所有者
        this.type = 0; //AttrType
        this.opt = 0; //连接指令
    }
}
//注明：
// 血量低于10%  [MyAttr|CurHP|Head , MyAttr|MaxHP|Div, Num|0.2|CmpLt]
// 我方速度大于对手速度时  [MyAttr|Speed|Head , EnemyAttr|Speed|CmpGt]
