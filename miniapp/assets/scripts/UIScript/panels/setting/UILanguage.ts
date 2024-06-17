
import { EditBox, Label, ToggleContainer, _decorator } from "cc";
import { ButtonPlus, EventCenter, FormType, ModalOpacity, UIBase, bindComp } from "../../../UIFrame/indexFrame";
import { MaskType } from "../../../UIFrame/UIBase";
import Ext from "../../../utils/exts";
import Common from "../../../utils/common";
import { LangTxt } from "../../../config/basecfg";
import UserModel from "../../../model/UserModel";
import { SysSettingType } from "../../../utils/pomelo/DataDefine";

const { ccclass } = _decorator;

@ccclass
export default class UILanguage extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, false);
    static prefabPath = "setting/UILanguage";
    @bindComp("cc.ToggleContainer")
    lanBtns: ToggleContainer

    // 确认
    @bindComp('ButtonPlus')
    btn_confirm: ButtonPlus;
    @bindComp('ButtonPlus')
    btn_close: ButtonPlus;

    private selectIdx = 0
    private curLanIdx = 0

    public onInit(): void {
        this.initEvent();
    }

    start() {
        this.lanBtns.toggleItems.forEach(element => {
            if (element.node.name == this.curLanIdx + "") {
                element.isChecked = true
            }
        });
    }

    onShow() {
        this.initState();
    }

    // 初始化事件
    initEvent() {
        // 提交
        this.btn_confirm.addClick(this.submit, this);
        this.btn_close.addClick(this.onBtnClose, this);
        this.lanBtns.node.children.forEach(element => {
            element.on("toggle", this.radioButtonClicked, this)
        });
    }

    radioButtonClicked(toggle) {
        if(!toggle.isChecked){
            return
        }
        let newType = parseInt(toggle.node.name)
        if (this.selectIdx == newType) {
            return
        }
        this.selectIdx = newType;
    }

    // 初始化状态"
    initState() {
        let toLang = Ext.i18n._language
        console.log(LangTxt)
        let lanArr = Object.keys(LangTxt)
        console.log(lanArr)
        let idx = 0
        lanArr.forEach(element => {
            if(element == toLang){
                this.curLanIdx = idx
            }
            idx++
        });
        this.lanBtns.node.children.forEach(element => {
            element.active = false
        });
        let lanTxtArr = Object.values(LangTxt)
        idx = 0
        lanTxtArr.forEach(element => {
            let node = this.lanBtns.node.children[idx]
            if(node){
                node.active = true
                let lb = node.children[1].getComponent(Label)
                lb.string = element+ ""
            }
            idx++
        });
    }

    // 提交
    async submit() {
        if (this.curLanIdx != this.selectIdx) {
            UserModel.changeLang(this.selectIdx)
            UserModel.setSysSetting(SysSettingType.Lang,this.selectIdx)
        }
        this.closeUIForm()
    }

    onBtnClose(){
        this.closeUIForm()
    }
}
