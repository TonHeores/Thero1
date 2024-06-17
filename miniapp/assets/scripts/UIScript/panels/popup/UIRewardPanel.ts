import { _decorator, Component, instantiate, Label, Node } from 'cc';
import UIBase, { MaskType } from '../../../UIFrame/UIBase';
import { bindComp, FormType, ModalOpacity, UIListView, UIManager } from '../../../UIFrame/indexFrame';
import Constants from '../../../Constant';
import { Ext } from '../../../utils/indexUtils';
import { RewardItem } from './RewardItem';
const { ccclass, property } = _decorator;

@ccclass('UIRewardPanel')
export class UIRewardPanel extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, true);
    static canRecall = true;
    static prefabPath = "popup/UIRewardPanel";
    
    @bindComp("cc.Node")
    public itemList: Node = null;
    @bindComp("cc.Node")
    public closeLb: Node = null;
    @bindComp("cc.Node")
    public rItem: Node = null;
    
    private count:number = 10;
    private timer:number = -1;

    public onInit(): void {
        this.count = 10;
        this.closeLb.getComponent(Label).string = Ext.i18n.t("UI_Task_01_001").replace("{0#}",this.count);
    }

    //param [{type:1,count:10},{type:3,count:5},{type:9,count:5}]
    async onShow(param) {
        let self = this; 
        this.timer = setInterval(()=>{
            if(this.count <=0)
            {
                clearInterval(self.timer);
                UIManager.closeView(Constants.Panels.UIRewardPanel);
                return;
            }
            self.count--;
            self.closeLb.getComponent(Label).string = Ext.i18n.t("UI_Task_01_001").replace("{0#}",this.count);
        },1000)

        param.rewardInfos.forEach(element => {
            let item = instantiate(this.rItem);
            item.active = true;
            let itemS = item.addComponent(RewardItem);
            itemS.initData(element);
            this.itemList.addChild(item);
        });
    }

    protected onDisable(): void {
        clearInterval(this.timer);
    }

    start() {

    }
}


