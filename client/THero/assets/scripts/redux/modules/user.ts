
import { EquipInfo, PlayerInfo, TaskObj } from "../../utils/pomelo/DataDefine";
import ReduxName from "../reduxName";

export default class Store {
	public static storeName = ReduxName.user;

	public static state = {
		accInfo: {
			uid: "", //用户唯一标识号
			lv: 1,
			exp: 0,
			name: "",
			titleId: 0, //称号
			platformUid: 0, //平台uri
			avatar:"",
			//宝箱次数
			//宝箱生成时间（定期增加次数——未确定方案）
			chestLevel: 0, //宝箱等级
			chestLastAddTime:0,
			chestUpgradeFinishTime:0,
			curEquip:null as EquipInfo | null,
			//关卡信息
			curMatchLv: 0,
			//装备信息（1-12）equips[AtttrType]
			equips: [] as EquipInfo[],//角色属性信息
			// 扩展位（未定义，二期功能）
			// 角色属性信息
			heroAttrs: [] as number[],
			items:[] as number[], // 物品数量
			//战斗属性 heroAttrs[AttrType]=attrVal;
			battlePower: 0, //战力
			task:null as TaskObj,
		} as PlayerInfo,
		myTs:0, //服务器系统时间
	}

}