
import { _decorator, sys, log } from "cc";
import { PlayerInfo } from "./pomelo/DataDefine";
import State from "../redux/state";
import Redux from "../redux";
import { CHECK_KEY } from "../config/basecfg";
import { EnumUtils } from "../UIFrame/Common/Utils/EnumUtils";
import { ConfigHelper } from "./ConfigHelper";
export default class GameUtils {
    static expNeedDic = {}

    //检测记住选项是否过期 每天下午4时后过期
    static checkRemeberExpire(key) {
        let lastTimeStr = sys.localStorage.getItem(key + "_check")
        if (lastTimeStr == null) {
            return true
        } else {
            //如果现在过了下午四时且记录的时间是四时前
            let nowDate = new Date()
            let nowHour = nowDate.getHours()
            let lastTime = parseInt(lastTimeStr)
            console.log("nowHour=" + nowHour)
            //算出上次刷新时间戳
            let DateStr = nowDate.getUTCFullYear() + "-" + (nowDate.getUTCMonth() + 1) + "-" + nowDate.getUTCDate() + " 16:00:00"
            let time = new Date(DateStr).getTime()
            console.log("lastTime=" + lastTime + "time=" + time + " DateStr=" + DateStr)
            if (nowHour < 16) {
                //现在时间是第二天16点前，所以要算出前一天的16点的时间戳
                time = time - 86400000
            }
            console.log("lastTime2=" + lastTime + "time=" + time)
            if (lastTime < time) {
                //在上次刷新时间戳前都视为过期
                return true
            }
        }
        return false
    }

    //检测记住选项是否生效
    static checkRemeberIsValid(key) {
        let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
        let saveKey = key + "_check_"+accInfo.uid
        let value = sys.localStorage.getItem(saveKey)
        console.log("value===="+value)
        if (value == null) {
            return false
        } 
        return true
    }

    static saveCheckRemenber(key){
        let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
        let saveKey = key + "_check_"+accInfo.uid
        sys.localStorage.setItem(saveKey,1)
    }

    static delCheckRemenber(key){
        let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
        let saveKey = key + "_check_"+accInfo.uid
        sys.localStorage.removeItem(saveKey)
    }

    static resetAllCheckremenber(){
        let keys = EnumUtils.getValues(CHECK_KEY)
        console.log("keys=====",keys)
        keys.forEach(key => {
            this.delCheckRemenber(key)
        });
    }
    
    static getUserNeedExp(lv){
        if(this.expNeedDic[1] == null){
            //初始化
            let set = Object.values(ConfigHelper.getCfgSet("RoleLevelCfg")) 
            let allExp = 0
            set.forEach(element => {
                let lv = element["lv"]
                allExp += element["exp"]
                this.expNeedDic[lv] = allExp
            });
            this.expNeedDic[0] = 0
        }
        return this.expNeedDic[lv]
    }
}