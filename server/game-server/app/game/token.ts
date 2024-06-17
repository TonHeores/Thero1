import { createCipheriv, createDecipheriv } from 'crypto'
import crc from 'crc'
import { WebAppInitData } from '../lib/telegram/Types'
// import { parseInitData } from '../lib/telegram/parseInitData'
import Log from '../utils/log'
import { GameMgr } from '../comm/GameMgr'



export class TokenInfo{
  public uid:string=null;
  public name:string=null;
  public avatar:string=null;
  public timestamp:number=0;
}



export class Token {
  constructor(private secret = 'thero') {}


  static checkExpire = function (timestamp:number) {
    //不需校验的
    if(timestamp==null || timestamp==0)return true;

    var session = GameMgr.app.get('session') || {}
    let expire = session.expire || -1

    if (expire < 0) {
      // negative expire means never expire
      return true
    }
    return Date.now() - timestamp < expire
  }







  create(uid: string, timestamp: string, pwd: string) {
    var msg = uid + '|' + timestamp
    var cipher = createCipheriv('aes256', pwd, this.secret)
    var enc = cipher.update(msg, 'utf8', 'hex')
    enc += cipher.final('hex')
    return enc
  }



  static auth_H5(token: string):any {

    console.log("auth_H5==============")
    let tokenInfo:TokenInfo=new TokenInfo;
    
    tokenInfo.uid = 'UID' + crc.crc32(token);
    

    return {
      ret: 0,
      info:TokenInfo,
      //时间戳这个还不知道在哪里找？后面要加
      timestamp:null
    }

  }



  //解析Telegram的token
  static  auth_Telegram(token: string):any {
    console.log("auth_Telegram==============")

    // const tokenData: WebAppInitData = parseInitData(token);

    // let tokenInfo:TokenInfo=new TokenInfo;

    // tokenInfo.uid = String(tokenData.user.id);
    // tokenInfo.name = tokenData.user.username;
    // tokenInfo.avatar = tokenData.user.photo_url;
    

    // return {
    //   ret: 0,
    //   info:TokenInfo,
    //   //时间戳这个还不知道在哪里找？后面要加
    //   timestamp:null
    // }
  }


}