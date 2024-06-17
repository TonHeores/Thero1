import { _decorator, Component, Label, Node } from 'cc';
import { bindComp, UIListItem } from '../../../UIFrame/indexFrame';
import { Common } from '../../../utils/indexUtils';
import ConstEnum from '../../../utils/EnumeDefine';
const { ccclass, property } = _decorator;

@ccclass('AttributeListItem')
export class AttributeListItem extends UIListItem {
    @bindComp("cc.Node")
    public attributeName: Node = null;
    @bindComp("cc.Node")
    public attributeValue: Node = null;
    
    start() {

    }

    protected dataChanged(){
        this.attributeName.getComponent(Label).string = Common.getAttrNameByType(this.data.attrType);
        if(this.data.attrType >= ConstEnum.AttrType.TrumpRate)
            this.attributeValue.getComponent(Label).string = this.data.attrValue + "%";
        else
            this.attributeValue.getComponent(Label).string = this.data.attrValue;
    }
}


