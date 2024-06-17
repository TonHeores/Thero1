


//属性类型
export enum AttrType{

    //基础属性
    Attack=1,
    Defense =2,
    HP=3, //满血量11
    Speed=4,

    //战斗属性（12个）
    TrumpRate=5,    //暴击率
    DodgeRate=6,   //闪避率
    ComboRate=7,   //连击率
    CounterRate=8, //反击率
    BloodRate=9,    //吸血率
    StunRate =10,   //击晕率
    RsTrumpRate=11,
    RsDodgeRate=12,
    RsComboRate=13,
    RsCounterRate=14,
    RsBloodRate=15,
    RsStunRate=16,

    //特殊属性（10个）
    DmgExtRate=17, //伤害增强
    RsDmgExtRate=18, //伤害减弱
    TrumpDmgRate=19,    //暴伤率
    RsTrumpDmgRate=20,  //抗爆伤率
    CureRate   =21,     //自愈率
    RsCureRate   =22,    //抗自愈率
    BlockRate=23,   //格挡率
    RsBlockRate=24,   //抗格挡率
    PierceRate=25,  //破甲率
    RsPierceRate=26,  //抗破甲率
    

    Threat=31,
    LuckRate=32,        //幸运率（1点提升技能触发概率0.1%)
    AttackS=33,
    DefenseS=34,
    BlockRateS=35,   //技能格挡率
    RsBlockRateS=36,   //抗技能格挡率
    PierceRateS=37,   //技能技能破甲率
    RsPierceRateS=38,  //抗技能技能破甲率
   
    //伤害
    CurHP=41, //当前血量
    CurHPPer=42, //当前血量比
    LastDamageOut=43, //最近伤害输出
    LastDamageIn=44, //最近伤害承受

}


//Buf状态
export enum StatusType{
    NoAction=1,
    NoAttack=2,
    NoSkill=3,
    OnCrazy=4,//疯狂状态(攻击队友)
    NoCure=5,//无法治疗

    DblAttack =6, //连击状态

    NotBeControl=7,
    NotBeAttack=8,
    NotBeSkill=9,
    NotBeHurt=10
}


//Buf印记
export enum BufStampType{
    
}



//Action 行动类型
export enum ActionType{
    None=0,
    Attack=1,       //发动普攻
    Skill=2,        //使用技能
    Buff=3,         //技能Buf生效
    Combo=4,        //连击
    Counter=5,      //反击
    Cure=7,         //治疗
}



export enum SpecActType{ //特殊行为类型
    Normal=0,   //普通
    Trump=1,    //暴击
    Dodge=2,    //闪避
    Stun=3,     //击晕
    NoHurt=4,   //无敌
    Blood=6,    //吸血
    Cure =7,    //治疗
}



//TriggleType最大值
const c_MaxNum_BufTriggleType = 20

export enum BufTriggleType{
    DoingNow=0, //马上生效!!
    //None = 0,     
    OnBattleBegin=1,//战斗开始
    OnRoundBegin=2, //每回合开始前
    OnRoundEnd=3,//回合结束后
    OnActionBegin=4,//行动开始
    OnActionEnd=5,//行动结束
    OnAttackBegin=6,
    OnAttackEnd=7,
    OnSkillBegin=8,
    OnSkillEnd=9,
    OnTrump=10,//暴击时
    OnEnemyTrump=11,
    OnDodge=12,//闪避时
    OnEnemyDodge=13,
    OnCure=14,
    BeDamage=15,//收到伤害时
    OnBufExe=16,
    BeAttackBegin=17,//受普通攻击开始
    BeAttackEnd=18,//受普通攻击结束
    BeSkillBegin=19,//受技能攻击开始
    BeSkillEnd=20,//受技能攻击结束


    EnumLength=21
    //!!!
}




//技能释放阶段
export enum SkillType{
    ActiveSkill=1, //主动技能（每回合轮到自己出手时，普攻前）
    PassiveSkill=2, //被动技能（在战斗中根据触发条件起作用
    AttrSkill=3 //属性技能（英雄身上发动，进战斗前就已经执行完）
}




export enum RoundSegment{
    RoundBegin = 1,
    RoundWork = 2,
    RoundEnd =3
}


export enum ActOccasionType{
    Normal = 0,
    Attr = 1
}



//叠加类型
export enum OverlayLimit{
    Normal=0,
    Skill=1,    //同技能
    Type =2,    //同类型 
}