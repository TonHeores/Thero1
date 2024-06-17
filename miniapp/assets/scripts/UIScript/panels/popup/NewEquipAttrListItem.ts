import { _decorator, Component, Label, Node, RichText } from 'cc';
import { bindComp, UIListItem } from '../../../UIFrame/indexFrame';
import { Common } from '../../../utils/indexUtils';
import ConstEnum from '../../../utils/EnumeDefine';
const { ccclass, property } = _decorator;

@ccclass('NewEquipAttrListItem')
export class NewEquipAttrListItem extends UIListItem {
    @bindComp("cc.Node")
    public attributeName: Node = null;
    @bindComp("cc.Node")
    public attributeName1: Node = null;
    @bindComp("cc.Node")
    public attributeValue: Node = null;
    @bindComp("cc.Node")
    public tips: Node = null;
    
    protected dataChanged(){
        
        if((this.data.attrId >= ConstEnum.AttrType.TrumpRate && this.data.attrId <= ConstEnum.AttrType.RsPierceRate))
        {
            this.attributeName.active = false;
            this.attributeName1.active = true;
            this.attributeName1.getComponent(RichText).string = `<color=81470F click = 'showAttrNote' param = '${this.data.attrId}' ><b><u>` + Common.getAttrNameByType(this.data.attrId) + `</u></b></color>`;
            this.attributeValue.getComponent(Label).string = this.data.attrVal.toFixed(2) + "%";
        }
        else
        {
            this.attributeName.active = true;
            this.attributeName1.active = false;
            this.attributeValue.getComponent(Label).string = this.data.attrVal.toFixed();
            this.attributeName.getComponent(Label).string = Common.getAttrNameByType(this.data.attrId);
        }

        if(this.data.tipsMask == 0)
        {
            this.tips.active = false;
        }
        else if(this.data.tipsMask == 1)
        {
            this.tips.active = true;
            this.tips.children[0].active = true;
            this.tips.children[1].active = false;
        }
        else if(this.data.tipsMask == 2)
        {
            this.tips.active = true;
            this.tips.children[0].active = false;
            this.tips.children[1].active = true;
        }
    }

    start() {

    }

}


