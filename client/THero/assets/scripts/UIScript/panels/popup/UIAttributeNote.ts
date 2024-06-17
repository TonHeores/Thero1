import { _decorator, Component, Label, Node, UITransform, Vec3 } from 'cc';
import { bindComp, ButtonPlus, FormType, ModalOpacity, UIBase } from '../../../UIFrame/indexFrame';
import { MaskType } from '../../../UIFrame/UIBase';
import Ext from '../../../utils/exts';
const { ccclass, property } = _decorator;

@ccclass('UIAttributeNote')
export class UIAttributeNote extends UIBase {
    formType = FormType.TopTips;
    // maskType = new MaskType(ModalOpacity.OpacityZero, true);
    canDestory = true;
    static canRecall = true;
    static prefabPath = "popup/UIAttributeNote";
    @bindComp("cc.Node")
    public attrNote: Node = null;
    @bindComp("cc.Node")
    public attributeName: Node = null;
    @bindComp("cc.Node")
    public attributeNote: Node = null;

    private offset:Vec3 = new Vec3(130,85,0)//锚点偏移量

    onShow(param) {
        let pos = this.node.getComponent(UITransform).convertToNodeSpaceAR(param.pos.add(this.offset))
        this.attrNote.position = pos;
        if(param.attrId<=9)
        {
            this.attributeName.getComponent(Label).string = Ext.i18n.t("UI_Details_01_00" + (param.attrId));
            this.attributeNote.getComponent(Label).string = Ext.i18n.t("AdvAttributeInfo_01_00" + (param.attrId));
        }
        else
        {
            this.attributeName.getComponent(Label).string = Ext.i18n.t("UI_Details_01_0" + (param.attrId));
            this.attributeNote.getComponent(Label).string = Ext.i18n.t("AdvAttributeInfo_01_0" + (param.attrId));
        }
        this.node.getComponent(ButtonPlus).addClick(()=>{
            this.closeUIForm()
        },this)
    }
}


