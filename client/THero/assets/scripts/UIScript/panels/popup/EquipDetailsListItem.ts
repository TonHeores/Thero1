import { _decorator, Component, Label, Node, RichText } from 'cc';
import { bindComp, UIListItem } from '../../../UIFrame/indexFrame';
import { Common } from '../../../utils/indexUtils';
import ConstEnum from '../../../utils/EnumeDefine';
const { ccclass, property } = _decorator;

@ccclass('EquipDetailsListItem')
export class EquipDetailsListItem extends UIListItem {
    @bindComp("cc.Node")
    public attrName: Node = null;
    @bindComp("cc.Node")
    public attrName1: Node = null;
    @bindComp("cc.Node")
    public attrValue: Node = null;
    
    start() {

    }

    protected dataChanged(){
        if(this.data.attrType <= ConstEnum.AttrType.Speed)
        {
            this.attrName.getComponent(Label).string = Common.getAttrNameByType(this.data.attrType);
            this.attrValue.getComponent(Label).string =this.data.attrValue.toFixed();
            this.attrName1.active = false;
        }
        else
        {
            this.attrName.active = false;
            this.attrName1.getComponent(RichText).string =  `<u><outline color=9E5C1B shadow color = 964E2B width=3 click = 'showAttrNote' param = ${this.data.attrType}>`+Common.getAttrNameByType(this.data.attrType)+"</outline></u>";
            this.attrValue.getComponent(Label).string =this.data.attrValue.toFixed(2) + "%";
        }
    }
}


