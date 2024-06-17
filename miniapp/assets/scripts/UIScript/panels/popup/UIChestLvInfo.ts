
import { _decorator, Node, instantiate, Label, UIOpacity, sys, ProgressBar, Color, color, Vec3 } from 'cc';
import Redux from '../../../redux';
import { bindComp, ButtonPlus, FormType, ModalOpacity, UIManager } from '../../../UIFrame/indexFrame';
import UIBase, { MaskType } from '../../../UIFrame/UIBase';
import Common from '../../../utils/common';
import Ext from '../../../utils/exts';
import State from '../../../redux/state';
import { ConfigHelper } from '../../../utils/ConfigHelper';
import { PlayerInfo } from '../../../utils/pomelo/DataDefine';
import ChestModel from '../../../model/ChestModel';
import UserModel from '../../../model/UserModel';
import ConstEnum from '../../../utils/EnumeDefine';
import Constants from '../../../Constant';
import { ItemType } from '../../../utils/pomelo/ConstDefine';
const { ccclass } = _decorator;

@ccclass('UIChestLvInfo')
export default class UIChestLvInfo extends UIBase {
    static prefabPath = "popup/UIChestLvInfo";
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, false);

    // 关闭按钮
    @bindComp("ButtonPlus")
    closeBtn: ButtonPlus;
    @bindComp("ButtonPlus")
    upBtn: ButtonPlus;
    @bindComp("ButtonPlus")
    accBtn: ButtonPlus;
    @bindComp("ButtonPlus")
    infoBtn: ButtonPlus;

    @bindComp("cc.Node")
    accPanel: Node = null;
    @bindComp("ButtonPlus")
    minusBtn: ButtonPlus;
    @bindComp("ButtonPlus")
    addBtn: ButtonPlus;
    @bindComp("ButtonPlus")
    accConfirmBtn: ButtonPlus;
    @bindComp("ButtonPlus")
    closeAccBtn: ButtonPlus;
    @bindComp("ButtonPlus")
    maxBtn: ButtonPlus;
    
    @bindComp("cc.Node")
    leftBox: Node = null;
    @bindComp("cc.Node")
    rightBox: Node = null;
    @bindComp("cc.Label")
    timeTip: Label = null;
    @bindComp("cc.Label")
    curNumbLb: Label = null;
    @bindComp("cc.Label")
    needNumLb: Label = null;
    @bindComp("cc.Label")
    matNum: Label = null;
    @bindComp("cc.Label")
    allTime: Label = null;
    @bindComp("cc.Label")
    accTime: Label = null;
    @bindComp("cc.Label")
    lvlb: Label = null;
    @bindComp("cc.Label")
    nextLvLb: Label = null;
    @bindComp("cc.Label")
    accCardNum: Label = null;
    @bindComp("cc.Node")
    needImg: Node = null;
    @bindComp("cc.Node")
    needTimeBox: Node = null;
    @bindComp("cc.Label")
    timelb: Label = null;
    @bindComp("cc.Node")
    upTimeBox: Node = null;
    @bindComp("cc.Label")
    uptimelb: Label = null;
    @bindComp("cc.Node")
    timeBox: Node = null;
    @bindComp("cc.Node")
    timeContent: Node = null;
    @bindComp("cc.Node")
    needBox: Node = null;
    @bindComp("cc.Node")
    maxInfoBox: Node = null;
    private useNum = 0
    private maxNum = 0
    // private leftTime = 0
    private isUpgrading = false
    onLoad() {
        this.listenEvent();
    }

    onShow() {
        this.isUpgrading = false
        this.connectRedux()
        this.refreshView()
        this.accPanel.active = false
    }

    connectRedux() {
        Redux.Watch(this, Redux.ReduxName.user, "accInfo", (userInfo: any) => {
            this.refreshView()
        });
        Redux.Watch(this, Redux.ReduxName.user, "myTs", (myTs: any) => {
            let { chestUpgradeTs } = UserModel.countDownObj
            if (chestUpgradeTs != 0) {
                this.isUpgrading = true
                this.refreshNeedAccCard()
                this.countTimeFun()
            }else{
                if(this.isUpgrading){
                    UIManager.openView(Constants.Panels.UIEffect,{type:1});
                }
                this.isUpgrading = false
            }
        });
    }

    refreshView() {
        let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
        let chestLv = accInfo.chestLevel;

        let chestLevelCfg = ConfigHelper.getCfgSet("ChestLevelCfg");
        let keys = Object.keys(chestLevelCfg);
        let maxLv = keys[keys.length-1];
        this.setMaxBoxInfo(maxLv)
        if(chestLv == Number(maxLv))
        {
            this.timeBox.active = false;
            this.maxInfoBox.active = true;
            this.setMaxBoxInfo(maxLv)
        } 
        else
        {
            this.timeBox.active = true;
            this.maxInfoBox.active = false;
        }
        let lvcfg = ConfigHelper.getCfg("ChestLevelCfg",chestLv)
        let quacfg = ConfigHelper.getCfg("ChestQualityCfg", chestLv)
        let nextQuacfg = ConfigHelper.getCfg("ChestQualityCfg", chestLv + 1)
        this.lvlb.string = Ext.i18n.t("UI_TreasueBox_02_002").replace("{0#}", chestLv)
        this.nextLvLb.string = Ext.i18n.t("UI_TreasueBox_02_002").replace("{0#}", (chestLv + 1))
        this.accCardNum.string = "X" + UserModel.getItemByType(ConstEnum.ItemType.SpeedUpCard)
        for (let i = 0; i < 9; i++) {
            let lb = this.leftBox.children[i].children[0].getComponent(Label)
            let nextlb = this.rightBox.children[i].children[0].getComponent(Label)
            lb.string = quacfg.qualityRates[i] + "%"
            if(nextQuacfg){
                nextlb.string = nextQuacfg.qualityRates[i] + "%"
            }else{
                nextlb.string = "--"
            }
        }
        let { chestUpgradeTs } = UserModel.countDownObj
        console.log("chestUpgradeTs============" + chestUpgradeTs)
        if (chestUpgradeTs != 0) { //正在升级
            this.needTimeBox.active = false
            this.upTimeBox.active = true
            this.upBtn.node.active = false
            this.accBtn.node.active = true
            this.needBox.active = false;
            this.timeTip.string = Ext.i18n.t("UI_TreasueBox_02_015")
            let imgUrl = "itemRes/item" + ConstEnum.ItemType.SpeedUpCard
            Common.setNodeImgSprite(imgUrl, this.needImg, null)
            this.timeContent.position = new Vec3(0,64,0)
        } else {
            this.needTimeBox.active = true
            this.upTimeBox.active = false
            this.upBtn.node.active = true
            this.accBtn.node.active = false
            this.needBox.active = true;
            let coin = UserModel.getItemByType(ConstEnum.ItemType.GoldCoin)
            this.timeTip.string = Ext.i18n.t("UI_TreasueBox_02_013")
            this.timelb.string = Common.getLeftTime(lvcfg.upgradeTime)
            this.needNumLb.string = " / " + lvcfg.cost
            this.curNumbLb.string = coin+""
            
            if (coin >= lvcfg.cost) {
                this.curNumbLb.color = this.needNumLb.color
            } else {
                this.curNumbLb.color = Color.RED
            }
            let imgUrl = "itemRes/item" + ConstEnum.ItemType.GoldCoin
            Common.setNodeImgSprite(imgUrl, this.needImg, null)
            this.timeContent.position = new Vec3(0,100,0)
        }
    }

     
    refreshNeedAccCard() {
        let leftTime = UserModel.countDownObj.chestUpgradeTs
        let cardNum = UserModel.getItemByType(ConstEnum.ItemType.SpeedUpCard)
        let needTime = Common.getLeftTimeObj(leftTime)
        let needMinNum = needTime.hour * 60 + needTime.minute
        if(needTime.second > 0){
            needMinNum ++
        }
        let needCardNum = Math.ceil(needMinNum / 5) //每个加速卡加速5分钟
        this.needNumLb.string = "/" + needCardNum
        this.curNumbLb.string = cardNum+""
        if (cardNum >= needCardNum) {
            this.curNumbLb.color = this.needNumLb.color
        } else {
            this.curNumbLb.color = Color.RED
        }
        if(needCardNum>=cardNum){
            this.maxNum = cardNum
        }else{
            this.maxNum = needCardNum
        }
    }

    setAccTime(){
        let hasNum = UserModel.getItemByType(ItemType.SpeedUpCard);
        this.useNum = Math.min(hasNum,this.maxNum);
        this.matNum.string = this.useNum + "/" + this.maxNum;
        this.accTime.string = "(" + Common.getLeftTime(60*5*this.useNum)  + ")" 
    }

    listenEvent() {
        this.closeBtn.addClick(() => {
            this.closeUIForm();
        }, this);
        this.upBtn.addClick(() => {
            let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
            let coin = UserModel.getItemByType(ConstEnum.ItemType.GoldCoin)
            let lvcfg = ConfigHelper.getCfg("ChestLevelCfg",accInfo.chestLevel)
            if(lvcfg.cost < coin){
                ChestModel.chestUpgrade()
            }else{
                UIManager.showToast(Ext.i18n.t("BannerTips_001").replace("{0#}",Ext.i18n.t("UI_Item_01_001")) )
            }
        }, this);
        this.infoBtn.addClick(() => {
            UIManager.showNotice(Ext.i18n.t("TipsInfo_001"), Ext.i18n.t("TipsInfo_002"))
        }, this);
        this.accBtn.addClick(() => {
            this.accPanel.active = true
            this.useNum = 0
            this.setAccTime()
        }, this);

        this.addBtn.addClick(() => {
            this.useNum++
            if (this.useNum > this.maxNum) {
                this.useNum = this.maxNum
            }
            this.setAccTime()
        }, this);
        this.minusBtn.addClick(() => {
            this.useNum--
            if (this.useNum < 0) {
                this.useNum = 0
            }
            this.setAccTime()
        }, this);
        this.maxBtn.addClick(() => {
            this.useNum = this.maxNum
            this.setAccTime()
        }, this);
        this.closeAccBtn.addClick(() => {
            this.accPanel.active = false
        }, this);
        this.accConfirmBtn.addClick(() => {
            if(this.useNum >0){
                this.accPanel.active = false
                ChestModel.chestUpgradeAcc(this.useNum)
            }
        }, this);
    }

    countTimeFun() {
        let { chestUpgradeTs } = UserModel.countDownObj
        if (chestUpgradeTs > 0) {
            this.uptimelb.string = Common.getLeftTime(chestUpgradeTs)
            if(this.accPanel.active){
                this.allTime.string = this.uptimelb.string
            }
        } else {
            this.uptimelb.string = "00:00:00"
            this.allTime.string = this.timelb.string
        }
    }

    setMaxBoxInfo(maxlev){
        let quacfg = ConfigHelper.getCfg("ChestQualityCfg", maxlev)
        for (let i = 0; i < 9; i++) {
            let lb = this.leftBox.children[i].children[0].getComponent(Label)
            lb.string = quacfg.qualityRates[i] + "%"
        }
    }

    onDestroy() {
    }

    onHide() {
    }
}
