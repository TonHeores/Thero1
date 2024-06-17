
import { EventCenter } from "../UIFrame/EventCenter";
import UIManager from "../UIFrame/UIManager";
import { _decorator,sys,log} from "cc";
// const i18n = require('LanguageData');

/** 原生交互的方法 */
export enum NativeMethod {
    getServeOpt, //获取当前服务器类型
    getNativeLang, //获取原生native语言
    jumpAPP, //跳转momoAPP
    getVersion, //获取apk版本
    updateApk, //更新APk
    login, //bsc钱包登录
}
/**
 * 与原生的通讯类
 */
export default class NativeMgr {
    private static instance: NativeMgr = null;
    public static get inst() {
        if(this.instance === null) {
            this.instance = new NativeMgr();
        }
        return this.instance;
    }
   
    public static getNativeLang(){
		let lang = "en";
		if(sys.isNative){
            lang = NativeMgr.commonMethod(NativeMethod.getNativeLang)
		}
		return lang;
	}

    public static getServeOpt(){
		let lang = "";
		if(sys.isNative){
            lang = NativeMgr.commonMethod(NativeMethod.getServeOpt)
		}
		return lang;
	}

    //param 是一个字典型的字符串
    public static commonMethod(method:NativeMethod,param={}){
        let methodName = NativeMethod[method];
        let result = ""
        // let json = JSON.stringify(param)
        // if(sys.os == sys.OS.IOS){
        //     result = jsb.reflection.callStaticMethod("AppController", methodName+":", json);
        // }else{
        //     result = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", methodName, "(Ljava/lang/String;)Ljava/lang/String;",json);
        // }
        // if(result=="no activity"){
        //     // UIManager.showToast(i18n.t("Login_18"))
        // }
        return result;
    }

    public static nativeCall(data){
       console.log("nativeCall5555555555555555555555555data=")
        let jsData = null
        if(sys.OS.ANDROID == sys.os){
           console.log(data)
            jsData = JSON.parse(data)
        }else if(sys.OS.IOS == sys.os){
           console.log(JSON.stringify(data))
            jsData = data
        }
        let method = jsData["method"];
        let cData = jsData["data"]
       console.log("method="+method+" cData="+cData)
        if(method == "upApkPro"){//
        }else if(method == "LoginToken"){
        }
    }
}

// ["NativeMgr"] = NativeMgr