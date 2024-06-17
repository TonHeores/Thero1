import {FormType,UIBase, bindComp, ButtonPlus, AdapterMgr,AdaptaterType, ModalOpacity} from "../../../UIFrame/indexFrame";
import { _decorator, Sprite, Label, Toggle, Node, log, Widget,RichText,Asset, loader,error } from "cc";
import Common from "../../../utils/common";
import Ext from "../../../utils/exts";
import { MaskType } from "../../../UIFrame/UIBase";
const {ccclass, property} = _decorator;

@ccclass
export default class UITip extends UIBase {

    formType = FormType.PopUp;
    static prefabPath = "common/UITip";
    maskType = new MaskType(ModalOpacity.OpacityHigh, false);
     
    @bindComp("cc.Sprite")
    icon1:Sprite = null;
    @bindComp("cc.Label")
    label1:Label = null;
    @bindComp("cc.Sprite")
    icon2:Sprite = null;
    @bindComp("cc.Label")
    label2:Label = null;
    @bindComp("cc.Label")
    label3:Label = null;
    // @bindComp("cc.Label")
    // titlelb:Label = null;
    @bindComp("cc.RichText")
    content: RichText = null;
    @bindComp("ButtonPlus")
    btn_confirm: ButtonPlus = null;
    @bindComp("ButtonPlus")
    btn_cancel: ButtonPlus = null;
    @bindComp("ButtonPlus")
    btn_sure: ButtonPlus = null;
    @bindComp("cc.Node")
    checkGrp: Node = null;
    @bindComp("cc.Toggle")
    rememberBtn: Toggle = null;

    cb = null//点击确定回调
    checkCb = null//
    cancelCb = null

    onInit() {
        this.btn_confirm.addClick(this.onConfirm, this)
        this.btn_cancel.addClick(this.onCancel, this)
        this.btn_sure.addClick(this.onConfirm, this)
        this.rememberBtn.isChecked = false
    }

    onConfirm(){
        if(this.cb){
            this.cb()
            this.cb = null
        }
        this.checkLogic()
        this.closeUIForm()
    }

    onCancel(){
        this.cb = null
        this.checkCb = null
        if(this.cancelCb){
            this.cancelCb()
            this.cancelCb = null
        }
        this.closeUIForm()
    }

    onReshow(params){
       console.log("onReshow")
       console.log(params)
    }

    checkLogic(){
        if(this.checkGrp.active){
            if(this.checkCb){
                this.checkCb(this.rememberBtn.isChecked)
                this.checkCb = null
            }
        }
    }

    
    start () {

    }

    //type = 1 只显示一个居中的关闭按键  2 显示两个按键
    async onShow(params) {
        this.label1.string = Ext.i18n.t("UI_PlayerInfo_03_005")
        this.label2.string = Ext.i18n.t("UI_PlayerInfo_03_005")
        this.label3.string = Ext.i18n.t("UI_PlayerInfo_03_006")
        let type = params.type
        // this.titlelb.string = params.title
        this.content.string = "<color=#B05C1C>"+params.content+"</color>"
        this.cb = params.cb
        this.rememberBtn.isChecked = false
        if(type == 1){
            this.btn_confirm.node.active = false
            this.btn_cancel.node.active = false
            this.btn_sure.node.active = true
            if(params.btnLb){
                this.label2.string = params.btnLb
            }
            if(params.btnIcon){
                this.icon2.node.active = true
                Common.setNodeImgSprite(params.btnIcon,this.icon2.node)
            }else{
                this.icon2.node.active = false
            }
        }else{
            this.btn_confirm.node.active = true
            this.btn_cancel.node.active = true
            this.btn_sure.node.active = false
            if(params.btnLb){
                this.label1.string = params.btnLb
            }
            if(params.btnIcon){
                this.icon1.node.active = true
                Common.setNodeImgSprite(params.btnIcon,this.icon1.node)
            }else{
                this.icon1.node.active = false
            }
            if(params.cancelLb){
                this.label3.string = params.cancelLb
            }
        }
        if(params.showCheck){
            this.checkGrp.active = true
            this.checkCb = params.checkCb
        }else{
            this.checkGrp.active = false
        }
        this.cancelCb = params.cancelCb
        if(params.countdown>0){
            this.countTime = params.countdown
            this.originStr = this.label1.string
            setTimeout(() => {
                this.countTimeFun()
            }, 35);
            this.startCountDonw()
        }
    }

    
    private originStr = ""
    private t1 = null as any;
    private countTime = 0
    private startCountDonw(){
        if(this.t1 == null){
            this.t1 = setInterval(this.countTimeFun.bind(this), 1000)
        }
    }

    countTimeFun(){
		if(this.countTime > 0){
            this.label1.string = this.originStr+"("+this.countTime+")"
            this.countTime --
		}else{
            this.label1.string = this.originStr
            this.stopCoutnDown()
            this.onConfirm()
        }
	}

    stopCoutnDown(){
		if(this.t1) clearInterval(this.t1)
        this.t1 = null
    }

    onHide() {
        this.stopCoutnDown()
    }
}
