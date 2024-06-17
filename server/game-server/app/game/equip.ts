import { EquipInfo, PlayerInfo } from '../../proto/DataDefine'
import {  Consts, TaskType } from '../../proto/ConstDefine'
import { ConfigMgr } from '../comm/ConfigMgr'
import HelpUtil from '../utils/helpUtil'
import Log from '../utils/log'
import { Player } from './player'
import { Task } from './task'

export class Equip {

    //从 equipId 读取 part
    public static getPartByEquipId(equipId: number): number {
        const equipCfg = ConfigMgr.getCfg('EquipCfg', equipId);
        if(equipCfg==null)return 0;
        let part = equipCfg.part;

        if (part < 1 || part > Consts.EquipPartCount) {
            Log.logError('get equip part error.equipId=', equipId)
            return 0
        }
        return part;
    }

    //从 equipId 读取 quality
    public static getQualityByEquipId(equipId: number): number {
        const equipCfg = ConfigMgr.getCfg('EquipCfg', equipId);
        if(equipCfg==null)return 0;
        return equipCfg.quality;
    }

    
    //从 quality,part 生成equipId
    public static getEquipId(quality:number,part:number): number {
        return quality*100 + part;
    }


    //生成装备
    static generateEquip(chestLevel: number, lv: number) {
        // 读宝箱质量配置
        const chestQualityRecords = ConfigMgr.getCfg('ChestQualityCfg', chestLevel)
        Log.debug('We get chestQualityRecords:', chestQualityRecords, chestLevel)
        Log.info('qualityRates:', JSON.stringify(chestQualityRecords.qualityRates))

        // 随机一个quality
        const quality = HelpUtil.getRandomByProbabilities(chestQualityRecords.qualityRates as number[])
        Log.info('Equip quality: ', quality)

        // 计算part
        const part = HelpUtil.getRandomInt(1, Consts.EquipPartCount)
        Log.info('Equip part: ', part, Consts.EquipPartCount)

        const equipId = Equip.getEquipId(quality,part);
        Log.info('equipId: ', equipId)

        // 读取基础属性成长值
        const equipCfg = ConfigMgr.getCfg('EquipCfg', equipId)
        const { baseAttrIncs, fightAttrMin, fightAttrMax, fightAttrNum, specAttrNum, specAttrMin, specAttrMax } = equipCfg
        Log.info('Base attrincs: ', baseAttrIncs)

        // 装备等级
        const equipLevel = HelpUtil.getRandomInt(lv, lv + 2)
        Log.info('equipLevel: ', lv, equipLevel)

        const baseAttrs = ['attack', 'defense', 'hp', 'speed'].map((attr, index) => {
            let value = equipLevel * HelpUtil.getRandomFloat(baseAttrIncs[attr].min, baseAttrIncs[attr].max)
            Log.info('Basics index: ', attr, value, baseAttrIncs[attr])
            return {
                attrId: index + 1,
                attrVal: HelpUtil.formatNumber(value,0) //基础属性需要取整
            }
        })

        Log.info('Base attrs result:', baseAttrs)
        Log.info(`fightAttrNum=${fightAttrNum}, fightAttrMin=${fightAttrMin}, fightAttrMax=${fightAttrMax}`)

        // 战斗属性
        const possibleBattleAttrs = Array.from({ length: Consts.BattleAttrCount }, (_, index) => index + Consts.BaseAttrCount + 1)
        const battleAttrs = new Array(fightAttrNum).fill(0).map(() => {
            // 随机生成一个战斗属性
            const attr = HelpUtil.getRandomElementAndRemove(possibleBattleAttrs)
            // 随机生成战斗属性值
            let value = HelpUtil.getRandomFloat(fightAttrMin, fightAttrMax);
            value = Math.floor(value * 100) / 100;

            return {
                attrId: attr,
                attrVal: HelpUtil.formatNumber(value) //战斗属性：保留2位小数
            }
        })

        Log.info('Battle attrs result: ', battleAttrs)
        // 特殊属性
        const possibleSpecialAttrs = Array.from({ length: Consts.SpecAttrCount }, (_, index) => index + Consts.BaseAttrCount + Consts.BattleAttrCount + 1)
        const specialAttrs = new Array(specAttrNum).fill(0).map(() => {
            // 随机生成一个特殊属性
            const attr = HelpUtil.getRandomElementAndRemove(possibleSpecialAttrs)
            // 随机生成特殊属性值
            let value = HelpUtil.getRandomFloat(specAttrMin, specAttrMax)
            value = Math.floor(value * 100) / 100;

            return {
                attrId: attr,
                attrVal: HelpUtil.formatNumber(value) //特殊属性：保留2位小数
            }
        })
        Log.info('Special attrs result: ', specialAttrs)

        let equipInfo: EquipInfo = new EquipInfo()
        equipInfo.equipId = equipId
        equipInfo.lv = equipLevel
        equipInfo.attrInfos = [...baseAttrs, ...battleAttrs, ...specialAttrs].sort((a, b) => a.attrId - b.attrId)

        return equipInfo
    }


    //出售装备
    static equipSale(player:Player):number{

        const{playerInfo} = player;

		//装备不能为空！
		if (!playerInfo.curEquip) {
			return -1;
		}

		// 查找equip的基本信息
		let roleLvCfg = ConfigMgr.getCfg('RoleLevelCfg', playerInfo.lv)
		if (!roleLvCfg) return -2;

		player.addExp(roleLvCfg.equipSaleGetExp); // 这里用户可能升级
		player.addGold(roleLvCfg.equipSaleGetGold);
		playerInfo.curEquip = null;

        //挂接任务监听器
		Task.addTaskStatEvent(player, TaskType.StatSaleEquip);

        //
        return 0;
    }


    static equipWear(player:Player):number{
        const { playerInfo } = player;
		const { curEquip, equips = [] } = playerInfo;

        if (!curEquip) return -1;

        const part = Equip.getPartByEquipId(curEquip.equipId)
        if (!part)
		// 根据equipId查找装备部位
		Log.info('Equip part: ', part)
		if (!part) return -2;

		// part和equips交换
		const tmp = equips[part] ?? null
		equips[part] = curEquip
		playerInfo.curEquip = tmp ?? null

        //计算英雄属性
		player.updateHeroAttrs()
		Log.info('uid:',playerInfo.uid ,",New heroAttrs: ", playerInfo.heroAttrs);

        return 0;
    }
}
