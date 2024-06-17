import { Application, BackendSession} from 'pinus'
import PlayerMgr from '../../../comm/PlayerMgr'
import { RoleChangeGenderReq, RoleChangeNameReq,  RoleUpdateDataReq} from '../../../../proto/ProtoPackage'
import { BaseHandler } from '../../../comm/BaseHandler'

 class RoleHandler extends BaseHandler {


  async updateData(req: RoleUpdateDataReq, session: BackendSession) {
    //初始化loadPlayer
    if ((await this.loadPlayer(req, session)) == false) return this.onError()
    //返回包
    return await this.response();
  }


  
  //用户修改姓名
  async changeName(req: RoleChangeNameReq, session: BackendSession) {
    //初始化loadPlayer
    if ((await this.loadPlayer(req, session)) == false) return this.onError()

    //用户改名
    let ret:number = await PlayerMgr.changePlayerName(this.player,req.name);
    if(ret<0)return this.onError("RoleChangeNameReq error,ret="+ret);
    
    //返回包
    return await this.response();
  }


  
  //用户修改性别
  async changeGender(req: RoleChangeGenderReq, session: BackendSession) {
  //初始化loadPlayer
  if ((await this.loadPlayer(req, session)) == false) return this.onError()

    //用户改名
    let ret:number = await PlayerMgr.changePlayerGender(this.player,req.gender);
    if(ret<0)return this.onError("RoleChangeNameReq error,ret="+ret);
    
    //返回包
    return await this.response();
  }


}

export default (app: Application) => {
  return new RoleHandler(app)
}
