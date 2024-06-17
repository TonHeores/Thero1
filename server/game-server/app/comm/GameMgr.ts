import { Application } from "pinus"
import PlayerMgr from "./PlayerMgr";
import Log from "../utils/log";



export enum Services {
    PlayerMgr = 'PlayerMgr',
    GameSetting = 'GameSetting',
    DatabaseService = 'DatabaseService',
    PlayerSyncMgr = 'PlayerSyncMgr',
    PlayerMsgService = 'PlayerMsgService'
}


export class GameMgr {

    public static app:Application;


    public static init(app:Application){
        GameMgr.app = app;
    }


    public getService(serviceName):any{
       return GameMgr.app.get(serviceName);
    }

    
}