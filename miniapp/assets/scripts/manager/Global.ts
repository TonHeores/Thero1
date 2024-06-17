import { _decorator, Component, Game, game, Input, input, KeyCode } from "cc";
import { EventCenter } from "../UIFrame/EventCenter";
import Redux from "../redux";
import State from "../redux/state";
import Constants, { EventName, SERVER_Evn } from "../Constant";
import { UIManager } from "../UIFrame/indexFrame";
import FightUtil from "../../battle/FightUtil";
import Common from "../utils/common";
import { EnumUtils } from "../UIFrame/Common/Utils/EnumUtils";
import  AttrType  from "../utils/EnumeDefine";
import UserModel from "../model/UserModel";
import { PomeloMgr } from "../utils/pomelo/PomeloMgr";
const { ccclass } = _decorator;

@ccclass("Global")
export class Global extends Component {

	onLoad () {
        this.listenEvent();
        this.addGlobalFun()
	}

    listenEvent(){
        input.on(Input.EventType.KEY_DOWN, this.inputEvent, this);
        EventCenter.on(EventName.StartFight,this.startFight,this)
        game.on(Game.EVENT_HIDE, this.onGameHIde,this);
        game.on(Game.EVENT_SHOW, this.onGameShow,this);
    }

    onGameHIde(){
      console.log("游戏进入后台")
    }

    onGameShow(){
      console.log("游戏重新返回游戏")
      console.log("PomeloMgr.instance===",PomeloMgr.instance)
      //检测是否需要重连
      if(PomeloMgr.instance){
        let netIsConnected = PomeloMgr.instance.netIsConnected()
        console.log("netIsConnected ==========="+netIsConnected)
        if(!netIsConnected){
          // PomeloMgr.instance.reconnect()
        }
      }
    }

    startFight(){
        Constants.gamePetAniType = 2
        UIManager.openView(Constants.Panels.UIFight);
    }
    
    inputEvent(event){
        switch(event.type) {
            case Input.EventType.KEY_DOWN:
                this.onKeyBoardClick(event.keyCode)
                break;
        }
    }

    onKeyBoardClick(keyCode){
        console.log("onKeyBoardClick keyCode="+keyCode)
        if(Constants.Evn != SERVER_Evn.product){
            switch(keyCode){
                case KeyCode.KEY_G:
                    if(UIManager.getInstance().checkUIFormIsShowingByPanel(Constants.Panels.UITest)){
                        UIManager.closeView(Constants.Panels.UITest)
                    }else{
                        UIManager.openView(Constants.Panels.UITest)
                    }
                break;
            }
        }
    }

    addGlobalFun(){
        window["testFight"] = ()=>{
            FightUtil.startFight()
            EventCenter.emit(EventName.StartFight)
        }
        window["changeLang"] = (idx)=>{
            let arr = ["zh_CN", "zh_TW","en", "kr", "es", "de",  "jp", "fr", "ru"];
            Common.changeLang(arr[idx]);
        }
        window["showTest"] = ()=>{
            // UIManager.openView(Constants.Panels.UITest);
            UIManager.openView(Constants.Panels.UIEffect,{type:4});
        }
    }
}