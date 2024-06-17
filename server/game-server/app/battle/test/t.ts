import { BDataCfg } from "../BDataCfg";
import { BUtils } from "../BUtils";
import { Battle } from "../Battle";
import { BattleTroop } from "../BattleTroop";
import { HeroInfo, PkgBattleInitData, TroopInfo } from "../define/BattlePkgData";

function test_gop() {
  let dataCfg: BDataCfg = new BDataCfg()
  BDataCfg.ins.init('../../../datas/server_game_data.json')
  let dataStr = BDataCfg.ins.getSet('TestHeroInfo1')

  console.log(' build battle init data')

  let initData: PkgBattleInitData = new PkgBattleInitData()
  initData.rndSeedStr = 'f1b9c39bb0a907d806bf1033f87f38700c7930e108572f77b92c25ee55457a7c'
  for (let k = 0; k < 2; k++) {
    let td: TroopInfo = new TroopInfo()
    for (let i = 0; i < 5; i++) {
      let idx = k * 5 + i + 1
      let heroInfo = BDataCfg.ins.getCfg('TestHeroInfo1', idx)

      // this.attrVals[AttrType.ComboRate] = unitInfo["comboRate"];
      // this.attrVals[AttrType.CounterRate] = unitInfo["counterRate"];
      // this.attrVals[AttrType.BloodRate] = unitInfo["bloodRate"];
      // this.attrVals[AttrType.StunRate] = unitInfo["stunRate"];

      heroInfo['comboRate'] = 80
      heroInfo['counterRate'] = 80
      heroInfo['rsComboRate'] = 15
      heroInfo['rsCounterRate'] = 15

      td.heroInfos.push(heroInfo)
    }
    initData.troopInfos[k] = td
  }

  console.log(' ---RUN BATTLE ---')
  let battle: Battle = new Battle()
  battle.init(initData)
  battle.battleType = 2
  battle.running()

  BUtils.fileWriteObj('./test/battle_init_data.json', battle.pkg.initData)
  BUtils.fileWriteObj('./test/battle_out_data.json', battle.pkg.data)
}



function test_THero() {
  let dataCfg: BDataCfg = new BDataCfg()
  BDataCfg.ins.init('../../../datas/server_game_data.json')

  console.log(' build battle init data')

  //战斗启动数据
  let troop1: TroopInfo = new TroopInfo()
  let troop2: TroopInfo = new TroopInfo()

  let initData: PkgBattleInitData = new PkgBattleInitData()
  // initData.rndSeedStr = 'f1b9c39bb0a907d806bf1033f87f38700c7930e108572f77b92c25ee55457a7c'
  // initData.troopInfos[0] = troop1
  // initData.troopInfos[1] = troop2

  //玩家和野怪的赋值部分：

  // //实际代码----------------------------

  //玩家
  //  let playerInfo:Object;
  // //let heroInfo1 initData.troopInfos[0][0]=playerInfo.heroAttrs
  // let heroInfo1:HeroInfo = initData.troopInfos[0][0];
  // heroInfo1.attrs = playerInfo["heroAttrs"];

  //怪物
  // let heroInfo2:HeroInfo = initData.troopInfos[1][0];
  // //从关卡表里读取，如 playerInfo["curMatchLv"] =10
  // let matchId=10;
  // let matchCfg = BDataCfg.ins.getCfg("MatchInfoCfg",matchId);
  // let heroInfo2:HeroInfo = initData.troopInfos[1][0];
  // heroInfo2.attrs = matchCfg["heroAttrs"];
  // //实际代码----------------------------

  //这里用测试数据
  //test数据

  initData.troopInfos[0].heroInfos[0] = new HeroInfo();
  initData.troopInfos[0].heroInfos[0].attrs = [0,50000,50000,10000,10000,3.46,0,3.34,3.1,0,3.02,1.88,0,0,3.05,0,0,0,0,0,0,0,0,0,0,0,0];
  initData.troopInfos[1].heroInfos[0] = new HeroInfo();
  initData.troopInfos[1].heroInfos[0].attrs = [0,160,80,400,40,50,50,50,50,50,50,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,0,0,0,0,0];

//   hero atrrs1=[50000,50000,10000,10000,3.46,0,3.34,3.1,0,3.02,1.88,0,0,3.05,0,0,0,0,0,0,0,0,0,0,0,0]
// hero atrrs2=[160,80,400,40,50,50,50,50,50,50,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,0,0,0,0,0]

  // initData.troopInfos[0].heroInfos[0] = BDataCfg.ins.getCfg('TestHeroInfo1', 1) //玩家
  // initData.troopInfos[1].heroInfos[0] = BDataCfg.ins.getCfg('TestHeroInfo1', 2) //怪物

  console.log(' ---RUN BATTLE ---')
  let battle: Battle = new Battle()
  battle.init(initData)
  battle.battleType = 2 //THero需指定为2
  battle.running()

  BUtils.fileWriteObj('./test/battle_init_data.json', battle.pkg.initData) //战斗起始数据
  BUtils.fileWriteObj('./test/battle_out_data.json', battle.pkg.data) //战斗结束数据
}



//----------------------------------------------------------------------
//----------------------------------------------------------------------
console.log('----BEGIN---', BDataCfg);
test_THero();

console.log('----END---');



