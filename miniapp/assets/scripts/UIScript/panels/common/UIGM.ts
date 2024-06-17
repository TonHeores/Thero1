import { FormType, UIBase, bindComp, ButtonPlus, ModalOpacity, AdapterMgr, AdaptaterType, ButtonDropdownList, UIManager } from "../../../UIFrame/indexFrame";
import { _decorator, EditBox, Label, sys, Node, log, Widget, RichText, Asset, loader, error } from "cc";
import { MaskType } from "../../../UIFrame/UIBase";
import UserModel from "../../../model/UserModel";
const { ccclass, property } = _decorator;


@ccclass
export default class UIGM extends UIBase {

    formType = FormType.PopUp;
    static prefabPath = "common/UIGM";
    maskType = new MaskType(ModalOpacity.OpacityHigh, false);

    @bindComp("ButtonPlus")
    btn_send: ButtonPlus
    @bindComp("ButtonPlus")
    btn_close: ButtonPlus
    @bindComp("ButtonPlus")
    btn_info: ButtonPlus
    @bindComp("cc.EditBox")
    public accEdit: EditBox = null;
    @bindComp("cc.Label")
    public desc: Label = null;


    private mainIdx = 0;
    private mainTypeDatas = []


    /** 下面表示 生命周期顺序 */
    async load() {
        console.log('load');
        this.btn_send.addClick(this.onSendBtn, this)
        this.btn_close.addClick(this.onCloseBtn, this)
        this.btn_info.addClick(this.onInfoBtn, this)
        AdapterMgr.inst.adapatByType(AdaptaterType.FullScreen, this.node);
    }

    async onShow(params) {
        this.initView();
    }

    initView() {
        this.desc.string = "GM指令请点击右上角说明查看"
    }

    changeMainIdx() {
        console.log(this.mainIdx)
        this.desc.string = this.mainTypeDatas[this.mainIdx].desc
    }

    onCloseBtn(evt) {
        this.closeUIForm()
    }

    onInfoBtn(){
        let content = "增加主角经验:addExp num (说明：num为经验值) \n"
        content += "增加物品:addItem itemId num (说明：itemId为物品id num为数量) \n"
        content += "设置主角等级:setLevel num (说明：num为等级)\n"
        content += "设置宝箱等级:setChestLv (说明：num为宝箱等级) \n"
        content += "设置关卡等级:setMatchLv num (说明：num为关卡数)\n"
        content += "快速开箱子:openchest num (说明：num为开箱子数)\n"
        content += "重置角色:killme\n"
        UIManager.showNotice("GM说明",content)
    }

    async onSendBtn(evt) {
        if (this.accEdit.string == "") {
            UIManager.showToast("input cmd")
            return;
        }
        let arr = this.accEdit.string.split(" ")
        let param = []
        if(arr.length > 1){
            for(let i=1;i<arr.length;i++){
                // param.push(parseInt(arr[i]))
                param.push(arr[i])
            }
        }
        UserModel.sendGm(arr[0],param)
    }


    onLoad() {
        console.log('onload');
    }

    start() {
        console.log('start')
    }

    onHide() {
        console.log('onHide');
    }

    onDestroy() {
        console.log('destory');
        // 这里可以执行你的销毁操作, 在该窗体执行destory时, 会先调用onDestory方法
    }
}
