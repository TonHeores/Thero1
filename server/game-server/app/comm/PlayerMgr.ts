import Log from '../utils/log'
import { Player } from '../game/player'
import { ConfigMgr } from './ConfigMgr'
import { PlayerInfo } from '../../proto/DataDefine'
import { DBMgr } from './DBMgr'
import { NewUserInfo } from '../../proto/ProtoPackage'
import HelpUtil from '../utils/helpUtil'
import { CommUtil } from '../../proto/CommUtil'




class PlayerMgr {

  //创建一个player
  public static async createPlayer(uid: string, newUserInfo: NewUserInfo): Promise<[number,Player]> {
    
    let retCode = 0;

    const defaultPlayerData = ConfigMgr.getGlobalSetting('defaultPlayerData')
    const defaultPlayerItems = ConfigMgr.getGlobalSetting('defaultPlayerItems')


    let playerInfo: PlayerInfo =new PlayerInfo;

    playerInfo.avatar = newUserInfo.userImgUri;
    playerInfo.name = newUserInfo.userName;
    //playerInfo.platformUid = newUserInfo.platFormType;

    HelpUtil.copyObj(playerInfo,defaultPlayerData);
    playerInfo.items = defaultPlayerItems;
    playerInfo.chestLastAddTime = CommUtil.getLastWholeHour(Date.now()).valueOf();

    //保存UID！
    playerInfo.uid = uid;

    Log.info('newPlayer info: ', playerInfo)
   
    let player:Player = new Player(playerInfo);
    player.updateHeroAttrs(); //属性要加

    await player.saveData();

    return [retCode,player];
  }

  

  public static async changePlayerName(player:Player,name:string):Promise<number>{
    //这里前面其实需要校验有没有同名
    //还没做！
    player.playerInfo.name = name;

    player.saveData();
    return 0;
  }


  
  public static async changePlayerGender(player:Player,gender:number):Promise<number>{
    player.playerInfo.gender= gender;
    player.saveData();
    return 0;
  }


  //从redis和db中读取player
  public static async loadPlayer(uid: string):Promise<Player>{

    Log.info('loadPlayer,uid=', uid);
    
    // 根据uid查询用户信息
    const playerInfo = await DBMgr.readPlayerInfo(uid);
    if(playerInfo==null)return null;
    
    let player = new Player(playerInfo);
    await player.checkUpdateData(); //检查更新！

    return player;
  }


  public static async savePlayer(player:Player) {
    return await DBMgr.writePlayerInfo(player.playerInfo);
  }

}

export default PlayerMgr
