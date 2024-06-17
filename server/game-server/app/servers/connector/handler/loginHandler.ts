import { Application, BackendSession, FrontendSession } from 'pinus'
import PlayerMgr from '../../../comm/PlayerMgr'
import Log from '../../../utils/log'
import { BaseRsp, PlayerInfoRsp, RoleChangeGenderReq, RoleChangeNameReq, RoleEnterGameReq, RoleEnterGameRsp, RoleUpdateDataReq, RoleUpdateDataRsp } from '../../../../proto/ProtoPackage'
import { PlayerInfo } from '../../../../proto/DataDefine'
import { Player } from '../../../game/player'
import { BaseHandler } from '../../../comm/BaseHandler'
import { GameMgr } from '../../../comm/GameMgr'
import { RetCode } from '../../../comm/ErrorCode'
import { Token } from '../../../game/token'
import { PlatFormType } from '../../../../proto/ConstDefine'

class LoginHandler extends BaseHandler {


  async enterGame(req: RoleEnterGameReq, session: FrontendSession) {
    Log.log('connector enterGame',req, session.frontendId)

    const { token } = req;
    if (!token) return this.onError("invalid request: empty token");
  
    //解析token
    let authObj = null
    if(req.platFormType == PlatFormType.H5){
      authObj = Token.auth_H5(token);
    }else if(req.platFormType == PlatFormType.TG){
      authObj = Token.auth_Telegram(token);
    }
    const {ret,info,timestamp} = authObj;
    // const {ret,info,timestamp} = Token.auth_Telegram(token);
    const {uid} = info;
    
    if (ret<0) {
      this.onError("entyHandler.entry token error!uid="+uid); 
      return {code:ret};
    }

    //过期校验
    if (!Token.checkExpire(timestamp)) {
      // Log.logError('Token expired') //这个不用log
      return  {code:-2};
    }


    try {

      Log.info('start to get user info for', uid)
      let player:Player = await PlayerMgr.loadPlayer(uid)
      if (player) {
        Log.info('Directly get info from db', player.playerInfo);

        //完成，先绑定session
        await this.bindSession(session, uid, player.playerInfo);
        
        //返回包
        let rsp:RoleEnterGameRsp = new RoleEnterGameRsp;
        rsp.playerInfo = player.playerInfo;
        rsp.timestamp = Date.now();
        return rsp;

      }

      //新用户
      Log.info(uid, 'no user, need to create!')
      const[retCode,newplayer] = await PlayerMgr.createPlayer(uid,req);
      if(retCode<0 || newplayer==null){
        return this.onError("createPlayer ERROR,uid="+uid+", code="+retCode);
      }


      //完成，先绑定session
      Log.info(uid, 'we have finished to craete new player', newplayer.playerInfo)
      await this.bindSession(session, uid, newplayer.playerInfo);

      //返回包
      let rsp:RoleEnterGameRsp = new RoleEnterGameRsp;
      rsp.playerInfo = newplayer.playerInfo;
      rsp.timestamp = Date.now();
      return rsp;

    }catch (err) {
      return this.onError(err.message??'');
    }

  }



  /////////////////////////////////////////////////////
 
  /////////////////////////////////////////////////////
 
  private async bindSession(session: FrontendSession, uid: string, playerInfo: PlayerInfo) {
    try {
      session.set('uid', uid)

      await session.abind(uid)
      await session.apush('uid')

      Log.info('Bind uid: ', uid)
    } catch (e) {
      console.log('bind error', e)
    }
  }


}

export default (app: Application) => {
  return new LoginHandler(app)
}
