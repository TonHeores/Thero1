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
            this.attrName1.getComponent(RichText).string = `<color=81470F click = 'showAttrNote' param = '${this.data.attrType}' ><b><u>` + Common.getAttrNameByType(this.data.attrType) + `</u></b></color>`;
            this.attrValue.getComponent(Label).string =this.data.attrValue.toFixed(2) + "%";
        }
    }
}


