
import { ToggleContainer, _decorator } from "cc";
import { ButtonPlus, EventCenter, FormType, ModalOpacity, UIBase, UIManager, bindComp } from "../../../UIFrame/indexFrame";
import { MaskType } from "../../../UIFrame/UIBase";
import Redux from "../../../redux";
import UserModel from "../../../model/UserModel";
import { EventName } from "../../../Constant";
import State from "../../../redux/state";
import { PlayerInfo } from "../../../utils/pomelo/DataDefine";

const { ccclass } = _decorator;

@ccclass
export default class UIEditGender extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, false);
    static prefabPath = "popup/UIEditGender";
    @bindComp("cc.ToggleContainer")
    genderBtns: ToggleContainer

    // 确认
    @bindComp('ButtonPlus')
    btn_confirm: ButtonPlus;
    private selectType = 1 //

    onLoad() {
        this.listenEvent();
    }

    start() {
        this.genderBtns.toggleItems.forEach(element => {
            if (element.node.name == this.selectType + "") {
                element.isChecked = true
            }
        });
    }

    onShow() {
        let accInfo:PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
        this.selectType = 1
        if(accInfo.gender){
            this.selectType = accInfo.gender
            console.log("selectType ==="+this.selectType)
        }
    }

    // 初始化事件
    listenEvent() {
        // 提交
        this.btn_confirm.addClick(this.submit, this);
        this.genderBtns.node.children.forEach(element => {
            element.on("toggle", this.radioButtonClicked, this)
        });
    }

    radioButtonClicked(toggle) {
        if(!toggle.isChecked){
            return
        }
        let newType = parseInt(toggle.node.name)
        if (this.selectType == newType) {
            return
        }
        this.selectType = newType;
    }

    // 提交
    async submit() {
        let accInfo:PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
        let gender = 0
        if(accInfo.gender){
            gender = accInfo.gender
        }
        if(gender != this.selectType){
            UserModel.roleChangeGender(this.selectType);
        }
        this.closeUIForm()
        // if(this.accEdit.string == ""){
        //     return ;
        // }
        // if (this.accEdit.string != this.userInfo.name) {
        //     UserModel.roleChangeName(this.accEdit.string);
        // }
        // else{
        //     this.closeUIForm()
        // }
    }
}
