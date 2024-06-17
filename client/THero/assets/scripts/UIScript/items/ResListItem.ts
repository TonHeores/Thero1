
import { _decorator, Component, Node, Label, Vec3 } from 'cc';
import { Binder, ButtonPlus, EventCenter, UIListItem, UIManager, bindComp } from '../../UIFrame/indexFrame';
import { Common } from '../../utils/indexUtils';
import Constants from '../../Constant';
import { ConfigHelper } from '../../utils/ConfigHelper';
const { ccclass, property } = _decorator;
 
@ccclass('ResListItem')
export class ResListItem extends UIListItem {
    // [1]
    // dummy = '';

    @bindComp("cc.Node")
    bg : Node;
    @bindComp("cc.Node")
    res : Node;
    @bindComp("cc.Label")
    itemAmount : Label;
    @bindComp("cc.Node")
    isSelect : Node;
    @bindComp("ButtonPlus")
    infoBtn : ButtonPlus;
    @bindComp("cc.Node")
    bindIcon : Node;
    @bindComp("cc.Node")
    equipIcon : Node;
    // [2]
    // @property
    // serializableDummy = 0;

    private hasInit = false;

    private resId = 0;
    private float = -1;

    onLoad(){
        if(!this.isListItem){
            this.initNode()
        }
        this.initEventListener()
    }

    protected dataChanged(){
        this.setDatas();
    }

    initEventListener(){
    }

    initNode(){
        if(!this.hasInit) {
            Binder.bindComponent(this);
            this.hasInit = true;
            this.initEventListener()
        }
    }

    initData(data){
        this.initNode();

        this.data = data;

        this.setDatas();
    }

    setDatas(){

        const {resId,isSelected,  isShowInfoBtn} = this.data;

        if(this.isSelect) {
            this.isSelect.active = isSelected || false;
        }

        if(this.infoBtn) {  
            this.infoBtn.node.active = isShowInfoBtn;
        }

        this.resId = resId;
        if(resId == -1) {
            this.setEmptyItem();
        } else if(resId == -100) {
            this.setEmptyCompound();
        } else if(resId <10) { //特殊含义
            this.setEmptyItem();
        } else{
            this.setItems();
        }
    }

    setItems(){
        const { amount} = this.data;

        let cfg = ConfigHelper.getCfg("ItemCfg",this.resId)
        this.res.setPosition(new Vec3(0,4,0));
        this.res.active = true;
        Common.setNodeImgSprite(`gameRes/${cfg.imageId}`, this.res);
        // if(cfg.quality && cfg.quality >1){
        //     Common.setNodeImgSprite(`itemquality/${cfg.quality}`, this.bg, [30,30,30,30]);
        // }else{
        //     Common.setNodeImgSprite(`itemquality/100`, this.bg, [30,30,30,30]);
        // }
        
        this.itemAmount.node.active = true;
        this.itemAmount.string = amount > 0 ? amount : ``;
    }

    setMaterial(){
        const { amount} = this.data;

        let cfg = ConfigHelper.getCfg("ItemCfg",this.resId)
        this.res.setPosition(new Vec3(0,4,0));
        this.res.active = true;
        Common.setNodeImgSprite(`itemquality/100`, this.bg, [30,30,30,30]);
        Common.setNodeImgSprite(`gameRes/${cfg.imageId}`, this.res);
        
        this.itemAmount.node.active = true;
        this.itemAmount.string = amount > 0 ? amount : ``;

    }
    
    setEmptyItem(){
        this.res.active = false;
        Common.setNodeImgSprite(`itemquality/100`, this.bg, [30,30,30,30]);
        this.itemAmount.node.active = false;
    }

    setEmptyCompound(){
        this.res.active = false;
        Common.setNodeImgSprite(`itemquality/100`, this.bg, [10,10,10,10]);
        this.itemAmount.node.active = false;
    }

    start () {
        // [3]
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
    onDeStroy(){
        super.onDestroy()
    }
}
