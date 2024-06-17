import Constants, { EventName, SceneName } from "../../../Constant";
import { _decorator, EditBox, sys, Node, Label, native, ProgressBar, sp, Vec3, Button, Component, view, screen, Widget, instantiate, Animation, AnimationState, NodePool } from "cc";
import { UIManager, FormType, UIBase, ButtonPlus, bindComp, EventCenter, AdapterMgr } from "../../../UIFrame/indexFrame";
import Redux from "../../../redux";
import { EquipInfo, PlayerInfo } from "../../../utils/pomelo/DataDefine";
import { Common, Ext } from "../../../utils/indexUtils";
import CocosHelper from "../../../UIFrame/CocosHelper";
import State from "../../../redux/state";
import { ConfigHelper } from "../../../utils/ConfigHelper";
import ConstEnum from "../../../utils/EnumeDefine";
import UserModel from "../../../model/UserModel";
import { UINewEquip } from "../popup/UINewEquip";
import ChestModel from "../../../model/ChestModel";
import FightUtil from "../../../../battle/FightUtil";
import GameUtils from "../../../utils/GameUtils";
import { CHECK_KEY, SOUND_RES } from "../../../config/basecfg";
import { DEV, TEST } from "cc/env";
import SoundMgr from "../../../UIFrame/SoundMgr";
import { AttrType, ItemType } from "../../../utils/pomelo/ConstDefine";
import UIEffect from "../common/UIEffect";
const { ccclass } = _decorator;
@ccclass
export default class UIMainMenuBot extends UIBase {
    formType = FormType.FixedUI;
    static canRecall = true;
    static prefabPath = "main/UIMainMenuBot";
    @bindComp("cc.Node")
    public botPanel: Node = null;
    @bindComp("ButtonPlus")
    public advBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public fightBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public boxBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public boxLvBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public autoOpenBoxBtn: ButtonPlus = null;
    @bindComp("cc.Label")
    public boxNum: Label = null;  // 宝箱数
    @bindComp("cc.Label")
    public boxLv: Label = null;  // 宝箱等级
    @bindComp("cc.Label")
    public leftTime: Label = null;  // 倒计时
    @bindComp("cc.Node")
    public boxRed: Node = null;
    @bindComp("cc.Node")
    public boxIcon: Node = null;
    @bindComp("cc.Node")
    public timeBox: Node = null;
    @bindComp("cc.Node")
    public head: Node = null;
    @bindComp("cc.Node")
    public equipItem: Node = null;
    @bindComp("cc.Node")
    public coin: Node = null;
    @bindComp("cc.Node")
    private coinNumber: number = 0;
    @bindComp("cc.Node")
    public AutoAni: Node = null;
    @bindComp("cc.Node")
    public openBoxCount: Node = null;
    @bindComp("cc.Node")
    public getBoxCount: Node = null;
    @bindComp("cc.Node")
    public challengeTicket: Node = null;
    // @bindComp("cc.Node")
    // public lvupAni: Node = null;
    private timer: number = -1;
    private maxCoinNum = 10
    coinPool:NodePool = new NodePool();

    private curEquip: EquipInfo = null
    private isFirstOpen = true
    onInit() {
        this.listenEvent()
        this.equipItem.active = false;
        UIManager.openView(Constants.Panels.UIMainTask);
        let spine: sp.Skeleton = this.boxIcon.getComponent(sp.Skeleton)
        spine.paused = true;
        this.initNodePool();
    }

    listenEvent() {
        this.advBtn.addClick(this.onBtnAdv, this)
        this.fightBtn.addClick(this.onBtnFight, this)
        this.boxLvBtn.addClick(this.onBtnBoxLv, this)
        this.boxBtn.addClick(this.onBtnBox, this)
        this.autoOpenBoxBtn.getComponent(ButtonPlus).addClick(this.autoOpenbox, this)
        let spine: sp.Skeleton = this.boxIcon.getComponent(sp.Skeleton)
        spine.setCompleteListener(this.spineEventCallback.bind(this))
        let spine2: sp.Skeleton = this.AutoAni.getComponent(sp.Skeleton)
        spine2.setCompleteListener(this.autoSpineEventCallback.bind(this))
        EventCenter.on(EventName.SellEquip, this.showCoinAni, this);
        EventCenter.on(EventName.StartFight,this.startFight,this)
        EventCenter.on(EventName.FinishFight,this.finishFight,this)
    }

    startFight(data){
        this.node.active = false
    }

    finishFight(data){
        this.node.active = true
    }

    //spine 回调函数 
    spineEventCallback(trackEntry, loopName) {
        // console.log("spineEventCallback trackEntry.animation.name="+trackEntry.animation.name)
        if(trackEntry.animation.name == "open"){
            this.setBoxOpen()
            this.setCurEquipItem()
            this.compareEquip()
        }
        if(trackEntry.animation.name == "close"){
            this.setBoxClose()
        }
    }

    //spine 回调函数 
    autoSpineEventCallback(trackEntry, loopName) {
        if(trackEntry.animation.name == "Appear"){
            this.playAutoAni("Start",true)
        }else if(trackEntry.animation.name == "End"){
            this.AutoAni.active = false
            let spine: sp.Skeleton = this.AutoAni.getComponent(sp.Skeleton)
            spine.paused = true;
            spine.clearTrack(0)
        }
    }

    playAutoAni(aniName,loop){
        console.log("playAutoAni aniName="+aniName+" loop="+loop)
        let spine: sp.Skeleton = this.AutoAni.getComponent(sp.Skeleton)
        spine.paused = false
        spine.setAnimation(0, aniName, loop);
    }

    async onBtnBoxLv() {
        UIManager.openView(Constants.Panels.UIChestLvInfo);
    }

    async autoOpenbox() {
        let openBoxInfo = State.getState(Redux.ReduxName.autoOpenBox, "openBoxInfo");
        if(openBoxInfo.isStartAutoOpen)
        {//停止自动开宝箱
            openBoxInfo.isStartAutoOpen = false;
            Redux.State.dispatch({ type: Redux.ReduxName.autoOpenBox, openBoxInfo});
            UIManager.showToast(Ext.i18n.t("BannerTips_003"));
            return;
        }
        UIManager.openView(Constants.Panels.UIAutoOpenBox);
    }

    async onBtnBox() {
        let openBoxInfo = State.getState(Redux.ReduxName.autoOpenBox, "openBoxInfo");
        if(openBoxInfo.isStartAutoOpen)
        {
            openBoxInfo.isStartAutoOpen = false;
            Redux.State.dispatch({ type: Redux.ReduxName.autoOpenBox, openBoxInfo});
            UIManager.showToast(Ext.i18n.t("BannerTips_003"));
        }
        if (this.curEquip == null){
            this.openBox()
        }
        else {
            this.compareEquip()
        }
    }

    async onBtnAdv() {
        UIManager.openView(Constants.Panels.UIAdventure);
    }

    async onBtnFight() {
        // let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
        // if(accInfo.lv<9){
        //     UIManager.showToast("No Available until lv9")
        //     return
        // }
        UIManager.openView(Constants.Panels.UIArenaPanel);
    }

    async onShow() {
        this.connectRedux();
        this.initView()
        this.autoOpenBoxHandle();
    }

    connectRedux() {
        Redux.Watch(this, Redux.ReduxName.user, "accInfo", (accInfo: PlayerInfo) => {
            console.log("watch accInfo ", accInfo)
            this.refreshBoxInfo(accInfo)
            //升级特效转为在menu播放
            // if(this.lastLv != 0 && this.lastLv != accInfo.lv){
            //     this.showLvupAni()
            // }
            // this.lastLv = accInfo.lv
            this.boxCount()

            let openBoxInfo = State.getState(Redux.ReduxName.autoOpenBox, "openBoxInfo");
            if(accInfo.curEquip == null)
            {
                openBoxInfo.canOpeNext = true;
                Redux.State.dispatch({ type: Redux.ReduxName.autoOpenBox, openBoxInfo});
            }
            let Ticket = UserModel.getItemByType(ItemType.ArenaTicket);
            this.challengeTicket.getComponent(Label).string = Ticket > 9 ? Ticket + "+" : Ticket + ""
        });

        Redux.Watch(this, Redux.ReduxName.user, "myTs", (myTs) => {
            this.refreshBoxGenTime()
        });
    }

    refreshBoxGenTime() {
        let { chestAutoAddTs } = UserModel.countDownObj
        if (chestAutoAddTs > 0) {
            this.leftTime.string = Common.getLeftTime(chestAutoAddTs)
        } else {
            this.leftTime.string = "00:00:00"
        }
    }

    async initView() {
        let frameSize = screen.windowSize;
        let ratio = frameSize.height / frameSize.width
        if (ratio < 1.6) {
            let widget1: Widget = this.timeBox.getComponent(Widget)
            widget1.bottom = 170
            let widget3: Widget = this.botPanel.getComponent(Widget)
            widget3.bottom = -AdapterMgr.safeBot - 130
        } else if (ratio < 2) {
            let widget1: Widget = this.timeBox.getComponent(Widget)
            widget1.bottom = 170
            let widget3: Widget = this.botPanel.getComponent(Widget)
            widget3.bottom = -AdapterMgr.safeBot - 80
        } else {
            let widget1: Widget = this.timeBox.getComponent(Widget)
            widget1.bottom = 100
            let widget3: Widget = this.botPanel.getComponent(Widget)
            widget3.bottom = 0
        }
    }

    compareEquip() {
        let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
        let newEquip = accInfo.curEquip
        let equips = accInfo.equips
        let oldEquip = null
        let newCfg = ConfigHelper.getCfg("EquipCfg", newEquip.equipId)
        equips.forEach(element => {
            if (element != null) {
                let cfg = ConfigHelper.getCfg("EquipCfg", element.equipId)
                if (cfg.part == newCfg.part) {
                    oldEquip = element
                }
            }
        });
        let openBoxInfo = State.getState(Redux.ReduxName.autoOpenBox, "openBoxInfo");
        if(openBoxInfo.isStartAutoOpen)
        {
            this.checkEquipParam(newEquip,oldEquip)
        }
        else
        {

            UIManager.openView(Constants.Panels.UINewEquip, { oldEquip, newEquip })
        }
        if(accInfo.items[3] == 0)
        {
            openBoxInfo.isStartAutoOpen = false;
            Redux.State.dispatch({ type: Redux.ReduxName.autoOpenBox, openBoxInfo});
        }
    }

    async refreshBoxInfo(accInfo) {
        let chestNum = UserModel.getItemByType(ConstEnum.ItemType.ChestCount)
        this.boxLv.string = "Lv." + accInfo.chestLevel
        this.boxNum.string = chestNum + ""
        //检测金币是否够升级
        let gold = UserModel.getItemByType(ConstEnum.ItemType.GoldCoin)
        let lvCfg = ConfigHelper.getCfg("ChestLevelCfg", accInfo.chestLevel)
        if (gold >= lvCfg.cost) { //可升级 显示红点
            this.boxRed.active = true
        } else {
            this.boxRed.active = false
        }
        
        this.equipItem.active = false;
        //查看是否有未处理的装备
        if (this.isFirstOpen) {
            this.boxIcon.scale = new Vec3(0,0,0)
            if (this.curEquip == null && accInfo.curEquip != null) {
                //有新装备
				await Common.sleep(500)
                this.setBoxOpen()
                this.setCurEquipItem()
            }else{
				await Common.sleep(500)
                this.setBoxClose()
            }
            this.boxIcon.scale = new Vec3(1,1,1)
        }else{
            //新开箱子 要显示开箱子动画
            if(this.curEquip != accInfo.curEquip){
                if(this.curEquip == null){
                    this.sharkTime = 1000 //这里可以根据等级不同设置不同的时间
                    this.showSharkingANi()
                }else if(accInfo.curEquip == null){//卖出道具后 关闭箱子
                    this.showCloseAni()
                }else{
                    this.setCurEquipItem()
                }
            }
        }
        this.curEquip = accInfo.curEquip
        this.isFirstOpen = false
    }

    async openBox() {
        let chestCount = UserModel.getItemByType(ConstEnum.ItemType.ChestCount)
        if (chestCount <= 0) {
            UIManager.openView(Constants.Panels.UIInvite)
            return
        }
        ChestModel.openChest()
    }

    private sharkTime = 0
    async showSharkingANi(){
        console.log("showSharkingANi")
        let aniName = 'open'
        let spine: sp.Skeleton = this.boxIcon.getComponent(sp.Skeleton)
        spine.paused = false
        spine.setAnimation(0, aniName, true);
        // await Common.sleep(this.sharkTime)
        // this.showOpenAni()
        await Common.sleep(500)
        SoundMgr.inst.playEffect(SOUND_RES.Openbox)
    }

    private showIdleAni(){
        console.log("showOpenAni")
        let aniName = 'idle'
        let spine: sp.Skeleton = this.boxIcon.getComponent(sp.Skeleton)
        spine.paused = false
        spine.setAnimation(0, aniName, true);
    }

    private async showCloseAni(){
        console.log("showCloseAni")
        let aniName = 'close'
        let spine: sp.Skeleton = this.boxIcon.getComponent(sp.Skeleton)
        spine.paused = false
        spine.setAnimation(0, aniName, false);

        let chestNum = UserModel.getItemByType(ConstEnum.ItemType.ChestCount)
        if(chestNum == 0){
            await Common.sleep(2000)
            UIManager.openView(Constants.Panels.UIInvite)
        }
    }

    setBoxClose() {
        console.log("setBoxClose")
        let aniName = 'open'
        let spine: sp.Skeleton = this.boxIcon.getComponent(sp.Skeleton)
        spine.paused = true
        spine.setAnimation(0, aniName, false);
        Common.setNodeHeight(this.boxBtn.node,400)
    }

    setBoxOpen() {
        console.log("setBoxOpen")
        this.showIdleAni()
        Common.setNodeHeight(this.boxBtn.node,550)
    }

    // private showLvupAni(){
    //     UIManager.openView(Constants.Panels.UIEffect,{type:1});
    // }

    setCurEquipItem() {
        let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
        let curEquip = accInfo.curEquip
        this.equipItem.active = true;
        let equipId: number = curEquip.equipId
        let equip = ConfigHelper.getCfg("EquipCfg", equipId)
        let icon = this.equipItem.children[0]
        let imgUrl = "gameRes/" + equip.imageId
        Common.setNodeImgSprite(imgUrl, icon, null, () => {
        })
        let itemLv = this.equipItem.children[1].getComponent(Label)
        itemLv.string = "LV." + curEquip.lv
        let quaUrl = "quality/" + equip.quality
        Common.setNodeImgSprite(quaUrl, this.equipItem, null, () => {
        })
    }

    async showCoinAni() {
        await Common.sleep(200)
        this.timer = setInterval(() => {
            if (UIManager.getInstance().checkUIFormIsShowingByPanel(Constants.Panels.UINewEquip)) return;
            let node = null;
            if (this.coinPool.size() > 0) {
                node = this.coinPool.get();
            } else {
                node = instantiate(this.coin);
                const animation = node.getComponent(Animation);
                animation.on(Animation.EventType.FINISHED, this.onCoinAniFinish.bind(this,node))
                this.coinPool.put(node);
            }
            let dir = Math.random() > 0.5 ? 1 : -1;
            let pos = new Vec3(-29,335,0)
            node.scale = new Vec3(1, 1, 1)
            node.position = new Vec3(pos.x + (dir * Math.random() * 200),pos.y + (Math.random() * 50)+ 100, pos.z);
            const animation = node.getComponent(Animation);
            const clips = animation.clips
            const state = animation.getState(clips[0].name)
            if(state) animation.play(clips[0].name)
            node.active = true;
            this.botPanel.addChild(node);
            this.coinNumber++
            if (this.coinNumber > 5) {
                let imgUrl = "itemRes/item9";
                node.name = "exp";
                Common.setNodeImgSprite(imgUrl, node.children[0], null, () => {
                })
            }
            else
            {
                let imgUrl = "itemRes/item1";
                node.name = "coin";
                Common.setNodeImgSprite(imgUrl, node.children[0], null, () => {
                })
            }
            if (this.coinNumber > 9) {
                clearInterval(this.timer);
                this.timer = -1;
                this.coinNumber = 0;
            }
        }, 20)
        await Common.sleep(200)
        SoundMgr.inst.playEffect(SOUND_RES.AddMoney)
    }

    onCoinAniFinish(node,type, state: AnimationState){
        this.onTriggered(type, state, node)
    }

    initNodePool(){
        for(let i = 0; i<this.maxCoinNum;i++)
        {
            const coin = instantiate(this.coin);
            const animation = coin.getComponent(Animation);
            animation.on(Animation.EventType.FINISHED, this.onCoinAniFinish.bind(this,coin))
            this.coinPool.put(coin)   
        }
    }

    autoOpenBoxHandle()
    {
        Redux.Watch(this, Redux.ReduxName.autoOpenBox, "openBoxInfo", (openBoxInfo) => {
            console.log(openBoxInfo.isStartAutoOpen+ "==="+openBoxInfo.canOpeNext);
            
            if(openBoxInfo.isStartAutoOpen && openBoxInfo.canOpeNext)
            {
                let openBoxInfo = State.getState(Redux.ReduxName.autoOpenBox, "openBoxInfo");
                openBoxInfo.canOpeNext = false;
                Redux.State.dispatch({ type: Redux.ReduxName.autoOpenBox, openBoxInfo});
                let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
                if(accInfo.chestLevel <= 0)
                {
                    let curEquip = accInfo.curEquip
                    curEquip ? this.equipItem.active = true : this.equipItem.active = false;
                    UIManager.showToast(Ext.i18n.t("BannerTips_001").replace("{0#}", Ext.i18n.t("TipsInfo_001")));
                    return;
                }
                ChestModel.openChest()
            }

            if(openBoxInfo.isStartAutoOpen){
                if(!this.AutoAni.active){
                    this.AutoAni.active = true
                    this.playAutoAni("Appear",false)
                }
            }else{
                if(this.AutoAni.active){
                    this.AutoAni.active = false
                    this.playAutoAni("End",false)
                }
            }
        })
    }

    checkEquipParam(newEquip:EquipInfo, oldEquip:EquipInfo){
        let openBoxSetting = State.getState(Redux.ReduxName.autoOpenBox, "openBoxSetting");
        let quality = Math.floor(newEquip.equipId / 100)
        let openBoxInfo = State.getState(Redux.ReduxName.autoOpenBox, "openBoxInfo");
        let oldEquipPow = oldEquip ? oldEquip.battlePower : 0;
        if(!oldEquip)
        {
            ChestModel.wearEquip();
            openBoxInfo.canOpeNext = false;
            Redux.State.dispatch({ type: Redux.ReduxName.autoOpenBox, openBoxInfo});
            return;
        }
        if(quality >= openBoxSetting.quality && newEquip.battlePower > oldEquipPow)
        {
            openBoxInfo.canOpeNext = false;
            Redux.State.dispatch({ type: Redux.ReduxName.autoOpenBox, openBoxInfo});
            // UIManager.showToast(Ext.i18n.t("BannerTips_002"));
            UIManager.openView(Constants.Panels.UINewEquip, { oldEquip, newEquip });
            return;
        }
        newEquip.attrInfos.forEach((element) => {
            //属性筛选中有任意
            if(openBoxSetting.needfilterArr.indexOf(0) == 0 || openBoxSetting.needfilterArr.indexOf(0) == 2)
            {
                if(element.attrId>=AttrType.TrumpRate && element.attrId<=AttrType.StunRate)
                {
                    openBoxInfo.canOpeNext = false;
                    Redux.State.dispatch({ type: Redux.ReduxName.autoOpenBox, openBoxInfo});
                    // UIManager.showToast(Ext.i18n.t("BannerTips_002"));
                    UIManager.openView(Constants.Panels.UINewEquip, { oldEquip, newEquip });
                    return;
                }
            }
            else if(openBoxSetting.needfilterArr.indexOf(0) == 1 || openBoxSetting.needfilterArr.indexOf(0) == 3)
            {
                if(element.attrId>=AttrType.RsTrumpRate && element.attrId<=AttrType.RsStunRate)
                {
                    openBoxInfo.canOpeNext = false;
                    Redux.State.dispatch({ type: Redux.ReduxName.autoOpenBox, openBoxInfo});
                    // UIManager.showToast(Ext.i18n.t("BannerTips_002"));
                    UIManager.openView(Constants.Panels.UINewEquip, { oldEquip, newEquip });
                    return;
                }
            }
            //是否有筛选的属性
            if(openBoxSetting.needfilterArr.indexOf(element.attrId) != -1)
            {
                openBoxInfo.canOpeNext = false;
                Redux.State.dispatch({ type: Redux.ReduxName.autoOpenBox, openBoxInfo});
                // UIManager.showToast(Ext.i18n.t("BannerTips_002"));
                UIManager.openView(Constants.Panels.UINewEquip, { oldEquip, newEquip })
                return;
            }
        })

        ChestModel.saleEquip();
        
    }

    public onTriggered(type: Animation.EventType, state, node) {
        UIManager.openView(Constants.Panels.UIEffect,{type:3,node,botPanel:this.botPanel,pool:this.coinPool});
        // node.removeFromParent()
    }

    onHide() {
        console.log('onHide');
    }

    onDestroy() {
        console.log('destory');
        this.isFirstOpen = true
        // 这里可以执行你的销毁操作, 在该窗体执行destory时, 会先调用onDestory方法
    }

    boxCount(){
        if(DEV)
        {
            let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
            this.openBoxCount.active = true;
            this.getBoxCount.active = true;

            let openBoxSaveKey = CHECK_KEY.OPENBOXCOUNT + "_check_"+ accInfo.uid;
            let openBoxNum = sys.localStorage.getItem(openBoxSaveKey) ? sys.localStorage.getItem(openBoxSaveKey) : 0;

            let getBoxSaveKey = CHECK_KEY.GETBOXCOUNT + "_check_"+ accInfo.uid;
            let getBoxNum = sys.localStorage.getItem(getBoxSaveKey) ? sys.localStorage.getItem(getBoxSaveKey) : 0;

            this.openBoxCount.getComponent(Label).string = "open:" + openBoxNum;
            this.getBoxCount.getComponent(Label).string = "get:" + getBoxNum;
        }
        else
        {
            this.openBoxCount.active = false;
            this.getBoxCount.active = false;
        }
    }
}