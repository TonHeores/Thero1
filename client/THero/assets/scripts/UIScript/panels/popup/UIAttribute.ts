import { _decorator, Component, Node, Prefab } from 'cc';
import { bindComp, ButtonPlus, FormType, ModalOpacity, UIBase, UIListView, UIManager } from '../../../UIFrame/indexFrame';
import { MaskType } from '../../../UIFrame/UIBase';
import Constants from '../../../Constant';
import State from '../../../redux/state';
import Redux from '../../../redux';
const { ccclass, property } = _decorator;

@ccclass('UIAttribute')
export class UIAttribute extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, false);
    canDestory = true;
    static canRecall = true;
    static prefabPath = "popup/UIAttribute";
    @bindComp("ButtonPlus")
    public closeBtn: ButtonPlus = null;
    @bindComp("UIListView")
    public basicList: UIListView = null;
    @bindComp("UIListView")
    public advancedList: UIListView = null;
    @bindComp("UIListView")
    public itemBagList: UIListView = null;

    onInit()
    {
        this.closeBtn.addClick(this.closeHandle,this);
    }

    closeHandle()
    {
        UIManager.closeView(Constants.Panels.UIAttribute);
    }

    async onShow() 
    {
        let accInfo = State.getState(Redux.ReduxName.user, "accInfo");
        let heroAttrs = accInfo.heroAttrs;
        let basicArr:Array<{attrType:number|string,attrValue:number|string}> = [];
        let advancedArr:Array<{attrType:number|string,attrValue:number|string}> = [];
        for(let i = 1; i < heroAttrs.length; i++)
        {
            if(i <= 4)
                basicArr.push({attrType:i, attrValue:heroAttrs[i].toFixed()})
            else
                advancedArr.push({attrType:i, attrValue: heroAttrs[i]== 0 ? heroAttrs[i] : heroAttrs[i].toFixed(2)})
        }
        this.basicList.setData(basicArr);
        this.advancedList.setData(advancedArr);
    }

    start() {

    }
}


