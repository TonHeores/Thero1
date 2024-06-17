import { Application, BackendSession } from 'pinus'
import { BaseHandler } from '../../../comm/BaseHandler'
import { GmExeGmCmdReq, GmExeGmCmdRsp } from '../../../../proto/ProtoPackage'
import Log from '../../../utils/log'

class GMHanlder extends BaseHandler {
	async exeCmd(req: GmExeGmCmdReq, session: BackendSession) {
		//初始化
		if ((await this.loadPlayer(req, session)) == false) return this.onError()

		Log.info('exeCmd playerInfo: ', this.player.playerInfo)

		const { playerInfo } = this.player
		const { cmd, pars } = req
		let stdCmd = cmd.toLowerCase();
		Log.info('params: ', cmd, pars)
		switch (stdCmd) {
			//增加玩家经验
			//格式：addexp 10000
			case 'addexp': {
				let exp = parseInt(pars[0])
				this.player.addExp(exp)
				break
			}

			//增加资源道具的数量（包括金币）
			//格式  addItem 2 300
			case 'additem': {
				let itemType = parseInt(pars[0])
				let count = parseInt(pars[1])

				playerInfo.items[itemType] += count
				break
			}

			//设置玩家等级
			//格式  setLevel 30
			case 'setlv': 
			case 'setlevel': {
					let lv = parseInt(pars[0])
				playerInfo.lv = lv
				break
			}

			//设置宝箱等级
			//格式  setLevel 30
			case 'setchestlv': {
				let lv = parseInt(pars[0])
				playerInfo.chestLevel = lv
				break
			}

			//设置关卡Lv
			//格式  setMatchLv 34
			case 'setmatchlv': {
				let matchId = parseInt(pars[0])
				playerInfo.curMatchLv = matchId
				break
			}
		}

		//返回，推送playerInfo包
		let rsp: GmExeGmCmdRsp = new GmExeGmCmdRsp()
		rsp.playerInfo = playerInfo
		return this.response(rsp)
	}
}

export default (app: Application) => {
	return new GMHanlder(app)
}
