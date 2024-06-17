import { _decorator, Component, Node } from 'cc';
import { bindComp, ButtonPlus, FormType, ModalOpacity, UIBase, UIListView, UIManager } from '../../../UIFrame/indexFrame';
import { MaskType } from '../../../UIFrame/UIBase';
import State from '../../../redux/state';
import Redux from '../../../redux';
import { Ext } from '../../../utils/indexUtils';
const { ccclass, property } = _decorator;

@ccclass('UIArenaCompareAttr')
export class UIArenaCompareAttr extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, true);
    static canRecall = true;
    static prefabPath = "arena/UIArenaCompareAttr";

    @bindComp("UIListView")
    public attrList: UIListView = null;
    @bindComp("ButtonPlus")
    public tipsBtn: ButtonPlus = null;

    
    async onShow(param) {
        let opponents = param.opponentsInfo;
        let accInfo = State.getState(Redux.ReduxName.user, "accInfo");
        let opponentsAttrs = param.opponentsInfo.accInfo.heroAttrs;//对手数据
        let attrArr:Array<{attrType:number, accInfoValue:number, opponentsValue:number}> = [];
        for(let i = 0; i < opponentsAttrs.length; i++)
        {
            if(opponentsAttrs[i] == null) continue;
            if(i <= 4)
                attrArr.push({attrType:i,accInfoValue:accInfo.heroAttrs[i].toFixed(), opponentsValue:opponentsAttrs[i].toFixed()})
            else
            attrArr.push({attrType:i,accInfoValue: accInfo.heroAttrs[i]== 0 ? accInfo.heroAttrs[i] : accInfo.heroAttrs[i].toFixed(2), 
                opponentsValue: opponentsAttrs[i]== 0 ? opponentsAttrs[i] : opponentsAttrs[i].toFixed(2)})
        }
        attrArr.splice(5,0,{attrType:0, accInfoValue:1,opponentsValue:1})
        this.attrList.setData(attrArr);

        this.tipsBtn.addClick(this.showTips,this)
    }

    showTips(){
        UIManager.showNotice(Ext.i18n.t("TipsInfo_005"), Ext.i18n.t("TipsInfo_006"))
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}


