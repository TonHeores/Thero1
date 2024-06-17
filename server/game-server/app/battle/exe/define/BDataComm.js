//属性类型
export var AttrType;
(function (AttrType) {
    // 1攻击，2防御，3策略，4速度
    AttrType[AttrType["Attack"] = 1] = "Attack";
    AttrType[AttrType["Defence"] = 2] = "Defence";
    AttrType[AttrType["SkillAttack"] = 3] = "SkillAttack";
    AttrType[AttrType["SkillDefence"] = 4] = "SkillDefence";
    AttrType[AttrType["Speed"] = 5] = "Speed";
    AttrType[AttrType["Thread"] = 6] = "Thread";
    AttrType[AttrType["CurHP"] = 7] = "CurHP";
    AttrType[AttrType["MaxHP"] = 8] = "MaxHP";
    AttrType[AttrType["TrumpRate"] = 9] = "TrumpRate";
    AttrType[AttrType["RsTrumpRate"] = 10] = "RsTrumpRate";
    AttrType[AttrType["TrumpDmgRate"] = 11] = "TrumpDmgRate";
    AttrType[AttrType["DodgeRate"] = 12] = "DodgeRate";
    AttrType[AttrType["RsDodgeRate"] = 13] = "RsDodgeRate";
    AttrType[AttrType["LuckRate"] = 14] = "LuckRate";
    //伤害
    AttrType[AttrType["ExtDmgAll"] = 16] = "ExtDmgAll";
    AttrType[AttrType["ExtDmgNormal"] = 17] = "ExtDmgNormal";
    AttrType[AttrType["ExtDmgSkill"] = 18] = "ExtDmgSkill";
    AttrType[AttrType["ExtRsDmgAll"] = 19] = "ExtRsDmgAll";
    AttrType[AttrType["ExtRsDmgNormal"] = 20] = "ExtRsDmgNormal";
    AttrType[AttrType["ExtRsDmgSkill"] = 21] = "ExtRsDmgSkill";
    AttrType[AttrType["StatNoAction"] = 31] = "StatNoAction";
    AttrType[AttrType["StatNoAttack"] = 32] = "StatNoAttack";
    AttrType[AttrType["StatNoSkill"] = 33] = "StatNoSkill";
    AttrType[AttrType["StatOnCrazy"] = 34] = "StatOnCrazy";
    AttrType[AttrType["StatNoCure"] = 35] = "StatNoCure";
    AttrType[AttrType["StatNotBeControl"] = 36] = "StatNotBeControl";
    AttrType[AttrType["StatNotBeAttack"] = 37] = "StatNotBeAttack";
    AttrType[AttrType["StatNotBeSkill"] = 38] = "StatNotBeSkill";
    AttrType[AttrType["StatNotBeHurt"] = 39] = "StatNotBeHurt";
    AttrType[AttrType["StatDblAttack"] = 40] = "StatDblAttack"; //连击状态
})(AttrType || (AttrType = {}));
//Buf状态
export var BufStatusType;
(function (BufStatusType) {
    BufStatusType[BufStatusType["NoAction"] = 1] = "NoAction";
    BufStatusType[BufStatusType["NoAttack"] = 2] = "NoAttack";
    BufStatusType[BufStatusType["NoSkill"] = 3] = "NoSkill";
    BufStatusType[BufStatusType["OnCrazy"] = 4] = "OnCrazy";
    BufStatusType[BufStatusType["NoCure"] = 5] = "NoCure";
    BufStatusType[BufStatusType["DblAttack"] = 6] = "DblAttack";
    BufStatusType[BufStatusType["NotBeControl"] = 11] = "NotBeControl";
    BufStatusType[BufStatusType["NotBeAttack"] = 12] = "NotBeAttack";
    BufStatusType[BufStatusType["NotBeSkill"] = 13] = "NotBeSkill";
    BufStatusType[BufStatusType["NotBeHurt"] = 14] = "NotBeHurt";
})(BufStatusType || (BufStatusType = {}));
//Buf印记
export var BufStampType;
(function (BufStampType) {
})(BufStampType || (BufStampType = {}));
//Action 行动类型
export var ActionType;
(function (ActionType) {
    ActionType[ActionType["None"] = 0] = "None";
    ActionType[ActionType["Attack"] = 1] = "Attack";
    ActionType[ActionType["Skill"] = 2] = "Skill";
    ActionType[ActionType["BufExe"] = 3] = "BufExe";
    ActionType[ActionType["BufDel"] = 4] = "BufDel"; //Buf被删除
})(ActionType || (ActionType = {}));
export var SpecAttackType;
(function (SpecAttackType) {
    SpecAttackType[SpecAttackType["Normal"] = 0] = "Normal";
    SpecAttackType[SpecAttackType["Trump"] = 1] = "Trump";
    SpecAttackType[SpecAttackType["Dodge"] = 2] = "Dodge"; //闪避
})(SpecAttackType || (SpecAttackType = {}));
export var BufTriggleType;
(function (BufTriggleType) {
    BufTriggleType[BufTriggleType["DoingNow"] = 0] = "DoingNow";
    //None = 0,     
    BufTriggleType[BufTriggleType["OnBattleBegin"] = 1] = "OnBattleBegin";
    BufTriggleType[BufTriggleType["OnRoundBegin"] = 2] = "OnRoundBegin";
    BufTriggleType[BufTriggleType["OnRoundEnd"] = 3] = "OnRoundEnd";
    BufTriggleType[BufTriggleType["OnActionBegin"] = 4] = "OnActionBegin";
    BufTriggleType[BufTriggleType["OnActionEnd"] = 5] = "OnActionEnd";
    BufTriggleType[BufTriggleType["OnSkillBegin"] = 6] = "OnSkillBegin";
    BufTriggleType[BufTriggleType["OnSkillEnd"] = 7] = "OnSkillEnd";
    BufTriggleType[BufTriggleType["OnTrump"] = 9] = "OnTrump";
    BufTriggleType[BufTriggleType["OnDodge"] = 10] = "OnDodge";
    BufTriggleType[BufTriggleType["OnAttackBegin"] = 9] = "OnAttackBegin";
    BufTriggleType[BufTriggleType["OnAttackEnd"] = 10] = "OnAttackEnd";
    BufTriggleType[BufTriggleType["OnEnemyTrump"] = 11] = "OnEnemyTrump";
    BufTriggleType[BufTriggleType["OnEnemyDodge"] = 12] = "OnEnemyDodge";
    BufTriggleType[BufTriggleType["OnCure"] = 14] = "OnCure";
    BufTriggleType[BufTriggleType["BeAttackBegin"] = 21] = "BeAttackBegin";
    BufTriggleType[BufTriggleType["BeAttackEnd"] = 22] = "BeAttackEnd";
    BufTriggleType[BufTriggleType["BeSkillBegin"] = 23] = "BeSkillBegin";
    BufTriggleType[BufTriggleType["BeSkillEnd"] = 24] = "BeSkillEnd";
    BufTriggleType[BufTriggleType["BeDamage"] = 25] = "BeDamage";
    BufTriggleType[BufTriggleType["OnBufExeBegin"] = 26] = "OnBufExeBegin";
    BufTriggleType[BufTriggleType["OnBufExeEnd"] = 27] = "OnBufExeEnd";
    BufTriggleType[BufTriggleType["BeBufExeBegin"] = 28] = "BeBufExeBegin";
    BufTriggleType[BufTriggleType["BeBufExeEnd"] = 29] = "BeBufExeEnd";
    //!!!
})(BufTriggleType || (BufTriggleType = {}));
export var BufEffectType;
(function (BufEffectType) {
    BufEffectType[BufEffectType["Damage"] = 1] = "Damage";
    BufEffectType[BufEffectType["Cure"] = 2] = "Cure";
    BufEffectType[BufEffectType["AttrExt"] = 3] = "AttrExt";
    BufEffectType[BufEffectType["AttrSet"] = 4] = "AttrSet";
    BufEffectType[BufEffectType["ClearBuf"] = 5] = "ClearBuf";
    BufEffectType[BufEffectType["LaunchTo"] = 6] = "LaunchTo"; //跳转调用Buf
})(BufEffectType || (BufEffectType = {}));
export var AoeTargetRange;
(function (AoeTargetRange) {
    AoeTargetRange[AoeTargetRange["Normal"] = 0] = "Normal";
    AoeTargetRange[AoeTargetRange["Contrary"] = 1] = "Contrary";
    AoeTargetRange[AoeTargetRange["Random"] = 2] = "Random";
    AoeTargetRange[AoeTargetRange["PosMatrix"] = 3] = "PosMatrix"; //指定位置
})(AoeTargetRange || (AoeTargetRange = {}));
//////////////////////////////////////////////
//状态条件部分
export var BufFilterItemType;
(function (BufFilterItemType) {
    BufFilterItemType[BufFilterItemType["Const"] = 0] = "Const";
    BufFilterItemType[BufFilterItemType["MyAttr"] = 1] = "MyAttr";
    BufFilterItemType[BufFilterItemType["MyStatus"] = 2] = "MyStatus";
    BufFilterItemType[BufFilterItemType["MyStamp"] = 3] = "MyStamp";
    BufFilterItemType[BufFilterItemType["EnemyAttr"] = 4] = "EnemyAttr";
    BufFilterItemType[BufFilterItemType["EnemyStatus"] = 5] = "EnemyStatus";
    BufFilterItemType[BufFilterItemType["EnemyStamp"] = 6] = "EnemyStamp";
})(BufFilterItemType || (BufFilterItemType = {}));
//状态条件运算指令
export var BufFilterOptCmd;
(function (BufFilterOptCmd) {
    BufFilterOptCmd[BufFilterOptCmd["None"] = 0] = "None";
    BufFilterOptCmd[BufFilterOptCmd["Add"] = 1] = "Add";
    BufFilterOptCmd[BufFilterOptCmd["Sub"] = 2] = "Sub";
    BufFilterOptCmd[BufFilterOptCmd["Mul"] = 3] = "Mul";
    BufFilterOptCmd[BufFilterOptCmd["Div"] = 4] = "Div";
})(BufFilterOptCmd || (BufFilterOptCmd = {}));
//状态条件比较指令
export var BufFilterCmpCmd;
(function (BufFilterCmpCmd) {
    BufFilterCmpCmd[BufFilterCmpCmd["CmpEQ"] = 1] = "CmpEQ";
    BufFilterCmpCmd[BufFilterCmpCmd["CmpLT"] = 2] = "CmpLT";
    BufFilterCmpCmd[BufFilterCmpCmd["CmpLE"] = 3] = "CmpLE";
    BufFilterCmpCmd[BufFilterCmpCmd["CmpGT"] = 4] = "CmpGT";
    BufFilterCmpCmd[BufFilterCmpCmd["CmpGE"] = 5] = "CmpGE"; //大等于
})(BufFilterCmpCmd || (BufFilterCmpCmd = {}));
//状态条件目标类型
export var BufFilterOwnerType;
(function (BufFilterOwnerType) {
    BufFilterOwnerType[BufFilterOwnerType["Mine"] = 1] = "Mine";
    BufFilterOwnerType[BufFilterOwnerType["Enemy"] = 2] = "Enemy";
    BufFilterOwnerType[BufFilterOwnerType["MyTroopAvg"] = 11] = "MyTroopAvg";
    BufFilterOwnerType[BufFilterOwnerType["MyFriendAvg"] = 12] = "MyFriendAvg";
    BufFilterOwnerType[BufFilterOwnerType["MyTroopSum"] = 13] = "MyTroopSum";
    BufFilterOwnerType[BufFilterOwnerType["MyFriendSum"] = 14] = "MyFriendSum";
    BufFilterOwnerType[BufFilterOwnerType["MyTroopMin"] = 15] = "MyTroopMin";
    BufFilterOwnerType[BufFilterOwnerType["MyFriendMin"] = 16] = "MyFriendMin";
    BufFilterOwnerType[BufFilterOwnerType["MyTroopMax"] = 17] = "MyTroopMax";
    BufFilterOwnerType[BufFilterOwnerType["MyFriendMax"] = 18] = "MyFriendMax";
    BufFilterOwnerType[BufFilterOwnerType["EnemyTroopAvg"] = 21] = "EnemyTroopAvg";
    BufFilterOwnerType[BufFilterOwnerType["EnemyFriendAvg"] = 22] = "EnemyFriendAvg";
    BufFilterOwnerType[BufFilterOwnerType["EnemyTroopSum"] = 23] = "EnemyTroopSum";
    BufFilterOwnerType[BufFilterOwnerType["EnemyFriendSum"] = 24] = "EnemyFriendSum";
    BufFilterOwnerType[BufFilterOwnerType["EnemyTroopMin"] = 25] = "EnemyTroopMin";
    BufFilterOwnerType[BufFilterOwnerType["EnemyFriendMin"] = 26] = "EnemyFriendMin";
    BufFilterOwnerType[BufFilterOwnerType["EnemyTroopMax"] = 27] = "EnemyTroopMax";
    BufFilterOwnerType[BufFilterOwnerType["EnemyFriendMax"] = 28] = "EnemyFriendMax"; //对手友军最大
})(BufFilterOwnerType || (BufFilterOwnerType = {}));
//AOE目标类型
export var BufTargetType;
(function (BufTargetType) {
    BufTargetType[BufTargetType["Mine"] = 1] = "Mine";
    BufTargetType[BufTargetType["Enemy"] = 2] = "Enemy";
    BufTargetType[BufTargetType["MyTroop"] = 3] = "MyTroop";
    BufTargetType[BufTargetType["MyFriend"] = 4] = "MyFriend";
    BufTargetType[BufTargetType["EnemyTroop"] = 5] = "EnemyTroop";
    BufTargetType[BufTargetType["EnemyFriend"] = 6] = "EnemyFriend"; //目标友军
})(BufTargetType || (BufTargetType = {}));
//Buf生效时机
export var BufEffTimePoint;
(function (BufEffTimePoint) {
    BufEffTimePoint[BufEffTimePoint["Infinity"] = 1] = "Infinity";
    BufEffTimePoint[BufEffTimePoint["Battle"] = 2] = "Battle"; //战场生效（只有进入战斗才生效）
})(BufEffTimePoint || (BufEffTimePoint = {}));
//技能释放阶段
export var SkillType;
(function (SkillType) {
    SkillType[SkillType["ActiveSkill"] = 1] = "ActiveSkill";
    SkillType[SkillType["PassiveSkill"] = 2] = "PassiveSkill"; //被动技能（英雄身上发动，进战斗前就已经执行完）
    //TriggleSkill=3 //在战斗中根据触发条件起作用
})(SkillType || (SkillType = {}));
//技能释放阶段
export var SkillActType;
(function (SkillActType) {
    SkillActType[SkillActType["LeaderSkill"] = 1] = "LeaderSkill";
    SkillActType[SkillActType["ActionSkill"] = 2] = "ActionSkill";
    SkillActType[SkillActType["ChaseSkill"] = 3] = "ChaseSkill";
    SkillActType[SkillActType["RectifySkill"] = 4] = "RectifySkill"; //修整技能(回合结束发动)
})(SkillActType || (SkillActType = {}));
