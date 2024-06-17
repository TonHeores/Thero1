//物品类型
export enum ItemType {
  GoldCoin = 1,
  GemCoin = 2,
  ChestCount = 3,
  SpeedUpCard = 4,
  ArenaTicket = 5,
  ChestUpMaterial = 6,
  PetUpMaterial = 7,

  Exp=9,
}

//属性类型

//属性类型
export enum AttrType {
  //基础属性
  Attack = 1,
  Defense = 2,
  HP = 3, //满血量
  Speed = 4,

  //战斗属性（12个）
  TrumpRate = 5, //暴击率
  DodgeRate = 6, //闪避率
  ComboRate = 7, //连击率
  CounterRate = 8, //反击率
  BloodRate = 9, //吸血率
  StunRate = 10, //击晕率
  RsTrumpRate = 11,
  RsDodgeRate = 12,
  RsComboRate = 13,
  RsCounterRate = 14,
  RsBloodRate = 15,
  RsStunRate = 16,

  //特殊属性（10个）
  DmgExtRate = 17, //伤害增强
  RsDmgExtRate = 18, //伤害减弱
  TrumpDmgRate = 19, //暴伤率
  RsTrumpDmgRate = 20, //抗爆伤率
  CureRate = 21, //自愈率
  BlockRate = 22, //格挡率
  RsBlockRate = 23, //抗格挡率
  PierceRate = 24, //破甲率
  RsPierceRate = 25 //抗破甲率
}

//装备部位
export enum EquipPos {
  Weapon = 1, //武器
  Helmet = 2, //头盔
  Armor = 3, //铠甲
  Shield = 4, //盾牌

  Glove = 5, //手套
  Wrist = 6, //护腕
  Belt = 7, //腰带
  Shoulder = 8, //护肩

  Shoes = 9, //靴子
  Trousers = 10, //裤子
  Necklace = 11, //项链
  Jewelry = 12, //饰品

  //以下是扩展位

  Mount = 13,
  Wing = 14,
  Pets = 15,
  Artifact = 16,
  Gemstone = 17,
  Scroll = 18,

  Avatar = 19 //时装
}

//任务类别
export enum TaskCategory {
  Main = 1, //主线任务
  Achieve = 2 //成就任务
}

//任务模式
export enum TaskMode {
  Data = 1, //校验型
  Stat = 2, //统计型
  Sum = 3, //累计型
  Func = 4, //操作型(前端功能操作記錄)
}

//任务类型
export enum TaskType {
  RoleLv = 1,
  ChestLv = 2,
  MatchLv = 3,
  BattlePower = 4,
  HaveGold = 5,

  StatOpenChest = 11,
  StatGetEquip = 12,
  StatSaleEquip = 13,
  StatGetGold = 14,
  StatMatchFight = 15,
  StatArenaFight = 16,

  SumOpenChest = 21,
  SumGetEquip = 22,
  SumSaleEquip = 23,
  SumGetGold = 24,
  SumMatchFight = 25,
  SumArenaFight = 26
}

//成就任务组
export enum AchieveTaskGroup {
  Normal = 1, //一般成就任务
  MatchChapter = 2 //关卡章节
}

//成就任务组
export enum PlatFormType {
  H5 = 1, //h5 平台
  TG = 2 //TG
}



//常量定义
export enum Consts {
  EquipPartCount = 12,
  AttrMaxCount = 26,
  AttrTypeBaseMin = 1, //基础属性
  AttrTypeBaseMax = 4,
  BattleAttrTypeMin=5, //战斗属性
  BattleAttrTypeMax=16,
  SpecAttrTypeMin=17, //特殊属性
  SpecAttrTypeMax=26,

  BaseAttrCount=4,
  BattleAttrCount=12,
  SpecAttrCount=10,
  AttrCount=26,
  
  ItemTypeCount=10,

  // 最大宝箱数
  MaxChestCount =999,
  // 宝箱开始自增临界数，低于这个数，开始自增
  ChestSupplyMaxCount =50,
}


