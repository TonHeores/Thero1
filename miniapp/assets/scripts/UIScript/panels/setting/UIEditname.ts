
import { EditBox, _decorator } from "cc";
import { ButtonPlus, EventCenter, FormType, ModalOpacity, UIBase, UIManager, bindComp } from "../../../UIFrame/indexFrame";
import { MaskType } from "../../../UIFrame/UIBase";
import Redux from "../../../redux";
import UserModel from "../../../model/UserModel";
import { EventName } from "../../../Constant";
import Ext from "../../../utils/exts";

const { ccclass } = _decorator;

@ccclass
export default class UIEditname extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, true);
    static prefabPath = "setting/UIEditname";
    
    @bindComp("cc.EditBox")
    public accEdit: EditBox = null;

    // 确认
    @bindComp('ButtonPlus')
    btn_confirm: ButtonPlus;

    // 用户信息
    userInfo: any;
    
    public onInit(): void {
        this.initEvent();
    }

    onShow() {
        this.initState();
    }

    // 初始化事件
    initEvent() {
        // 提交
        this.btn_confirm.addClick(this.submit, this);
        EventCenter.on(EventName.EditNameSucc,this.EditNameSucc,this)
    }

    // 初始化状态"
    initState() {
        this.userInfo = Redux.State.getState(Redux.ReduxName.user, "accInfo");
        this.accEdit.string = this.userInfo.name;
        this.accEdit.node.on("text-changed", this.inputChange, this);
    }

    // 输入框变化
    inputChange() {
        this.accEdit.string = this.accEdit.string.replace(/[^A-Za-z0-9]/g, '');
        this.accEdit.focus();
    }

    EditNameSucc(){
        UIManager.showToast(Ext.i18n.t("UI_Toasts_01_001"))
        this.closeUIForm()
    }

    // 提交
    async submit() {
        if(this.accEdit.string == ""){
            return ;
        }
        if (this.accEdit.string != this.userInfo.name) {
            UserModel.roleChangeName(this.accEdit.string);
        }
        else{
            this.closeUIForm()
        }
    }
}
