//协议路由（上行Request、广播Notify)
export enum RequestRoute {

  //登录模块
  LoginEnterGame = 'connector.loginHandler.enterGame',
  
  //角色模块：进入游戏（加载角色信息/创建角色）
  RoleUpdateData = 'game.roleHandler.updateData',
  RoleChangeName = 'game.roleHandler.changeName',
  RoleChangeGender = 'game.roleHandler.changeGender',

  //宝箱模块：err=-1xxxx
  MainOpenChest = 'game.mainHandler.openChest', //宝箱开启 ，errCode=-101xx
  MainEquipWear = 'game.mainHandler.equipWear', //装备穿戴 ，errCode=-102xx
  MainEquipSale = 'game.mainHandler.equipSale', //装备出售 ，errCode=-103xx
  MainChestUpgrade = 'game.mainHandler.chestUpgrade', //宝箱升级 ，errCode=-104xx
  MainChestUpgSpeedUp = 'game.mainHandler.chestUpgSpeedUp', //宝箱升级 ，errCode=-105xx
  
  //MainSetChestConfig="game.mainHandler.setChestConfig",//宝箱自动开启设置 ，errCode=-106xx

  //战斗模块：err=-2xxxx
  MatchFightLevel = 'game.battleHandler.fightMatch',

  //gm模块
  GMExeCmd = 'game.gmHandler.exeCmd',

  //任务模块
  TaskFinishTask = 'game.taskHandler.finishMainTask',

  //成就模块
  TaskFinishAchieve = 'game.taskHandler.finishAchieveTask'
}

// //服务器广播协议
// export enum NotifyRoute {
//   RoleUpdateData = "game.roleHandler.updateData",
// }
