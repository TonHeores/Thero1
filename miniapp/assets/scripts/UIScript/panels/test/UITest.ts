import { FormType, UIBase, bindComp, ButtonPlus, ModalOpacity, AdapterMgr, AdaptaterType, ButtonDropdownList, UIManager } from "../../../UIFrame/indexFrame";
import { _decorator, EditBox, Label, sys, Node, log, Widget, RichText, Asset, loader, error } from "cc";
import { MaskType } from "../../../UIFrame/UIBase";
import UserModel from "../../../model/UserModel";
import { PlayerInfo } from "../../../utils/pomelo/DataDefine";
import State from "../../../redux/state";
import Redux from "../../../redux";
import FightUtil from "../../../../battle/FightUtil";
const { ccclass, property } = _decorator;


@ccclass
export default class UITest extends UIBase {

    formType = FormType.PopUp;
    static prefabPath = "test/UITest";
    maskType = new MaskType(ModalOpacity.OpacityHigh, false);

    @bindComp("ButtonPlus")
    btn_send: ButtonPlus
    @bindComp("ButtonPlus")
    btn_close: ButtonPlus
    @bindComp("cc.EditBox")
    public monsterIDEdit: EditBox = null;
    @bindComp("cc.EditBox")
    public attrsEdit: EditBox = null;
    @bindComp("cc.Label")
    public desc: Label = null;
    @bindComp("ButtonPlus")
    btn_copy: ButtonPlus
    
    static text

    /** 下面表示 生命周期顺序 */
    async load() {
        console.log('load');
        this.btn_send.addClick(this.onSendBtn, this)
        this.btn_close.addClick(this.onCloseBtn, this)
        this.btn_copy.addClick(this.onCopyClick,this)
        this.attrsEdit.node.on("text-changed",this.textChangeHandler,this);
        AdapterMgr.inst.adapatByType(AdaptaterType.FullScreen, this.node);
    }

    async onShow(params) {
        this.initView();
        if(UITest.text)
            this.attrsEdit.string = UITest.text;
    }

    initView() {
        let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
        this.desc.string = "["+accInfo.heroAttrs.toString()+"]"
        console.log(this.desc.string)
        this.monsterIDEdit.string = "10111"
    }

    onCloseBtn(evt) {
        this.closeUIForm()
    }

    onLoadBtn(){

    }

    async onSendBtn(evt) {
        if (this.monsterIDEdit.string == "") {
            UIManager.showToast("input monsterID")
            return;
        }
        if (this.attrsEdit.string == "") {
            UIManager.showToast("input monster Attrs")
            return;
        }


        FightUtil.startFightWithParms(this.desc.string.substring(1,this.desc.string.length-1),this.monsterIDEdit.string,this.attrsEdit.string.substring(1,this.attrsEdit.string.length-1))
    }

    textChangeHandler(editbox)
    {
        UITest.text = editbox.string;
    }

    onCopyClick()
    {
        let input = this.desc.string;

        const el = document.createElement('textarea');

        el.value = input;

        // Prevent keyboard from showing on mobile
        el.setAttribute('readonly', '');

        const selection = getSelection();
        let flag = false;
        let originalRange;
        if (selection.rangeCount > 0) {
            originalRange = selection.getRangeAt(0);
            flag = true;
        }

        document.body.appendChild(el);
        el.select();

        // Explicit selection workaround for iOS
        el.selectionStart = 0;
        el.selectionEnd = input.length;

        let success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) {}

        document.body.removeChild(el);

        if (flag) {
            selection.removeAllRanges();
            selection.addRange(originalRange);
        }

        return success;
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
