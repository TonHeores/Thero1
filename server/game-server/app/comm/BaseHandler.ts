import { Application, BackendSession } from 'pinus'
import Log from '../utils/log'
import PlayerMgr from './PlayerMgr'
import { PlayerInfo } from '../../proto/DataDefine'
import { BaseRsp, PlayerInfoRsp } from '../../proto/ProtoPackage'
import { Player } from '../game/player'
import { GameMgr } from './GameMgr'
import { RetCode } from './ErrorCode'

export class BaseHandler {
  public app: Application
  public uid: string
  public player: Player
  // public playerInfo: PlayerInfo
  public playerMgr: PlayerMgr



  constructor(app: Application) {
    GameMgr.init(app);
  }


  public async loadPlayer(msg: any, session: BackendSession): Promise<boolean> {
    Log.log('handler msg:', msg, session.frontendId)
    
    this.uid = await session.get('uid');
    this.player = await PlayerMgr.loadPlayer(this.uid);
    if(this.player==null)return false; //直接报错！

    return true;
  }


  public async response(rsp: BaseRsp = null) {
    let ret = await this.player.saveData();
    if (ret != null) {
      return this.onError('save playerInfo error. uid=' + this.uid)
    }

    if (rsp == null) {
      let rsp1: PlayerInfoRsp = new PlayerInfoRsp()
      rsp1.playerInfo = this.player.playerInfo;
      rsp1.timestamp = Date.now();;
      return rsp1;
    } else {
      return rsp;
    }
  }

  
  
  public async onErrorCode(code: number = RetCode.FAIL) {
    let rsp: BaseRsp = new BaseRsp()
    rsp.code = code;
    return rsp;
  }

  public async onError(msg: string = '', code: number = RetCode.FAIL) {
    let rsp: BaseRsp = new BaseRsp()
    rsp.code = code
    rsp.msg = msg
    return rsp
  }

}
