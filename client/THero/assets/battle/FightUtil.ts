import FightMgr from "../scripts/module/fight/FightMgr";
import { BDataCfg } from "./BDataCfg";
import { Battle } from "./Battle";
import { PkgBattleInitData, TroopInfo } from "./define/BattlePkgData";
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
                    heroInfo["comboRate"]=50
                    heroInfo["stunRate"]=0
                    heroInfo["attack"]=150
                    td.heroInfos.push(heroInfo);

                    arr.push({teamId:1,heroInfos:[{HP:heroInfo["HP"],id:0,uid:1}]})
                }
            } else {
                for (let i = 0; i < 1; i++) {
                    let idx = k * 5 + i + 1;
                    let heroInfo = BDataCfg.ins.getCfg("TestHeroInfo1", idx);
                    heroInfo["comboRate"]=10
                    heroInfo["counterRate"]=100
                    heroInfo["attack"]=150
                    td.heroInfos.push(heroInfo);

                    arr.push({teamId:2,heroInfos:[{HP:heroInfo["HP"],id:heroInfo.id,uid:6}]})
                }
            }
            initData.troopInfos[k] = td;
        }


        console.log(' ---RUN BATTLE ---');


        let battle: Battle = new Battle();
        battle.init(initData);
        battle.running();

        console.log("battle.pkg.initData============", battle.pkg.initData)

        console.log("data================", battle.pkg.data)

        let data = JSON.parse(JSON.stringify(battle.pkg.data))

        FightMgr.getInstance().resetData(arr, data,[])
    }

    
}