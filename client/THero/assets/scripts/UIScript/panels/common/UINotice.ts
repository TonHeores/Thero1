import {FormType,UIBase, bindComp, ButtonPlus, ModalOpacity,AdapterMgr,AdaptaterType} from "../../../UIFrame/indexFrame";
import { _decorator, ProgressBar, Label, sys, Node, log, Widget,RichText,Asset, loader,error } from "cc";
import { MaskType } from "../../../UIFrame/UIBase";
const {ccclass, property} = _decorator;


@ccclass
export default class UINotice extends UIBase {

    formType = FormType.PopUp;
    static prefabPath = "common/UINotice";
     
    maskType = new MaskType(ModalOpacity.OpacityHigh, false);
    @bindComp("cc.RichText")
    content:RichText
    @bindComp("cc.Label")
    titlelb:Label
    @bindComp("ButtonPlus")
    btn_close:ButtonPlus


    /** 下面表示 生命周期顺序 */
    async load() {
       console.log('load');
        this.btn_close.addClick(this.onCloseBtn,this)
        AdapterMgr.inst.adapatByType(AdaptaterType.FullScreen, this.node);
    }

    async onShow(params) {
        this.titlelb.string = params.title;
        this.content.string = "<color=#C54B15><b>"+params.content+"</b></color>"
    }

    onCloseBtn(evt){
        this.closeUIForm()
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
