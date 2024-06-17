import { _decorator, Component, Node, Prefab } from 'cc';
import { bindComp, ButtonPlus, FormType, ModalOpacity, UIBase, UIListView, UIManager } from '../../../UIFrame/indexFrame';
import { MaskType } from '../../../UIFrame/UIBase';
import Constants, { SERVER_Evn } from '../../../Constant';
import State from '../../../redux/state';
import Redux from '../../../redux';
import Ext from '../../../utils/exts';
import Common from '../../../utils/common';
const { ccclass, property } = _decorator;

@ccclass('UIAttribute')
export class UIAttribute extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, true);
    static canRecall = true;
    static prefabPath = "popup/UIAttribute";
    @bindComp("ButtonPlus")
    public closeBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public copyBtn: ButtonPlus = null;
    @bindComp("UIListView")
    public basicList: UIListView = null;
    @bindComp("UIListView")
    public advancedList: UIListView = null;
    @bindComp("UIListView")
    public itemBagList: UIListView = null;
    @bindComp("ButtonPlus")
    public tipsBtn: ButtonPlus = null;
    attrs = null
    onInit()
    {
        this.closeBtn.addClick(this.closeHandle,this);
        this.tipsBtn.addClick(this.showAttrTips,this);
        this.copyBtn.addClick(this.copyAttrs,this);
    }

    closeHandle()
    {
        UIManager.closeView(Constants.Panels.UIAttribute);
    }

    showAttrTips(){
        const searchRegExp = /<h>/g;
        const searchRegExp1 = /<h\/>/g;
        const replaceWith = '<size = 35>';
        const replaceWith1 = '<size = 22>';
        let result = Ext.i18n.t("TipsInfo_006").replace(searchRegExp, replaceWith);
        let str = result.replace(searchRegExp1, replaceWith1);
        UIManager.showNotice(Ext.i18n.t("TipsInfo_005"), str);
    }

    copyAttrs(){
        Common.CopyTextEvent("["+this.attrs.toString()+"]")
    }

    async onShow(params)
    {
        this.attrs = params.attrs
        let basicArr:Array<{attrType:number|string,attrValue:number|string}> = [];
        for(let i = 0; i < this.attrs.length; i++)
        {
            if(this.attrs[i] == null) continue;
            if(i <= 4)
                basicArr.push({attrType:i, attrValue:this.attrs[i].toFixed()})
            else
                basicArr.push({attrType:i, attrValue: this.attrs[i]== 0 ? this.attrs[i] : this.attrs[i].toFixed(2)})
        }
        basicArr.splice(5,0,{attrType:0, attrValue:"1"})
        this.basicList.setData(basicArr);
        if(Constants.Evn != SERVER_Evn.product){
            this.copyBtn.node.active = true
        }else{
            this.copyBtn.node.active = false
        }
    }
}


