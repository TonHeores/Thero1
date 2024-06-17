import { EquipInfo, ItemInfo, PlayerInfo } from './DataDefine'


export class BaseReq {
	uid: number = 0 //填不填都行
}

//很多场合没有上行参数
export class BaseRsp {
	code: number = 0
	msg: string = ''
}

//很多场合都是只推一个playerInfo的
export class PlayerInfoRsp extends BaseRsp {
	playerInfo: PlayerInfo
	timestamp: number
}

/////////////////////////////////////////////////////////////////
// 角色模块
/////////////////////////////////////////////////////////////////

//登录(包括自动注册)

export class NewUserInfo {
	userName: string
	userImgUri: string
	platFormType: number //平台类型 1:H5;2:TG
}

export class RoleEnterGameReq extends NewUserInfo {	token: string;}
export class RoleEnterGameRsp extends PlayerInfoRsp {}


// 更新角色信息
export class RoleUpdateDataReq extends BaseReq { }
export class RoleUpdateDataRsp extends PlayerInfoRsp {}



// 更改姓名
export class RoleChangeNameReq extends BaseReq {name:string;}
export class RoleChangeNameRsp extends PlayerInfoRsp {}

// 更改性别
export class RoleChangeGenderReq extends BaseReq {gender:number; }
export class RoleChangeGenderRsp extends PlayerInfoRsp {}

/////////////////////////////////////////////////////////////////
// 宝箱模块
/////////////////////////////////////////////////////////////////

//宝箱开启
export class MainOpenChestReq extends BaseReq { }
export class MainOpenChestRsp extends PlayerInfoRsp { }

//装备穿戴
export class MainEquipWearReq extends BaseReq { }
export class MainEquipWearRsp extends PlayerInfoRsp { }

//装备出售
export class MainEquipSaleReq extends BaseReq { }
export class MainEquipSaleRsp extends PlayerInfoRsp { }

//宝箱升级
export class MainChestUpgradeReq extends BaseReq { }
export class MainChestUpgradeRsp extends PlayerInfoRsp { }

//宝箱升级加速
export class MainChestUpgSpeedUpReq extends BaseReq {
	public cardCount:number;
}

export class MainChestUpgSpeedUpRsp extends PlayerInfoRsp { 
	public isFinished:boolean; //是否升级完成
	public chestUpgradeFinishTime: number; // 宝箱升级冷却时间
}

/////////////////////////////////////////////////////////////////
// 战斗模块
/////////////////////////////////////////////////////////////////

//说明：前端发起请求指令，但不需要任何参数；
//server根据当前的关卡，matchCurLevel（应该改名curMatchLv？）进行战斗
//胜利则返回奖励，并把matchLv++;
export class BattleFightMatchReq extends BaseReq { }

export class BattleFightMatchRsp extends PlayerInfoRsp {
	battlePackage: Object //战斗包，格式为：PkgBattleRetData
	battleInitData:Object; //战斗初始包
	rewardInfos: ItemInfo[] //战斗奖励
}

/////////////////////////////////////////////////////////////////
// gm模块
/////////////////////////////////////////////////////////////////
export class GmExeGmCmdReq {
	cmd: string
	pars: string[]
}

export class GmExeGmCmdRsp extends PlayerInfoRsp{}

/////////////////////////////////////////////////////////////////
// 任务模块
/////////////////////////////////////////////////////////////////
export class TaskMainTaskFinishReq extends BaseReq { }
export class TaskMainTaskFinishRsp extends PlayerInfoRsp {
	rewardInfos: ItemInfo[]
}

export class TaskAchieveTaskFinishReq {
	taskId: number //任务Id
}

export class TaskAchieveTaskFinishRsp extends PlayerInfoRsp {
	rewardInfos: ItemInfo[]
}
