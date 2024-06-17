import { _decorator, Animation, AnimationState, color, Component, EventTouch, instantiate, Label, Node, sp, Vec3 } from 'cc';
import { bindComp, ButtonPlus, FormType, ModalOpacity, UIBase, UIListView, UIManager } from '../../../UIFrame/indexFrame';
import { MaskType } from '../../../UIFrame/UIBase';
import Constants from '../../../Constant';
import ConstEnum from '../../../utils/EnumeDefine';
import { ConfigHelper } from '../../../utils/ConfigHelper';
import { Common, Ext } from '../../../utils/indexUtils';
import { StringColor, StringOutline } from '../../../config/basecfg';
const { ccclass, property } = _decorator;

@ccclass('UIEquipDetails')
export class UIEquipDetails extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, true);
    static canRecall = true;
    static prefabPath = "popup/UIEquipDetails";

    @bindComp("ButtonPlus")
    public closeBtn: ButtonPlus = null;
    @bindComp("UIListView")
    public basicList: UIListView = null;
    @bindComp("UIListView")
    public advancedList: UIListView = null;
    @bindComp("cc.Node")
    public equipImg: Node = null;
    @bindComp("cc.Node")
    public level: Node = null;
    @bindComp("cc.Node")
    public equipName: Node = null;

    @bindComp("cc.Node")
    public coin: Node = null;


    onInit() {
        this.closeBtn.addClick(this.closHandle, this)
    }

    closHandle() {
        UIManager.closeView(Constants.Panels.UIEquipDetails)
    }

    async onShow(param) {
        console.log(param);
        if (!param.equipInfo) return;
        let arrtInfo = param.equipInfo.attrInfos;
        let basicData = [];
        let advancedData = [];
        for (let key in arrtInfo) {
            if (arrtInfo[key].attrId <= ConstEnum.AttrType.Speed)
                basicData.push({ attrType: arrtInfo[key].attrId, attrValue: arrtInfo[key].attrVal })
            else
                advancedData.push({ attrType: arrtInfo[key].attrId, attrValue: arrtInfo[key].attrVal })
        }
        this.basicList.setData(basicData);
        this.advancedList.setData(advancedData);
        this.initEquipInfo(param.equipInfo.equipId);
        this.level.getComponent(Label).string = Ext.i18n.t("UI_Main_01_001").replace("{0#}",param.equipInfo.lv); //param.equipInfo.lv ? "lv." + param.equipInfo.lv : "lv.1";
        
        let equip = ConfigHelper.getCfg("EquipCfg", param.equipInfo.equipId)
        let quality = equip.quality + 3;//多语言表从4开始
        let str = quality < 10 ? "0"+quality:quality
        this.equipName.getComponent(Label).string = "[" + Ext.i18n.t("UI_TreasueBox_02_0" + str) + "] " + Ext.i18n.t(equip.itemName);
        this.equipName.getComponent(Label).color = color(StringColor["quality" + equip.quality]);
        // this.equipName.getComponent(Label).outlineColor = color(StringOutline["quality" + equip.quality]);
    }

    initEquipInfo(equipId: number) {
        let equip = ConfigHelper.getCfg("EquipCfg", equipId)

        let icon = this.equipImg.children[0];
        let imgUrl = "gameRes/" + equip.imageId;
        Common.setNodeImgSprite(imgUrl, icon, null, () => {
        })
        let quaUrl = "quality/" + equip.quality
        Common.setNodeImgSprite(quaUrl, this.equipImg, null, () => {
        })

        let spineNode = this.equipImg.children[1]
        if(equip.quality>=6){
            spineNode.active = true
            let aniUrl = "uiEffect/zhuangbeikuang"
            let aniName = "caihongfen"
            if(equip.quality == 6){
                aniName = "hongse"
            }else if(equip.quality == 7){
                aniName = "huangse"
            }else if(equip.quality == 8){
                aniName = "lanse"
            }else if(equip.quality == 9){
                aniName = "caihongfen"
            }
            console.log("setEquipBg aniName="+aniName)
			Common.setNodeSpine(aniUrl, spineNode, () => {
                let spine = spineNode.getComponent(sp.Skeleton)
                spine.premultipliedAlpha = false
                spine.paused = false
				spine.setAnimation(0, aniName, true);
			});
        }else{
            let spine = spineNode.getComponent(sp.Skeleton)
            spine.paused = true
            spineNode.active = false
        }
    }

    start() {

    }

    update(deltaTime: number) {

    }

}


