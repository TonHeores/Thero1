import UIManager from "../../UIFrame/UIManager";
import { UIMainMenu } from "../../UIScript/indexPrefab";
import UserModel from "../../model/UserModel";
import { RetCode } from "./GCode";


export default class PomeloUtil {


    static checkRsp(rsp) {
        if(rsp["timestamp"]){ //有就更新本地时间戳
            UserModel.changeTs(rsp["timestamp"])
        }
        if(rsp.code==RetCode.OK){
            return true
        }else{
            //提示失败
            UIManager.showToast("请求失败 code="+rsp.code)
        }
    }

    
}