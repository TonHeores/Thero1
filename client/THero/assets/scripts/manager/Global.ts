import { _decorator, Component, Input, input, KeyCode } from "cc";
import { EventCenter } from "../UIFrame/EventCenter";
import Redux from "../redux";
import State from "../redux/state";
import Constants, { EventName } from "../Constant";
import { UIManager } from "../UIFrame/indexFrame";
import FightUtil from "../../battle/FightUtil";
import Common from "../utils/common";
import { EnumUtils } from "../UIFrame/Common/Utils/EnumUtils";
import  AttrType  from "../utils/EnumeDefine";
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
        switch(keyCode){
            case KeyCode.KEY_G:
                if(UIManager.getInstance().checkUIFormIsShowingByPanel(Constants.Panels.UIGM)){
                    UIManager.closeView(Constants.Panels.UIGM)
                }else{
                    UIManager.openView(Constants.Panels.UIGM)
                }
            break;
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
        window["testEnum"] = ()=>{
           let a =  EnumUtils.getNames(AttrType)
           console.log(a)
           let b = Object.keys(AttrType)
           console.log(b)
        }
    }
}