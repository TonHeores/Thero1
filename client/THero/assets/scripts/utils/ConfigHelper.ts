import { GameRoot } from "../manager/GameRoot"


//配置数据
export class HeroSet{
    public HeroId:number
    public HeroName:string
    public CampId:number
    public HeroStar:number
    public InitAttack:number
    public InitDefense:number	
    public  InitWisdom:number	
    public InitSpeed:number	
    public AttackInc:number	
    public DefenseInc:number	
    public WisdomInc:number	
    public SpeedInc:number	
    public ArmyId:number	
    public SkillId:number	
    public CarrySkillId:number	
    public HeroDesc:string

}

export class ConfigHelper {
    
    //游戏玩法配置
    private _config:object=null;

    //加速道具的搜索
    private _itemSet:object=null;
    //帮助类
    static mInstance:ConfigHelper=null;

    static getInstance(){
        if(this.mInstance == null){
            this.mInstance = new ConfigHelper();
        }
        return this.mInstance
    }

    static initConfig(configData){
        this.getInstance().initConfig(configData);
    }

    initConfig(configData):void{
        let self = this;
        if(!this._config){
            //配置文件game_config.json的数据
            // let configData:object=GameRoot.Instance.getConfig();
            //组装数据
            let afterData:object={}
            for(let key in configData){
                let sourceData=configData[key]
                let titleData=sourceData["t"]
                let cdata=sourceData["d"];
                let mergeData={}
                for(let i=0;i<cdata.length;i++){
                    let curData=cdata[i];
                    let rowData={}
                    let rowDataKey=curData[0]
                    for(let j=0;j<curData.length;j++){
                        rowData[titleData[j]]=curData[j]
                    }
                    mergeData[rowDataKey]=rowData;
                }
                afterData[key]=mergeData
            }
            this._config=afterData
        }
    }   

    public static getCfg(setName:string,id:number){
        return this.mInstance._config[setName][id];
    }

    public static getCfgSet(setName:string){
        return this.mInstance._config[setName];
    }

    public static getBuildSmpSet(){
        return this.mInstance._config["BuildSmplCfg"];
    }

    

    //错误码提示
    public static getErrCodeCfg(errCode){
        return this.mInstance._config["ErrCodeSet"][errCode];
    }

    public static getErrCodeStr(errCode){
        let errorConfig=this.mInstance._config["ErrCodeSet"][errCode];
        if(errorConfig){
            return errorConfig["Msg"]
        }
        return null;
    }
    //根据关键字获得错误码
    public static getErrCodeByKey(errKey:string){
        let errCodeObj = this.mInstance._config["ErrCodeSet"];
        for(let key in errCodeObj){
            let err = errCodeObj[key];
            if(err["Key"] == errKey){
                return err["Code"];
            }
        }
        return null;
    }
}