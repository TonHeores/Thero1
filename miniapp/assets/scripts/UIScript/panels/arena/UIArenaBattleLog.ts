import { _decorator, Component, Node } from 'cc';
import { bindComp, ButtonPlus, FormType, ModalOpacity, UIBase, UIListView, UIManager } from '../../../UIFrame/indexFrame';
import { MaskType } from '../../../UIFrame/UIBase';
import Constants from '../../../Constant';
const { ccclass, property } = _decorator;

@ccclass('UIArenaBattleLog')
export class UIArenaBattleLog extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, true);
    static canRecall = true;
    static prefabPath = "arena/UIArenaBattleLog";
    @bindComp("ButtonPlus")
    public close: ButtonPlus = null;
    @bindComp("UIListView")
    public logList: UIListView = null;

    public onInit(): void {
        this.close.addClick(this.closeSelf,this);
    }

    async onShow(param) {
        
    }

    closeSelf(){
        this.closeUIForm();
    }
    
    start() {

    }

    update(deltaTime: number) {
        
    }
}


