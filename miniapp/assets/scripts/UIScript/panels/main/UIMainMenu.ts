import Constants, { EventName, SERVER_Evn, SceneName } from "../../../Constant";
import { _decorator, EditBox, sys, Node, Label, native, ProgressBar, tween, Vec3, Button, Component, view, screen, Widget, instantiate, Animation, Sprite, sp, Layers, UITransform, } from "cc";
import { UIManager, FormType, UIBase, ButtonPlus, bindComp, EventCenter, AdapterMgr } from "../../../UIFrame/indexFrame";
import Redux from "../../../redux";
import { EquipInfo, PlayerInfo } from "../../../utils/pomelo/DataDefine";
import { Common } from "../../../utils/indexUtils";
import CocosHelper from "../../../UIFrame/CocosHelper";
import State from "../../../redux/state";
import { ConfigHelper } from "../../../utils/ConfigHelper";
import  ConstEnum from "../../../utils/EnumeDefine";
import UserModel from "../../../model/UserModel";
import { UINewEquip } from "../popup/UINewEquip";
import ChestModel from "../../../model/ChestModel";
import FightUtil from "../../../../battle/FightUtil";
import GameUtils from "../../../utils/GameUtils";
import { CHECK_KEY, SOUND_RES } from "../../../config/basecfg";
import { TEST } from "cc/env";
import SoundMgr from "../../../UIFrame/SoundMgr";
import { resourceUtil } from "../../../UIFrame/resourceUtil";
import { GameRoot } from "../../../manager/GameRoot";
const { ccclass } = _decorator;
@ccclass
export default class UIMainMenu extends UIBase {
    formType = FormType.Screen;
    static canRecall = true;
    static prefabPath = "main/UIMainMenu";
    @bindComp("cc.Node")
    public topPanel: Node = null;
    @bindComp("cc.Node")
    public topBtns: Node = null;
    @bindComp("cc.Node")
    public middlePanel: Node = null;
    @bindComp("cc.Node")
    public head: Node = null;
    @bindComp("cc.Node")
    public goldbox: Node = null;
    @bindComp("cc.Node")
    public diamondBox: Node = null;
    @bindComp("ButtonPlus")
    public addGoldBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public addDiamondBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public accumulateBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public detailBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public Avatar: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public rankBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public noticeBtn: ButtonPlus = null;
    
    @bindComp("cc.ProgressBar")
    expProBar: ProgressBar
    @bindComp("cc.Label")
    public expProLb: Label = null;  // 经验

    @bindComp("cc.Label")
    public lever: Label = null;  // 等级
    @bindComp("cc.Label")
    public nick: Label = null;  // 昵称
    @bindComp("cc.Label")
    public goldNum: Label = null;  // 金币
    @bindComp("cc.Label")
    public diamondNum: Label = null;  // 钻石

    @bindComp("cc.Label")
    public Speed: Label = null;  // 速度
    @bindComp("cc.Label")
    public Hp: Label = null;  // 血量
    @bindComp("cc.Label")
    public Atk: Label = null; // 攻击
    @bindComp("cc.Label")
    public Def: Label = null; // 防御
    @bindComp("cc.Label")
    public DblAttackRate: Label = null; //连击率
    @bindComp("cc.Label")
    public DizzyRate: Label = null;  //击晕率
    @bindComp("cc.Label")
    public TrumpRate: Label = null;  //暴击率
    @bindComp("cc.Label")
    public DodgeRate: Label = null;  //闪避率
    @bindComp("cc.Label")
    public CounterRate: Label = null; //反击率
    @bindComp("cc.Label")
    public BloodRate: Label = null;   //格挡率
    @bindComp("cc.Label")
    public Power: Label = null;   //格挡率
    @bindComp("cc.Node")
    public equips: Node = null;
    private lastExp:number;
    private lastLv = 0
    async onInit() {
        this.listenEvent()
        await UIManager.openView(Constants.Panels.UIMainTask);
        UIManager.openView(Constants.Panels.UIMainMenuBot);
        UIManager.openView(Constants.Panels.UIEffect);
    }

    listenEvent() {
        this.addGoldBtn.addClick(this.onBtnAddGold, this)
        this.addDiamondBtn.addClick(this.onBtnDiamond, this)
        this.detailBtn.addClick(this.onBtnDetail, this)
        this.rankBtn.addClick(this.onBtnRank, this)
        this.Avatar.addClick(this.onBtnAvatar, this)
        this.noticeBtn.addClick(this.onBtnNotice, this)
        this.accumulateBtn.addClick(this.onBtnAccumalute, this)
        
        let idx = 1;
        this.equips.children.forEach(element => {
            let i = idx
            let equipNode = element.getComponent(ButtonPlus)
            equipNode.addClick(() => {
                this.openEquipDetails(i)
            }, this)
            idx ++;
        });
        EventCenter.on(EventName.StartFight,this.startFight,this)
        EventCenter.on(EventName.FinishFight,this.finishFight,this)
    }

    startFight(data){
        this.node.active = false
    }

    finishFight(data){
        this.node.active = true
    }

    async onBtnAccumalute(){
        UIManager.openView(Constants.Panels.UIAccumulateReward);
    }

    async onBtnNotice(){
    }
    async onBtnAvatar(){
        UIManager.openView(Constants.Panels.UISetting);
    }

    async onBtnRank(){
        UIManager.openView(Constants.Panels.UIPowerRank);
    }

    async onBtnAddGold() {
        if(Constants.Evn != SERVER_Evn.product){
            UIManager.openView(Constants.Panels.UIGM)
        }
    }

    async showTips(){
        console.log("showTipsfsfasfa")
    }

    async onBtnDiamond() {
    }

    async onBtnDetail() {
        let accInfo = State.getState(Redux.ReduxName.user, "accInfo");
        let heroAttrs = accInfo.heroAttrs;
        UIManager.openView(Constants.Panels.UIAttribute,{attrs:heroAttrs})
    }

    async startGame() {
    }

    async onShow() {
        SoundMgr.inst.playMusic(SOUND_RES.MAIN);
        this.connectRedux();
        this.initView()
        // await Common.sleep(100)
        this.setTopMenuPos()
    }

    connectRedux() {
        Redux.Watch(this, Redux.ReduxName.user, "accInfo", (accInfo: PlayerInfo) => {
            console.log("watch accInfo ", accInfo)
            this.nick.string = accInfo.name ? accInfo.name : accInfo.uid
            this.Power.string = Math.floor(accInfo.battlePower)  + ""
            this.goldNum.string = Common.formatEngNumber(UserModel.getItemByType(ConstEnum.ItemType.GoldCoin), 2, false)
            this.diamondNum.string = Common.formatEngNumber(UserModel.getItemByType(ConstEnum.ItemType.GemCoin), 2, false)
            if(accInfo.avatar == ""){
                Common.setNodeImgSprite("headIcon/0", this.head,null, () => {});
            }else{
                if(accInfo.avatar.indexOf("img://") != -1){ //系统默认头像
                    let idxStr = accInfo.avatar.split("img://")[1]
                    let oriIdx = parseInt(idxStr)
                    Common.setNodeImgSprite("headIcon/"+oriIdx, this.head,null, () => {});
                }
            }
            if(accInfo.gift){
                if(accInfo.gift.accuHours > 0 ){
                    this.accumulateBtn.node.getComponent(Sprite).enabled = false
                    this.accumulateBtn.node.children[0].active = true
                }else {
                    this.accumulateBtn.node.getComponent(Sprite).enabled = true
                    this.accumulateBtn.node.children[0].active = false
                }
            }

            this.refreshLvExp(accInfo)
            this.initAttrs(accInfo.heroAttrs)
            this.initEquips(accInfo)
        });
    }

    async initView() {
        let frameSize = screen.windowSize;
        let ratio = frameSize.height/frameSize.width
        console.log("ratio==============="+ratio)
        if(ratio<1.49){
            let widget:Widget = this.topPanel.getComponent(Widget)
            widget.top = -140
            let widget2:Widget = this.topBtns.getComponent(Widget)
            widget2.top = 235
            let widget3:Widget = this.middlePanel.getComponent(Widget)
            widget3.top = 300
            
        }else if(ratio<1.6){
            let widget:Widget = this.topPanel.getComponent(Widget)
            widget.top = -140
            let widget2:Widget = this.topBtns.getComponent(Widget)
            widget2.top = 255
            let widget3:Widget = this.middlePanel.getComponent(Widget)
            widget3.top = 330
        }else if(ratio<2){
            let widget:Widget = this.topPanel.getComponent(Widget)
            widget.top = -120
            let widget2:Widget = this.topBtns.getComponent(Widget)
            widget2.top = 255
            let widget3:Widget = this.middlePanel.getComponent(Widget)
            widget3.top = 330
        }else{
            let widget:Widget = this.topPanel.getComponent(Widget)
            widget.top = -80
            let widget2:Widget = this.topBtns.getComponent(Widget)
            widget2.top = 265
            let widget3:Widget = this.middlePanel.getComponent(Widget)
            widget3.top = 350
        }
    }

    setTopMenuPos(){
        let topMenuPos = State.getState(Redux.ReduxName.global, "topMenuPos");
        let widget:Widget = this.topPanel.getComponent(Widget)
        console.log("widget.top="+widget.top)
        let delPos = new Vec3(0,-widget.top,0)
        let frameSize = screen.windowSize;
        let a = this.goldbox.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(0, 0, 0))
        console.log("a=",a)
        console.log("frameSize=",frameSize)
        topMenuPos.goldPos = this.goldbox.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(0, 0, 0)).add(delPos)
        topMenuPos.diamondPos = this.diamondBox.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(0, 0, 0)).add(delPos)
        topMenuPos.headPos = this.Avatar.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(0, 0, 0)).add(delPos)
        topMenuPos.expBarPos = this.expProBar.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(0, 0, 0)).add(new Vec3(this.expProBar.getComponent(UITransform).contentSize.width/2,0,0)).add(delPos)
        console.log("topMenupos=",top)
        Redux.State.dispatch({ type: Redux.ReduxName.global, topMenuPos });
    }

    refreshLvExp(accInfo) {
        let expcom =  this.expProBar.getComponent(ProgressBar);
        let lvCfg = ConfigHelper.getCfg("RoleLevelCfg", accInfo.lv)
        if(this.lastExp != null && this.lastExp != accInfo.exp)
        {
            if(this.lastLv != 0 && this.lastLv != accInfo.lv){
                tween(expcom).delay(2).to(.3,{progress:1}).call(() => {
                    UIManager.openView(Constants.Panels.UIEffect,{type:1});
                })
                .to(.3,{progress:accInfo.exp / lvCfg.exp}).call(() => {
                    this.lever.string = "Lv." + accInfo.lv
                    this.expProBar.progress = accInfo.exp / lvCfg.exp
                    this.expProLb.string = accInfo.exp + "/" + lvCfg.exp
                    this.lastExp = accInfo.exp;
                }).start();
            }
            else
            {
                tween(expcom).delay(3).to(.3,{progress:accInfo.exp / lvCfg.exp}).call(() => {
                    this.lever.string = "Lv." + accInfo.lv
                    this.expProBar.progress = accInfo.exp / lvCfg.exp
                    this.expProLb.string = accInfo.exp + "/" + lvCfg.exp
                    this.lastExp = accInfo.exp;
                }).start();
            }
            this.lastLv = accInfo.lv
        }
        else
        {
            this.lever.string = "Lv." + accInfo.lv
            this.expProBar.progress = accInfo.exp / lvCfg.exp
            this.expProLb.string = accInfo.exp + "/" + lvCfg.exp
            this.lastExp = accInfo.exp;
        }
    }

    initAttrs(atts) {
        //连击 击晕 暴击 闪避 反击 吸血
        this.Atk.string = atts[ConstEnum.AttrType.Attack] +""
        this.Def.string = atts[ConstEnum.AttrType.Defense] +""
        this.Hp.string = atts[ConstEnum.AttrType.HP] +""
        this.Speed.string = atts[ConstEnum.AttrType.Speed] +""
        this.DblAttackRate.string = atts[ConstEnum.AttrType.ComboRate] +"%"
        this.DizzyRate.string = atts[ConstEnum.AttrType.StunRate] +"%"
        this.TrumpRate.string = atts[ConstEnum.AttrType.TrumpDmgRate] +"%"
        this.DodgeRate.string = atts[ConstEnum.AttrType.DodgeRate] +"%"
        this.CounterRate.string = atts[ConstEnum.AttrType.CounterRate] +"%"
        this.BloodRate.string = atts[ConstEnum.AttrType.BloodRate] +"%"
    }

    initEquips(accInfo: PlayerInfo) {
        let equips = accInfo.equips
        equips.forEach(ele => {
            let info = ele as EquipInfo
            if (info != null && info.equipId != 0) {
                let equip = ConfigHelper.getCfg("EquipCfg", info.equipId)
                if (equip.equipId) {

                }
                let euqipItem = this.equips.children[equip.part - 1]
                let empty = euqipItem.children[0]
                empty.active = false

                let item = euqipItem.children[1]
                item.active = true
                let itemLv = item.children[1].getComponent(Label)
                let lv = info.lv
                if(lv == null){
                    lv = 1
                }
                itemLv.string = "LV."+lv
                let icon = item.children[0]
                let imgUrl = "gameRes/" + equip.imageId
                Common.setNodeImgSprite(imgUrl, icon, null, () => {
                })
                this.setEquipBg(item,equip.quality)
            }
        });
    }

    async setEquipBg(node:Node,quality){
        let quaUrl = "quality/" + quality
        Common.setNodeImgSprite(quaUrl, node, null, () => {
        })
        let spineNode = node.children[2]
        if(quality>=6){
            spineNode.active = true
            let aniUrl = "uiEffect/zhuangbeikuang"
            let aniName = "caihongfen"
            if(quality == 6){
                aniName = "hongse"
            }else if(quality == 7){
                aniName = "huangse"
            }else if(quality == 8){
                aniName = "lanse"
            }else if(quality == 9){
                aniName = "caihongfen"
            }
            console.log("setEquipBg aniName="+aniName)
			Common.setNodeSpine(aniUrl, spineNode, () => {
                let spine = spineNode.getComponent(sp.Skeleton)
                spine.premultipliedAlpha = false
                spine.paused = false
                // spine.enabled = true
				spine.setAnimation(0, aniName, true);
			});
        }else{
            let spine = spineNode.getComponent(sp.Skeleton)
            spine.paused = true
            // spine.enabled = false
            // Common.unloadSkeNode(node)
            spineNode.active = false
        }
    }

    openEquipDetails(idx) {
        let accInfo = State.getState(Redux.ReduxName.user, "accInfo");
        let equip = accInfo.equips[idx]
        if(equip != null){
            UIManager.openView(Constants.Panels.UIEquipDetails, { equipInfo: equip })
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
        UIManager.openView(Constants.Panels.UINewEquip, { oldEquip, newEquip })
    }
  

    getEquip() {
        ChestModel.openChest()
    }

    onHide() {
        console.log('onHide');
    }

    onDestroy() {
        console.log('destory');
        // 这里可以执行你的销毁操作, 在该窗体执行destory时, 会先调用onDestory方法
    }
}