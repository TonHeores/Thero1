
import { _decorator, Node, instantiate, Label, UIOpacity, sys, ProgressBar, Color, color } from 'cc';
import Redux from '../../../redux';
import SeverConfig from '../../../SeverConfig';
import { bindComp, ButtonPlus, EventCenter, FormType, ModalOpacity, UIListView, UIManager } from '../../../UIFrame/indexFrame';
import UIBase, { MaskType } from '../../../UIFrame/UIBase';
import Common from '../../../utils/common';
import Ext from '../../../utils/exts';
import Constants from '../../../Constant';
import State from '../../../redux/state';
import { ConfigHelper } from '../../../utils/ConfigHelper';
import { PlayerInfo } from '../../../utils/pomelo/DataDefine';
import ChestModel from '../../../model/ChestModel';
import UserModel from '../../../model/UserModel';
import ConstEnum from '../../../utils/EnumeDefine';
const { ccclass } = _decorator;

@ccclass('UIChestLvInfo')
export default class UIChestLvInfo extends UIBase {
    static prefabPath = "popup/UIChestLvInfo";

    canDestory = true;
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

    @bindComp("cc.Node")
    leftBox: Node = null;
    @bindComp("cc.Node")
    rightBox: Node = null;
    @bindComp("cc.Label")
    timeTip: Label = null;
    @bindComp("cc.Label")
    timelb: Label = null;
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
    @bindComp("cc.Node")
    needImg: Node = null;
    private useNum = 0
    private maxNum = 0
    onLoad() {
        this.listenEvent();
    }

    onShow() {
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
                this.refreshNeedAccCard()
                this.countTimeFun()
            }
        });
    }

    refreshView() {
        let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
        let chestLv = accInfo.chestLevel
        let lvcfg = ConfigHelper.getCfg("ChestLevelCfg",chestLv)
        let quacfg = ConfigHelper.getCfg("ChestQualityCfg", chestLv)
        let nextQuacfg = ConfigHelper.getCfg("ChestQualityCfg", chestLv + 1)
        this.lvlb.string = Ext.i18n.t("UI_TreasueBox_02_002").replace("{0#}", chestLv)
        this.nextLvLb.string = Ext.i18n.t("UI_TreasueBox_02_002").replace("{0#}", (chestLv + 1))
        for (let i = 0; i < 9; i++) {
            let lb = this.leftBox.children[i].children[0].getComponent(Label)
            let nextlb = this.rightBox.children[i].children[0].getComponent(Label)
            lb.string = quacfg.qualityRates[i] + "%"
            nextlb.string = nextQuacfg.qualityRates[i] + "%"
        }
        let { chestUpgradeTs } = UserModel.countDownObj
        console.log("chestUpgradeTs============" + chestUpgradeTs)
        if (chestUpgradeTs != 0) { //正在升级
            this.upBtn.node.active = false
            this.accBtn.node.active = true
            this.timeTip.string = Ext.i18n.t("UI_TreasueBox_02_015")
            let imgUrl = "itemRes/item" + ConstEnum.ItemType.SpeedUpCard
            Common.setNodeImgSprite(imgUrl, this.needImg, null)
        } else {
            this.upBtn.node.active = true
            this.accBtn.node.active = false
            let coin = UserModel.getItemByType(ConstEnum.ItemType.GoldCoin)
            this.timeTip.string = Ext.i18n.t("UI_TreasueBox_02_013")
            this.timelb.string = Common.getLeftTime(lvcfg.upgradeTime)
            this.needNumLb.string = lvcfg.cost + "/" + coin
            if (coin >= lvcfg.cost) {
                this.needNumLb.color = Color.WHITE
            } else {
                this.needNumLb.color = Color.RED
            }
            let imgUrl = "itemRes/item" + ConstEnum.ItemType.GoldCoin
            Common.setNodeImgSprite(imgUrl, this.needImg, null)
        }
    }

     
    refreshNeedAccCard() {
        let leftTime = UserModel.countDownObj.chestUpgradeTs
        let cardNum = UserModel.getItemByType(ConstEnum.ItemType.SpeedUpCard)
        let needTime = Common.getLeftTimeObj(leftTime)
        let needMinNum = needTime.hour * 60 + needTime.minute
        let needCardNum = Math.ceil(needMinNum / 5) //每个加速卡加速5分钟
        this.needNumLb.string = cardNum + "/" + needCardNum
        if (cardNum >= needCardNum) {
            this.needNumLb.color = Color.WHITE
        } else {
            this.needNumLb.color = Color.RED
        }
        if(needCardNum>=cardNum){
            this.maxNum = cardNum
        }else{
            this.maxNum = needCardNum
        }
    }

    setAccTime(){
        this.matNum.string = this.useNum + "/" + this.maxNum
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
                UIManager.showToast("金币不足")
            }
        }, this);
        this.infoBtn.addClick(() => {
            UIManager.showNotice("说明", "规则")
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
            this.timelb.string = Common.getLeftTime(chestUpgradeTs)
            if(this.accPanel.active){
                this.allTime.string = this.timelb.string
            }
        } else {
            this.timelb.string = "00:00:00"
            this.allTime.string = this.timelb.string
        }
    }

    onDestroy() {
    }

    onHide() {
    }
}
