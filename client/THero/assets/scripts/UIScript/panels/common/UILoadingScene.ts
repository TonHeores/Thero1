import Setting,{ SERVER_OPT } from "../../../SeverConfig";
import { _decorator, ProgressBar, Label, sys, Node, log, game,RichText,Asset,error, UITransform, Vec3, SkeletalAnimation, SkeletalAnimationComponent, sp, Game, CCObject } from "cc";
import  Constants, { EventName } from "../../../Constant";
import {UIManager,FormType,UIBase,ButtonPlus,bindComp, EventCenter} from "../../../UIFrame/indexFrame";
import Common from "../../../utils/common";
// const i18n = require('LanguageData');

const {ccclass,property} = _decorator;

@ccclass
export default class UILoadingScene extends UIBase {
    formType = FormType.Screen;
     
    canDestory = true;
    static prefabPath = "loading/UILoadingScene";
    
    @bindComp("cc.ProgressBar")
    proBar: ProgressBar

    @bindComp("cc.RichText")
    tips:RichText;
    
    tipArr = []
    showIdx = 1;
	private t1 = null as any; 
    private data = null

    /** 下面表示 生命周期顺序 */
    async load() {
    }

    async onShow(param) {
        console.log("UILoadingGame onshow",param)
        this.data = param 
        // EventCenter.emit(EventName.onPanelLoaded, "");
        this.listenEvents()
        this.reset()
        
        this.startLoading()
    }

    reset(){
    }

    listenEvents(){
        // EventCenter.on(EventName.loadScenePro,this.loadScenePro,this)
    }

    removeListenEvents(){
        // EventCenter.off(EventName.loadScenePro,this.loadScenePro,this)
    }

    async startLoading(){
        this.showTxtAni()
        this.resetProBar()
    }

    onLoad() {
       console.log('onload');
    }

    private gotoScene(){
    }

    private showTxtAni(){
        // for(let i=1;i<=13;i++){
        //     this.tipArr.push(i18n.t("Tips_"+i))
        // }
        // let num = Math.floor(Common.randomNum(1,13)) 
        // this.showIdx = num
        // this.tips.string = "<outline color=black width=3><b>"+this.tipArr[num]+"</b></outline>"
        // if(this.t1 == null){
        //     let time = this.tipArr[num].length*100
        //     if(time<3000){
        //         time = 3000
        //     }
        //     this.t1 = setTimeout(this.timeFun.bind(this), time)
        // }
    }

    timeFun(){
        let num = this.showIdx
        while(this.showIdx == num){
            num = Math.floor(Common.randomNum(1,13))
        }
        this.showIdx = num
        this.tips.string = "<outline color=black width=3><b>"+this.tipArr[num]+"</b></outline>"
        clearTimeout(this.t1)
        this.t1 = null
        if(this.t1 == null){
            let time = this.tipArr[num].length*100
            if(time<3000){
                time = 3000
            }
            this.t1 = setTimeout(this.timeFun.bind(this), time)
        }
	}

    stopCoutnDown(){
		if(this.t1) clearInterval(this.t1)
        this.t1 = null
    }

    loadScenePro(pro){
        // console.log("loadScenePro============= pro="+pro)
        this.setProBar(pro);
    }

    resetProBar(){
        this.proBar.progress = 0
        // this.icon.position =  new Vec3(0,this.icon.position.y,this.icon.position.z)
    }

    setProBar(per){
        this.proBar.progress = per
        // this.icon.position =  new Vec3(this.proBar.node.getComponent(UITransform).contentSize.width*per,this.icon.position.y,this.icon.position.z)
    }

    onHide(){
        this.removeListenEvents()
    }
    
    onDestroy() {
       console.log('destory');
       this.data = null
        // 这里可以执行你的销毁操作, 在该窗体执行destory时, 会先调用onDestory方法
        this.stopCoutnDown()
    }
}