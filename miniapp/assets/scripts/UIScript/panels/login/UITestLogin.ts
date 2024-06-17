import Constants, { EventName, SceneName } from "../../../Constant";
import { _decorator, EditBox, sys, Node, Label, native, } from "cc";
import { UIManager, FormType, UIBase, ButtonPlus, bindComp, EventCenter } from "../../../UIFrame/indexFrame";
import { GameRoot, ONlineState } from "../../../manager/GameRoot";
import PlatformMgr from "../../../platform/PlatformMgr";
const { ccclass } = _decorator;
@ccclass
export default class UITestLogin extends UIBase {
    formType = FormType.Screen;
    canDestory = true;
    // static canRecall = true;
    static prefabPath = "login/UITestLogin";
    @bindComp("ButtonPlus")
    public btn_start: ButtonPlus = null;
    @bindComp("cc.Node")
    public accPanel: Node = null;
    @bindComp("cc.EditBox")
    public accEdit: EditBox = null;
    @bindComp("cc.Node")
    public logo: Node = null;
    onInit() {
        this.listEvent()
    }

    listEvent(){
        this.btn_start.addClick(this.onBtnStart, this)
        EventCenter.on(EventName.OnConnected, this.onConnected, this);
    }

    removeEvent(){
        EventCenter.off(EventName.OnConnected, this.onConnected, this);
    }

    async onConnected(params) {
        console.log("onConnected")
        PlatformMgr.getCurPlatForm().login()
    }

    async onBtnStart() {
        if (this.accEdit.string != "") {
            PlatformMgr.getCurPlatForm().setToken(this.accEdit.string)
            PlatformMgr.getCurPlatForm().login()
        } else {
            UIManager.showToast("Input your account")
        }
    }

    async onShow() {
        this.accPanel.active = false;
        if(!PlatformMgr.getCurPlatForm().login()){
            this.accPanel.active = true;
        }
    }

    onHide() {
        console.log('onHide');
        this.removeEvent()
    }

    onDestroy() {
        console.log('destory');
        // 这里可以执行你的销毁操作, 在该窗体执行destory时, 会先调用onDestory方法
    }
}
