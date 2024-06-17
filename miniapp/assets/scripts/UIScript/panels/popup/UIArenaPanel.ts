import { _decorator, Component, Label, Node, Widget, screen } from 'cc';
import { bindComp, ButtonPlus, FormType, ModalOpacity, UIBase, UIListView, UIManager } from '../../../UIFrame/indexFrame';
import { MaskType } from '../../../UIFrame/UIBase';
import Constants from '../../../Constant';
import ArenaModel from '../../../model/ArenaModel';
import { ArenaGetTopListRsp, } from '../../../utils/pomelo/ProtoPackage';
import Common from '../../../utils/common';
import { PlayerInfo } from '../../../utils/pomelo/DataDefine';
import State from '../../../redux/state';
import Redux from '../../../redux';
import { CommUtil } from '../../../utils/pomelo/CommUtil';
import Ext from '../../../utils/exts';
import ConstEnum from '../../../utils/EnumeDefine';
import GameUtils from '../../../utils/GameUtils';
const { ccclass, property } = _decorator;

@ccclass('UIArenaPanel')
export class UIArenaPanel extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, true);
    static canRecall = true;
    static prefabPath = "arena/UIArenaPanel";
    
    @bindComp("ButtonPlus")
    public close: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public challengeBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public receiveBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public logBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public tipsBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public dailyBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public weekBtn: ButtonPlus = null;
    @bindComp("cc.Node")
    public myScore: Node = null;
    @bindComp("cc.Node")
    public myPowelb: Node = null;
    @bindComp("cc.Node")
    public myLevel: Node = null;
    @bindComp("cc.Node")
    public myName: Node = null;
    @bindComp("cc.Node")
    public myRanking: Node = null;
    @bindComp("cc.Node")
    public dailyboxNode: Node = null;
    @bindComp("cc.Node")
    public weekBoxNode: Node = null;
    @bindComp("cc.Node")
    public seasonLb: Node = null;
    @bindComp("cc.Node")
    public contentNode: Node = null;
    @bindComp("cc.Node")
    public head: Node = null;
    @bindComp("ButtonPlus")
    public weekReceiveBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public dailyReceiveBtn: ButtonPlus = null;
    @bindComp("UIListView")
    public rankingList: UIListView = null;

    private myRank:number;
    private seasonTimer:number = -1;
    private weekDayNum:number = 7;
    private countdownHour:number = 22;
    private countdownMin:number = 0;


    onInit()
    {
        this.challengeBtn.addClick(this.openChooseOpponents,this);
        this.close.addClick(this.closeSelf,this);
        this.tipsBtn.addClick(this.openTipsPanle,this);
        this.logBtn.addClick(this.openBattleLogPanle,this);
        this.dailyBtn.addClick(this.openDailyRewardPanel,this);
        this.weekBtn.addClick(this.openWeekRewardPanel,this);
        this.weekReceiveBtn.addClick(this.getWeekRankReward,this)
        this.dailyReceiveBtn.addClick(this.getDailyRankReward,this)
        // ArenaModel.getArenaRank(this.updataTopList,this);
        ArenaModel.getArenaRank();
    }

    async onShow(param) {
        this.connectRedux();
        this.seasonCountdown();
    }

    connectRedux() {
        Redux.Watch(this, Redux.ReduxName.arena, "rankInfo", (rankInfo) => {
            console.log("rankInfo ========",rankInfo);
            this.updataTopList(rankInfo);
        });

        Redux.Watch(this, Redux.ReduxName.user, "accInfo", (accInfo) => {
            let now = Date.now()
            let dailyRewardIsGet = CommUtil.isNewDay(accInfo.lastArenaDailyGiftTime,now)?0:1;
            let weekRewardIsGet = CommUtil.isNewWeek(accInfo.lastArenaWeeklyGiftTime,now)?0:1;
            (weekRewardIsGet == 1 || !this.myRank) ? this.weekBoxNode.active = false : this.weekBoxNode.active = true;
            (dailyRewardIsGet == 1 || !this.myRank) ? this.dailyboxNode.active = false : this.dailyboxNode.active = true;

            this.myLevel.getComponent(Label).string =  Ext.i18n.t("UI_Main_01_001").replace("{0#}",accInfo.lv);
            this.myName.getComponent(Label).string =  accInfo.name ? accInfo.name : accInfo.uid;
            this.myScore.getComponent(Label).string = accInfo.arenaScore + "";
            this.myPowelb.getComponent(Label).string = accInfo.battlePower;
            
            GameUtils.setHeadImg(accInfo.avatar ,this.head)
        })
    }

    updataTopList(param)
    {
        console.log("uiArena", param);
        this.myRank = param.myRank;
        
        this.myRanking.getComponent(Label).string =  param.myRank == 0 ? "-" : param.myRank;
        let result = param.infos.filter(ele => ele.playerSmpl != null);
        this.rankingList.setData(result);
    }

    seasonCountdown(){
        let now = new Date();
        let addDay = 0;
        
        if(now.getUTCDay() != 0 || now.getUTCHours() > 22)
            addDay =  this.weekDayNum - now.getDay();
        let utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()+addDay, this.countdownHour, this.countdownMin)
        let timeDiff = utcNow.valueOf() - now.valueOf();
        this.seasonLb.getComponent(Label).string = 0 + "d " + 0 + "h";
        this.seasonTimer = setInterval(()=>{
            timeDiff -= 1000;
            if(timeDiff<=0)
            {
                now = new Date();
                addDay = 0;
                if(now.getUTCDate() != 0 || now.getUTCHours() > 22)
                    addDay =  this.weekDayNum - now.getDay();
                utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()+addDay, this.countdownHour, this.countdownMin)
                timeDiff = utcNow.valueOf() - now.valueOf();
                this.seasonLb.getComponent(Label).string = 0 + "d " + 0 + "h";
            }
            var hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            this.seasonLb.getComponent(Label).string = days + "d " + hours + "h";
        },1000)
    }
    
    //领取排名奖励 
    getWeekRankReward()
    {
        ArenaModel.getRankReward(ConstEnum.ArenaRankType.Weekly);
    }
    //领取排名奖励 
    getDailyRankReward()
    {
        ArenaModel.getRankReward(ConstEnum.ArenaRankType.Daily);
    }

    closeSelf(){
        this.closeUIForm();
    }

    openDailyRewardPanel(){
        UIManager.openView(Constants.Panels.UIArenaReward,{rewardType:"daily", myRank:this.myRank});
    }

    openWeekRewardPanel(){
        UIManager.openView(Constants.Panels.UIArenaReward,{rewardType:"weekly", myRank:this.myRank});
    }

    openChooseOpponents(){
        ArenaModel.getOpponents();
    }

    openTipsPanle(){
        UIManager.showNotice(Ext.i18n.t("TipsInfo_003"), Ext.i18n.t("TipsInfo_004"))
    }

    openBattleLogPanle(){
        return;
        // UIManager.openView(Constants.Panels.UIArenaBattleLog);
    }

    protected onDisable(): void {
        clearInterval(this.seasonTimer)
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}


