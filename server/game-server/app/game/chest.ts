import { CommUtil } from '../../proto/CommUtil'
import { EquipInfo, PlayerInfo } from '../../proto/DataDefine'
import { ItemType, Consts } from '../../proto/ConstDefine'
import { ConfigMgr } from '../comm/ConfigMgr'
import HelpUtil from '../utils/helpUtil'
import Log from '../utils/log'
import { Player } from './player'
import { ErrorCode } from '../comm/ErrorCode'

export class Chest {
	//升级宝箱
	public static chestUpgrade(player: Player): number {
		const { playerInfo } = player;

		if (playerInfo.chestUpgradeFinishTime > 0) {
			return ErrorCode.getCode("ChestUpgrade_StillInCD");
		}

		const chestLevelCfg = ConfigMgr.getCfg('ChestLevelCfg', playerInfo.chestLevel)
		const { items } = playerInfo
		if (items[ItemType.GoldCoin] < chestLevelCfg.cost) {
			return ErrorCode.getCode("ChestUpgrade_CoinNotEnough");
		}

		items[ItemType.GoldCoin] -= chestLevelCfg.cost
		playerInfo.chestUpgradeFinishTime = Date.now() + chestLevelCfg.upgradeTime * 1000

		return 0
	}


	//升级宝箱加速
	public static chestUpgSpeedUp(player: Player, cardCount: number): [code:number,isFinished:boolean] {
		const { playerInfo } = player;
		let isFinished=false;

		if (playerInfo.chestUpgradeFinishTime <= 0) {
			return [-1,false]; //不应该没有升级啊？直接报错！
		}

		//每张加速卡加速多少分钟
		const speedUpCardMinute = ConfigMgr.getGlobalSetting('speedUpCardMinute');
		if (speedUpCardMinute == null || speedUpCardMinute <= 0){
			return [-2,false];
		} 
		const speedUpCardMSec = speedUpCardMinute * 60 * 1000;

		//最大卡数量
		let restTime = Math.floor(playerInfo.chestUpgradeFinishTime - Date.now());
		let maxCardCount = Math.ceil(restTime / speedUpCardMSec);
		if (cardCount > maxCardCount) cardCount = maxCardCount; //不要用多了！

		//检查卡数量
		if (playerInfo.items[ItemType.SpeedUpCard] < cardCount) {
			return [ErrorCode.getCode("ChestUpgradeSpeedUp_CardNotEnough"),false];
		}


		//下面才是正常能加速的！

		//扣卡
		playerInfo.items[ItemType.SpeedUpCard] -= cardCount;
		//缩短时间
		playerInfo.chestUpgradeFinishTime -= cardCount * speedUpCardMSec;
		
		//进行升级操作
		isFinished = Chest.checkChestUpgrade(player);

		return [0,isFinished];
	}




	//检查宝箱是否需要增加次数了？
	public static checkChestAutoAddCount(player: Player): boolean {
		const { playerInfo } = player;
		const chestIncMaxCount = ConfigMgr.getGlobalSetting("chestIncMaxCount");

		const now = Date.now()
		if (playerInfo.chestLastAddTime <= 0) {
			//怎么会空？空了直接赋值now但是不给东西！
			Log.info("playerInfo.chestLastAddTime <= 0,", playerInfo);
			playerInfo.chestLastAddTime = CommUtil.getLastWholeHour(now).valueOf();
		}

		//看是否需要增加数量
		if(playerInfo.items[ItemType.ChestCount] >= chestIncMaxCount){
			//现有数量>最大数量，就不能自动增加（但是做任务之类还是可以增加的！）
			return false;
		}else{
			const hours = CommUtil.countHoursByTimeDiff(playerInfo.chestLastAddTime, now);
			if (hours > 0) {
				const incChestCountEachHour = ConfigMgr.getGlobalSetting('incChestCountEachHour');
				// let addCount = hours * incChestCountEachHour;
				//addCount 要计算一下， 自增的时候不能超过50
				let addCount = Math.min(chestIncMaxCount- playerInfo.items[ItemType.ChestCount] , hours * incChestCountEachHour)
				playerInfo.chestLastAddTime = CommUtil.getLastWholeHour(now).valueOf() //更新上次自增时间
				player.addItem(ItemType.ChestCount,addCount);
				return true;
			}
		}

		return false
	}


	//检查宝箱是否有升级（有就进行升级，并返回true)
	public static checkChestUpgrade(player: Player): boolean {
		const { playerInfo } = player;

		if (playerInfo.chestUpgradeFinishTime !== 0 && playerInfo.chestUpgradeFinishTime <= Date.now()) {
			Log.info('Chest have finished upgrade!', playerInfo.chestUpgradeFinishTime, playerInfo.chestLevel)
			playerInfo.chestUpgradeFinishTime = 0; //时间清空
			playerInfo.chestLevel++; //升级
			player.notifyChestLevelUp();

			return true;
		}
		return false;
	}





	//更新数据
	public static checkUpdateData(player: Player): boolean {
		let isUpdate = false;
		if (Chest.checkChestUpgrade(player)) isUpdate = true;
		if (Chest.checkChestAutoAddCount(player)) isUpdate = true;

		return isUpdate;
	}



}
