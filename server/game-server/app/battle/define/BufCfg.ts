export class BufCfg{
    public bufId:number=0;
    public isAttr:number = 0; //行动点（时机）。战斗中，只有activeType=battle才能用，否则不用
    public handleRate:number=100; //挂接概率
    public triggleType:number=0; //触发类型
    public triggleRate:number=100; //触发概率
    

  //  public targetInfo:BufTargetInfo = new BufTargetInfo();

    
    public targetType:number=0; //目标类型
    public targetCounts:number[] = [1]; //目标数量
    public targetRange:number=0; //范围类型
    public targetReduce:number = 0;//AOE衰减率
    public targetMatrix:number[]= []; //位置矩阵，按指定位置来打 
    



    //Buf数据
    public filterInfos:BufFilterInfo[] = []; //状态条件模块
    public effectInfos:BufEffectInfo[]=[];

    //{"effectType":"1","val":"1000","isPer":"true",}

    // public effectType:number=0; //效果类型
    // public effectPars:number[]=[]; 
    // //Damage/cure：0:val
    // //AttrExt:  0:attrType|1:val|2:isPer
    // //AttrSet:  0:attrType|1:val(boolean格式)
    // //ClearBuf: 0:statusForm 状态类别
    // //LaunchTo: pars是bufIds[]数组
    
    // public effectAttr:number=0; //效果影响的属性type
    // public effectVal:number=0; //影响值
    // public effectIsPer:number=0; //效果类型 BufEffectType

    public waitRound:number=0; //等待回合数
    public liveRound:number=9999; //持续回合数
    public useCount:number=9999; //可用数量
 
    public overLimit:number=0;//禁止叠加=0表示无限制，=1表示同类禁止。

}






//触发条件模块(个性化：触发概率)
export class BufTriggleInfo{
    public type:number=0; //触发类型
    public rate:number=0; //触发概率
 }



//状态条件模块(个性化:dstItem.par,当type=ConstNum时)
export class BufFilterInfo{
    public items:BufFilterItem[]=[]; //状态项(把这些item用操作符opt连接起来，第一个item的opt为null)
    public cmp:number=0;  //比较符号
    public val:number=0;  //值
}

export class BufFilterItem{
    public owner:number=0; //属性所有者
    public attr:number=0;//AttrType
    public opt:number=0; //连接指令
}

//注明：
// 血量低于10%  [MyAttr|CurHP|Head , MyAttr|MaxHP|Div, Num|0.2|CmpLt]
// 我方速度大于对手速度时  [MyAttr|Speed|Head , EnemyAttr|Speed|CmpGt]






//Buf效果模块(个性化：效果参数[[]])
export class BufEffectInfo{
    public type:number=0; //效果类型 BufEffectType
    public rate:number=100;
    public id:number = 0;  //属性attr，或者状态form
    public val:number=0;
    public per:boolean=false;

    public wait:number = 0;
    public live:number = 9999;
    public count:number=9999; //可用数量
    public inc:number=9999; //可用数量
    public overLimit:number=0; //叠加限制（类型)
}


//说明：
//BufEffectType=Damage     0=val| (默认为百分比)
//BufEffectType=Cure       0=val| (默认为百分比)
//BufEffectType=AttrExt    0=AttrType|1=val|2=isPer是否百分比|
//BufEffectType=AttrSet    0=AttrType|1=isTrue
//BufEffectType=ClearBuf   0=BufStatusForm
//BufEffectType=LaunchTo   pars=跳转bufIds 

export enum BufEffectType{
    Damage = 1, //伤害率
    Cure = 2, //治疗
    CleanBuf =3, //清除buff
    AddAttr = 4, //属性增益
    AddStatus = 5, // 属性状态赋值
    LaunchTo = 6,  //跳转调用Buf
    ExeAttr = 7, //实际执行buff属性
    ExeStatus = 8, //实际执行buff属性
}



// export class BufTargetInfo{
//     public type:number=0; //目标类型
//     public range:number=0; //范围类型
//     public counts:number[] = []; //目标数量
//     public reduce:number = 0;//AOE衰减率
//     public matrix:number[]= []; //位置矩阵，按指定位置来打 
// }












export enum TargetRangeType{
    Normal=0,       //标准顺序
    Contrary = 1,   //反序
    Random= 2,      //随机选
    PosMatrix=3     //指定位置
}





//状态类别
export enum BufStatusFormType{
    GoodStatus=1, //好状态
    BadStatus=2,  //差状态
    Stamp=3 //印记
}




//////////////////////////////////////////////
//状态条件部分

export enum BufFilterItemType{
    Const=0,  //常数数值
    MyAttr=1, //me属性
    MyStatus=2, //me状态
    MyStamp=3, //me印记
    EnemyAttr=4, //enemy属性
    EnemyStatus=5, //enemy状态
    EnemyStamp=6, //enemy印记
}

//状态条件运算指令
export enum BufFilterOptCmd{
    None=0, //链头
    Add=1, //+
    Sub=2, //-
    Mul=3, //*
    Div=4, //除
}


//状态条件比较指令
export enum BufFilterCmpCmd{
    CmpEQ=1, //等于
    CmpLT=2, //小于
    CmpLE=3, //小等于
    CmpGT=4, //大于
    CmpGE=5 //大等于
}


//状态条件目标类型
export enum BufFilterOwnerType{
    Mine=1,     //自己    
    Enemy=2,    //对手

    MyTroopAvg=3,       //我方全队平均
    MyTroopSum=4,       //我方全队累加
    MyTroopMin=5,       //我方全队最小
    MyTroopMax=6,       //我方全队最大

    EnemyTroopAvg=7,       //对手全队平均
    EnemyTroopSum=8,       //对手全队累加
    EnemyTroopMin=9,       //对手全队最小
    EnemyTroopMax=10,       //对手全队最大
}


//AOE目标类型
export enum BufTargetType{
    Mine=1,     //自己    
    MyTroop=2,          //我方全队平均
    MyFriend=3,         //我方友军平均（不含自己）
    Enemy=4,    //当前目标
    EnemyTroop=5,       //目标全队
    EnemyFriend=6       //目标友军
}



//Buf生效时机
export enum BufEffTimePoint{
    Infinity = 1, //永久生效(在英雄身上直接起效)
    Battle =2 //战场生效（只有进入战斗才生效）
}
