import { Application, BackendSession } from 'pinus'
import Log from '../../../utils/log'

import { BaseHandler } from '../../../comm/BaseHandler'
import { Chest } from '../../../game/chest'
import { ConfigMgr } from '../../../comm/ConfigMgr'
import { Task } from '../../../game/task'
import { Consts, ItemType, TaskType } from '../../../../proto/ConstDefine'
import { MainChestUpgSpeedUpReq, MainChestUpgSpeedUpRsp, MainEquipSaleReq, MainEquipWearReq } from '../../../../proto/ProtoPackage'
import { Equip } from '../../../game/equip'
import { CommUtil } from '../../../../proto/CommUtil'

class MainHanlder extends BaseHandler {



	//开箱子
	async openChest(req: any, session: BackendSession) {
		//初始化
		if ((await this.loadPlayer(req, session)) == false) return this.onError()

		const playerInfo = this.player.playerInfo

		//开箱数判断
		if (playerInfo.items[ItemType.ChestCount] <= 0) {
			return this.onError('No opening chest count left')
		}

		try {
			Log.info(`chestLevel: ${playerInfo.chestLevel}, lv: ${playerInfo.lv}`)

			const newEquip = Equip.generateEquip(playerInfo.chestLevel, playerInfo.lv)
			playerInfo.curEquip = newEquip
			this.player.reduceItem(ItemType.ChestCount,1)
			// playerInfo.items[ItemType.ChestCount]--
			//挂接任务监听器

			Task.addTaskStatEvent(this.player, TaskType.StatOpenChest)
			Task.addTaskStatEvent(this.player, TaskType.StatGetEquip)
		} catch (e) {
			return {
				code: -1,
				message: e.message
			}
		}

		//默认返回playerInfo
		return this.response()
	}



	//装备穿戴
	async equipWear(req: MainEquipWearReq, session: BackendSession) {

		//初始化
		if ((await this.loadPlayer(req, session)) == false) return this.onError()

		let ret=0;
		const { playerInfo } = this.player
		const { curEquip, equips = [] } = playerInfo;

		Log.info('CurrEquip: ', curEquip)
		if (!curEquip) this.onError('You have no equip in hand')

		//换装备
		ret = Equip.equipWear(this.player);
		if(ret<0)return this.onErrorCode(ret);

		//默认返回playerInfo
		return this.response()
	}



	//装备出售
	async equipSale(req: MainEquipSaleReq, session: BackendSession) {
		//初始化
		if ((await this.loadPlayer(req, session)) == false) return this.onError()

		//卖装备
		let ret = Equip.equipSale(this.player);
		if(ret<0)return this.onErrorCode(ret);

		//返回基本PlayerInfo包
		return this.response();
	}


	//宝箱升级
	async chestUpgrade(req: any, session: BackendSession) {
		//初始化
		if ((await this.loadPlayer(req, session)) == false) return this.onError()
		const { playerInfo } = this.player
		// 开始升级宝箱
		let retCode = Chest.chestUpgrade(this.player);
		if (retCode < 0) {
			return this.onError(undefined, retCode)
		}

		//返回基本PlayerInfo包
		return this.response()
	}




	//宝箱升级加速
	async chestUpgSpeedUp(req: MainChestUpgSpeedUpReq, session: BackendSession) {
		//初始化
		if ((await this.loadPlayer(req, session)) == false) return this.onError()
		const { playerInfo } = this.player
		// 开始升级宝箱
		const[code,isFinished] = Chest.chestUpgSpeedUp(this.player,req.cardCount);
		if (code < 0) {
			this.onError(undefined, code);
		}

		//返回
		let rsp:MainChestUpgSpeedUpRsp = new MainChestUpgSpeedUpRsp;
		rsp.isFinished = isFinished;
		rsp.chestUpgradeFinishTime = playerInfo.chestUpgradeFinishTime;
		return this.response();
	}
}

export default (app: Application) => {
	return new MainHanlder(app)
}
