import { ConfigMgr } from "./ConfigMgr";


export enum RetCode{
    OK = 0,
    FAIL = -1,
}



export class ErrorCode{

    public static _ins:ErrorCode = null;
    public  _keyCodeMap:Map<string,number> = new Map();


    public static ins():ErrorCode{
        if(ErrorCode._ins ==null){
            ErrorCode._ins = new ErrorCode();
            ErrorCode._ins._init();
        }
        return ErrorCode._ins;
    }

    public _init(){
        let cfgSet = ConfigMgr.getSet("ErrorCode");
        cfgSet.forEach( (key,code)=>{
            this._keyCodeMap[key]=code;
        });
    }
            

    public static getCode(key:string):number{
        return ErrorCode.ins()._keyCodeMap[key];
    }
}