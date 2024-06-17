import { _decorator, Component, Label, Node } from 'cc';
import { bindComp, ButtonPlus, FormType, ModalOpacity, UIBase, UIListView, UIManager } from '../../../UIFrame/indexFrame';
import { MaskType } from '../../../UIFrame/UIBase';
import Constants from '../../../Constant';
import Redux from '../../../redux';
import RankModel from '../../../model/RankModel';
import State from '../../../redux/state';
import { GiftData, PlayerInfo } from '../../../utils/pomelo/DataDefine';
import { Common, Ext } from '../../../utils/indexUtils';
import UserModel from '../../../model/UserModel';
import ConstEnum from '../../../utils/EnumeDefine';
import { ConfigHelper } from '../../../utils/ConfigHelper';
const { ccclass, property } = _decorator;

@ccclass('UIAccumulateReward')
export default class UIAccumulateReward extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, false);
    static prefabPath = "popup/UIAccumulateReward";
    @bindComp("ButtonPlus")
    public btn_close: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public btn_get: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public btn_info: ButtonPlus = null;
    @bindComp("cc.Label")
    public goldTimeLb: Label = null;  
    @bindComp("cc.Label")
    public goldNum: Label = null;  
    @bindComp("cc.Label")
    public chestTimeLb: Label = null;
    @bindComp("cc.Label")
    public chestNum: Label = null;
    @bindComp("cc.Label")
    public ticketTimeLb: Label = null;
    @bindComp("cc.Label")
    public ticketNum: Label = null;
    @bindComp("cc.Label")
    public accTime: Label = null;
    private lastTime = 0;

    onInit() {
        this.btn_close.addClick(this.onBtnClose,this);
        this.btn_get.addClick(this.onBtnGet,this);
        this.btn_info.addClick(this.onBtnInfo,this);
    }

    onShow() {
        this.connectRedux()
    }

    connectRedux() {
        Redux.Watch(this, Redux.ReduxName.user, "accInfo", (accInfo:PlayerInfo) => {
            console.log("watch accInfo " ,accInfo)
            this.refreshView(accInfo.gift)
            let cfg = ConfigHelper.getCfg("MainGiftCfg",accInfo.curMatchLv)
            console.log("cfg======",cfg)
            cfg.rewardInfos.forEach(element => {
                //表里配置的是10分钟的产出
                if(element.type == ConstEnum.ItemType.GoldCoin){
                    if(element.count > 0){
                        this.goldTimeLb.string = Common.formatEngNumber(element.count, 0, false) + "/h"
                    }else{
                        this.goldTimeLb.string = "0/h"
                    }
                }else if(element.type == ConstEnum.ItemType.ChestCount){
                    if(element.count > 0){
                        this.chestTimeLb.string = Common.formatEngNumber(element.count, 0, false)+ "/h"
                    }else{
                        this.chestTimeLb.string = "0/h"
                    }
                }else if(element.type == ConstEnum.ItemType.ArenaTicket){
                    if(element.count > 0){
                        this.ticketTimeLb.string = Common.formatEngNumber(element.count, 0, false)+ "/h"
                    }else{
                        this.ticketTimeLb.string = "0/h"
                    }
                }
            });
        });
        
        Redux.Watch(this, Redux.ReduxName.user, "myTs", (myTs: any) => {
            this.countTimeFun(myTs)
        });
        
        Redux.Watch(this, Redux.ReduxName.user, "mainGiftReWard", (mainGiftReWard) => {
            this.showReward(mainGiftReWard)
        });
    }

    showReward(rewards){
        if(rewards.length > 0){
            UIManager.openView(Constants.Panels.UIRewardPanel,{rewardInfos: rewards})
            Redux.State.dispatch({ type: Redux.ReduxName.user, mainGiftReWard: [] })
        }
        
    }

    countTimeFun(myTs){
        let passTime =  Math.floor((myTs - this.lastTime)/1000)
        if(passTime > 0 ){
            this.accTime.string = Common.getLeftTime(passTime)
        }else{
            this.accTime.string = "00:00:00"
        }
    }

    refreshView(giftData:GiftData){
        this.lastTime = giftData.lastUptTime;
        if(giftData.rewardInfos){
            giftData.rewardInfos.forEach(element => {
                if(element.type == ConstEnum.ItemType.GoldCoin){
                    if(element.count > 0){
                        this.goldNum.string = Common.formatEngNumber(element.count, 0, false)
                    }else{
                        this.goldNum.string = "0"
                    }
                }else if(element.type == ConstEnum.ItemType.ChestCount){
                    if(element.count > 0){
                        this.chestNum.string = Common.formatEngNumber(element.count, 0, false)
                    }else{
                        this.chestNum.string = "0"
                    }
                }else if(element.type == ConstEnum.ItemType.ArenaTicket){
                    if(element.count > 0){
                        this.ticketNum.string = Common.formatEngNumber(element.count, 0, false)
                    }else{
                        this.ticketNum.string = "0"
                    }
                }
            });
        }else{
            this.goldNum.string = "0"
            this.chestNum.string = "0"
            this.ticketNum.string = "0"
        }
    }

    onBtnClose(){
        this.closeUIForm()
    }

    onBtnGet(){
        let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
        console.log("gift=",accInfo.gift)
        if(accInfo.gift.accuHours > 0){
            UserModel.mainFetchGift()
        }
    }

    onBtnInfo(){
        UIManager.showNotice(Ext.i18n.t("TipsInfo_007"), Ext.i18n.t("TipsInfo_008"))
    }
}


