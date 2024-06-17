import { _decorator, Component, Label, Node, RichText } from 'cc';
import { bindComp, UIListItem } from '../../UIFrame/indexFrame';
import { Common, Ext } from '../../utils/indexUtils';
import ConstEnum from '../../utils/EnumeDefine';
const { ccclass, property } = _decorator;

@ccclass('ArenaCompareAttrItem')
export class ArenaCompareAttrItem extends UIListItem {

    @bindComp("cc.Node")
    public attributeName: Node = null;
    @bindComp("cc.Node")
    public attributeName1: Node = null;
    @bindComp("cc.Node")
    public attributeValue: Node = null;
    @bindComp("cc.Node")
    public attributeValue1: Node = null;
    @bindComp("cc.Node")
    public title: Node = null;
    @bindComp("cc.Node")
    public content: Node = null;
    @bindComp("cc.Node")
    public Basiclb: Node = null;
    @bindComp("cc.Node")
    public tips: Node = null;
    
    protected dataChanged(){
        let str = Common.getAttrNameByType(this.data.attrType);
        if(this.data.attrType == 0)
        {
            this.title.active = true;
            this.content.active = false;
            if(this.data.accInfoValue == 0)
                this.Basiclb.getComponent(Label).string = Ext.i18n.t("UI_Details_01_028")
            else if(this.data.accInfoValue == 1)
                this.Basiclb.getComponent(Label).string = Ext.i18n.t("UI_Details_01_029")
        }
        else
        {
            this.title.active = false;
            this.content.active = true;
            if(this.data.attrType >= ConstEnum.AttrType.TrumpRate)
            {
                this.attributeName1.getComponent(RichText).string =  `<color=81470F click = 'showAttrNote' param = '${this.data.attrType}' ><b><u>` + str + `</u></b></color>`;
    
                this.attributeValue.getComponent(Label).string = this.data.accInfoValue + "%";
                this.attributeValue1.getComponent(Label).string = this.data.opponentsValue + "%";
                this.attributeName.active = false;
                this.attributeName1.active = true;
            }
            else
            {
                this.attributeName.getComponent(Label).string = str;
                this.attributeValue.getComponent(Label).string = this.data.accInfoValue;
                this.attributeValue1.getComponent(Label).string = this.data.opponentsValue;
                this.attributeName.active = true;
                this.attributeName1.active = false;
            }
        }

        if(parseInt(this.data.accInfoValue) > parseInt(this.data.opponentsValue))
        {
            this.tips.active = true;
            this.tips.children[0].active = true;
            this.tips.children[1].active = false;
        }
        else if(parseInt(this.data.accInfoValue) == parseInt(this.data.opponentsValue))
        {
            this.tips.active = false;
        }
        else
        {
            this.tips.active = true;
            this.tips.children[0].active = false;
            this.tips.children[1].active = true;
        }
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}


