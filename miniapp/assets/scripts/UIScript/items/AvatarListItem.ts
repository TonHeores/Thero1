
import { _decorator, Component, Node, Label, Vec3 } from 'cc';
import { Binder, ButtonPlus, EventCenter, UIListItem, UIManager, bindComp } from '../../UIFrame/indexFrame';
import { Common } from '../../utils/indexUtils';
import Constants from '../../Constant';
import { ConfigHelper } from '../../utils/ConfigHelper';
const { ccclass, property } = _decorator;
 
@ccclass('AvatarListItem')
export class AvatarListItem extends UIListItem {
    // [1]
    // dummy = '';

    @bindComp("cc.Node")
    light : Node;
    @bindComp("cc.Node")
    head : Node;

    onLoad(){
    }

    protected dataChanged(){
        Common.setNodeImgSprite("headIcon/"+this.data, this.head,null, () => {});
    }

    initEventListener(){
    }

   
    onDeStroy(){
        super.onDestroy()
    }
}
