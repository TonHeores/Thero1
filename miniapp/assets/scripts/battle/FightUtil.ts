import FightMode from "../scripts/model/FightMode";
import { CommUtil } from "../scripts/utils/pomelo/CommUtil";
import { BDataCfg } from "./BDataCfg";
import { Battle } from "./Battle";
import { HeroInfo, PkgBattleInitData, TroopInfo } from "./define/BattlePkgData";
import serData from './test.json';

export default class FightUtil {


    static startFight() {
        console.log('----BEGIN---');
        BDataCfg.ins.init(serData);
        let arr = []
        let initData: PkgBattleInitData = new PkgBattleInitData();
        initData.rndSeedStr = "f1b9c39bb0a907d806bf1033f87f38700c7930e108572f77b92c25ee55457a7c";
        for (let k = 0; k < 2; k++) {
            let td: TroopInfo = new TroopInfo();
            if (k == 0) { //我方队伍 需要读取我方的上阵列表
                for (let i = 0; i < 1; i++) {
                    let idx = k * 5 + i + 1;
                    let heroInfo = BDataCfg.ins.getCfg("TestHeroInfo1", idx);
                    heroInfo.unitId = 10 + i +i
                    td.heroInfos.push(heroInfo);
                }
            } else {
                for (let i = 0; i < 1; i++) {
                    let idx = k * 5 + i + 1;
                    let heroInfo = BDataCfg.ins.getCfg("TestHeroInfo1", idx);
                    heroInfo.unitId = 20 + i +i
                    td.heroInfos.push(heroInfo);
                }
            }
            initData.troopInfos[k] = td;
        }


        console.log(' ---RUN BATTLE ---');


        let battle: Battle = new Battle();
        battle.init(initData);
        battle.battleType = 2; //THero需指定为2
        battle.running();

        console.log("battle.pkg.initData============", battle.pkg.initData)

        console.log("data================", battle.pkg.data)

        // let data = JSON.parse(JSON.stringify(battle.pkg.data))

        // console.log("battle============", battle)

        FightMode.initFight(1,battle.pkg.initData, battle.pkg.data, [])
    }

    static startFightWithParms(playerAtts,monsterId,monsterAttrs) {
        console.log('startFightWithParms ');
        console.log(playerAtts)
        console.log(monsterId)
        console.log(monsterAttrs)
        BDataCfg.ins.init(serData);
        let arr = []
        let initData: PkgBattleInitData = new PkgBattleInitData();
        initData.rndSeedStr = "f1b9c39bb0a907d806bf1033f87f38700c7930e108572f77b92c25ee55457a7c";
        for (let k = 0; k < 2; k++) {
            let td: TroopInfo = new TroopInfo();
            if (k == 0) { //我方队伍 需要读取我方的上阵列表
                for (let i = 0; i < 1; i++) {
                    let heroInfo: HeroInfo = new HeroInfo();
                    heroInfo.id = 901
                    heroInfo.unitId = 11
                    let arr = playerAtts.split(",")
                    let attrArr = []
                    arr.forEach(element => {
                        attrArr.push(parseInt(element))
                    });
                    heroInfo.attrs = attrArr ;
                    heroInfo.battlePower = CommUtil.calcBattlePower(heroInfo.attrs);
                    heroInfo.lv = 1
                    heroInfo.skills = []
                    td.heroInfos.push(heroInfo);
                    console.log("heroInfo1=",heroInfo)
                }
            } else {
                for (let i = 0; i < 1; i++) {
                    let heroInfo: HeroInfo = new HeroInfo();
                    heroInfo.id = parseInt(monsterId) 
                    heroInfo.unitId = 21
                    let arr = monsterAttrs.split(",")
                    let attrArr = []
                    arr.forEach(element => {
                        attrArr.push(parseInt(element))
                    });
                    heroInfo.attrs = attrArr ;
                    heroInfo.battlePower = CommUtil.calcBattlePower(heroInfo.attrs);
                    heroInfo.lv = 1
                    heroInfo.skills = []
                    td.heroInfos.push(heroInfo);
                    console.log("heroInfo2=",heroInfo)
                }
            }
            initData.troopInfos[k] = td;
        }


        console.log(' ---RUN BATTLE ---');


        let battle: Battle = new Battle();
        battle.init(initData);
        battle.battleType = 2; //THero需指定为2
        battle.running();

        console.log("battle.pkg.initData============", battle.pkg.initData)

        console.log("data================", battle.pkg.data)

        // let data = JSON.parse(JSON.stringify(battle.pkg.data))

        // console.log("battle============", battle)

        FightMode.initFight(1,battle.pkg.initData, battle.pkg.data, [])
    }

    
}