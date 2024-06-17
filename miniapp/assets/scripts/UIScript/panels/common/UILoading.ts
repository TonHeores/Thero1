import { _decorator, Label, ProgressBar, RichText } from "cc";
import { UIManager, FormType, UIBase, ButtonPlus, bindComp, EventCenter } from "../../../UIFrame/indexFrame";
import Common from "../../../utils/common";
import { GameRoot } from "../../../manager/GameRoot";
import { LoginScene } from "../../../scene/LoginScene";
import Constants, { SceneName } from "../../../Constant";
// const i18n = require('LanguageData');

const { ccclass, property } = _decorator;

@ccclass
export default class UILoading extends UIBase {
    formType = FormType.Screen;

    canDestory = true;
    static prefabPath = "loading/UILoading";

    @bindComp("cc.ProgressBar")
    proBar: ProgressBar
    @bindComp("cc.Label")
    perStr: Label;
    @bindComp("cc.Label")
    version: Label;

    @bindComp("cc.RichText")
    tips: RichText;

    tipArr = []
    showIdx = 1;
    private t1 = null as any;
    private data = null
    private total = 0
    private loaded = 0

    /** 下面表示 生命周期顺序 */
    async load() {
    }

    async onShow(param) {
        console.log("UILoading onshow", param)
        this.data = param
        this.listenEvents()
        this.startLoading()
        this.loadAssets()
        this.version.string = Constants.version
    }

    reset() {
    }

    listenEvents() {
        // EventCenter.on(EventName.loadScenePro,this.loadScenePro,this)
    }

    removeListenEvents() {
        // EventCenter.off(EventName.loadScenePro,this.loadScenePro,this)
    }

    async startLoading() {
        this.showTxtAni()
        this.resetProBar()
    }

    onLoad() {
        console.log('onload');
    }

    private gotoScene() {
        if (UIManager.curScene == null) {
            GameRoot.Instance.LoadScene(SceneName.Login, LoginScene,this.loadSecondScene);
        }
    }

    loadSecondScene(){
        const arr = Constants.SecendPanel
        
        arr.forEach(element => {
            UIManager.getInstance().loadUIForm(element, false);
        });
    }

    private showTxtAni() {
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

    // 加载资源
    async loadAssets() {
        this.resetProBar();

        // const arr = Object.values(Constants.Panels);
        const arr = Constants.PreLoadPanel
        this.total = arr.length;
        this.loaded = 0

        arr.forEach(element => {
            this.loadPanel(element)
        });
    }

    async loadPanel(panelCls){
        await UIManager.getInstance().loadUIForm(panelCls, false);
        let path = panelCls.prefabPath
        console.log("path="+path)
        this.loaded++
        this.setProBar(this.loaded/this.total)
    }

    timeFun() {
        let num = this.showIdx
        while (this.showIdx == num) {
            num = Math.floor(Common.randomNum(1, 13))
        }
        this.showIdx = num
        this.tips.string = "<outline color=black width=3><b>" + this.tipArr[num] + "</b></outline>"
        clearTimeout(this.t1)
        this.t1 = null
        if (this.t1 == null) {
            let time = this.tipArr[num].length * 100
            if (time < 3000) {
                time = 3000
            }
            this.t1 = setTimeout(this.timeFun.bind(this), time)
        }
    }

    stopCoutnDown() {
        if (this.t1) clearInterval(this.t1)
        this.t1 = null
    }

    loadScenePro(pro) {
        // console.log("loadScenePro============= pro="+pro)
        this.setProBar(pro);
    }

    resetProBar() {
        this.proBar.progress = 0
        this.perStr.string = "0%"
        // this.icon.position =  new Vec3(0,this.icon.position.y,this.icon.position.z)
    }

    setProBar(per) {
        this.proBar.progress = per
        this.perStr.string = per.toFixed(2)*100+"%"
        if(per == 1){
            this.gotoScene()
        }
        // this.icon.position =  new Vec3(this.proBar.node.getComponent(UITransform).contentSize.width*per,this.icon.position.y,this.icon.position.z)
    }

    onHide() {
        this.removeListenEvents()
    }

    onDestroy() {
        console.log('destory');
        this.data = null
        // 这里可以执行你的销毁操作, 在该窗体执行destory时, 会先调用onDestory方法
        this.stopCoutnDown()
    }
}