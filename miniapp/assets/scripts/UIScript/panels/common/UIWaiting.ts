import {FormType,UIBase, bindComp} from "../../../UIFrame/indexFrame";
import { _decorator, instantiate, Label, Toggle, Node, log, Widget,RichText,Asset, loader,tween } from "cc";
const {ccclass, property} = _decorator;

@ccclass
export default class UIWaiting extends UIBase {
    
    formType = FormType.TopTips;
    static prefabPath = "common/UIWaiting";
    canRemove = false
    @bindComp("cc.Node")
    icon: Node = null;
    @bindComp("cc.Label")
    tip: Label = null;
    
	private t1 = null as any; 
    
    private tipTxt = ""
    start () {

    }

    onShow(params) {
        this.tipTxt = params.tip
        this.tip.string = this.tipTxt
        this.showAnim()
        if(this.tipTxt!=""){
            this.startCountDonw()
        }
    }
    

    public showAnim() {
        tween(this.icon).by(1, {angle:-360})
        .repeatForever()
        .start();
    }

    stopAni(){
        if(this.icon){
            tween(this.icon).stop()
            this.icon.angle = 0;
        }
    }

    private startCountDonw(){
        if(this.t1 == null){
            this.t1 = setInterval(this.countTimeFun.bind(this), 1000)
        }
    }

    countTimeFun(){
        if(this.tip){
            this.tip.string = this.tip.string + "."
            if(this.tip.string.endsWith("...")){
                this.tip.string = this.tipTxt
            }
        }
	}

    stopCoutnDown(){
		if(this.t1) clearInterval(this.t1)
        this.t1 = null
    }

    onHide(){
        this.stopAni()
        this.stopCoutnDown()
    }

    onDestroy(){
        console.log("uiwaiting destroy")
    }
}
