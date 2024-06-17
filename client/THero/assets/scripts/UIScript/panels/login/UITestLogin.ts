import Constants, { SceneName } from "../../../Constant";
import { _decorator, EditBox, sys, Node, Label, native, } from "cc";
import { UIManager, FormType, UIBase, ButtonPlus, bindComp, EventCenter } from "../../../UIFrame/indexFrame";
import { Ext, HttpNet, NativeMgr } from "../../../utils/indexUtils";
import Common from "../../../utils/common";
import SeverConfig, { SERVER_OPT } from "../../../SeverConfig";
import { GameRoot, ONlineState } from "../../../manager/GameRoot";
import Redux from "../../../redux";
import State from "../../../redux/state";
import { MainScene } from "../../../scene/MainScene";
import UserModel from "../../../model/UserModel";
import { RoleEnterGameReq } from "../../../utils/pomelo/ProtoPackage";
import SoundMgr from "../../../UIFrame/SoundMgr";
import { SOUND_RES } from "../../../config/basecfg";
const { ccclass } = _decorator;
@ccclass
export default class UITestLogin extends UIBase {
    formType = FormType.Screen;
    canDestory = false;
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
        this.btn_start.addClick(this.onBtnStart, this)
    }
    async onBtnStart() {
        if (this.accEdit.string != "") {
            this.startGame();
        } else {
            UIManager.showToast("请输入账号")
        }
    }

    async startGame() {
        if (GameRoot.Instance.onlineState == ONlineState.online) {
            console.log("this.accEdit.string=" + this.accEdit.string)
            let token = this.accEdit.string
            let userName = "play"+token
            let userImgUri = ""
            let platFormType = 1
            UserModel.login(token,userName,userImgUri,platFormType)
        }else{
            UserModel.testLogin()
        }
    }

    async initAccout() {

    }

    async onShow() {
        SoundMgr.inst.playMusic(SOUND_RES.MAIN);
        //检测是否有账号
        let token = localStorage.getItem("THeroToken")
        if(token){
            this.accPanel.active = false;
            UIManager.showWaiting("登陆中")
            await Common.sleep(1000)
            UserModel.silenceLogin()
        }else{
            this.accPanel.active = true;
            this.initView()
        }
    }

    //查找是否有保存在内存中的值
    checkAddr() {

    }

    async initView() {
        this.checkAddr();
        this.initAccout();
    }

    onHide() {
        console.log('onHide');
    }

    onDestroy() {
        console.log('destory');
        // 这里可以执行你的销毁操作, 在该窗体执行destory时, 会先调用onDestory方法
    }
}