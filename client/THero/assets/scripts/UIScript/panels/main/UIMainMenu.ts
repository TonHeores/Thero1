import Constants, { EventName, SceneName } from "../../../Constant";
import { _decorator, EditBox, sys, Node, Label, native, ProgressBar, tween, Vec3, Button, Component, view, screen, Widget, instantiate, Animation, } from "cc";
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
const { ccclass } = _decorator;
@ccclass
export default class UIMainMenu extends UIBase {
    formType = FormType.Screen;
    canDestory = true;
    static canRecall = true;
    static prefabPath = "main/UIMainMenu";
    @bindComp("cc.Node")
    public topPanel: Node = null;
    @bindComp("cc.Node")
    public middlePanel: Node = null;
    @bindComp("cc.Node")
    public botPanel: Node = null;
    @bindComp("ButtonPlus")
    public addGoldBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public addDiamondBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public detailBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public advBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public fightBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public boxBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public boxLvBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public Avatar: ButtonPlus = null;
    
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
    public boxNum: Label = null;  // 宝箱数
    @bindComp("cc.Label")
    public boxLv: Label = null;  // 宝箱等级
    @bindComp("cc.Label")
    public leftTime: Label = null;  // 倒计时

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
    public boxRed: Node = null;
    @bindComp("cc.Node")
    public equips: Node = null;
    @bindComp("cc.Node")
    public boxIcon: Node = null;
    @bindComp("cc.Node")
    public head: Node = null;
    @bindComp("cc.Node")
    public equipItem: Node = null;
    @bindComp("cc.Node")
    public coin: Node = null;

    private equipUIPos = {}
    private curEquip: EquipInfo = null
    private isFirstOpen = true
    private coinNumber:number = 0;
    private timer:number = -1;
    onInit() {
        this.listenEvent()
        this.initEquipUIPos()
        this.equipItem.active = false;
        this.isFirstOpen = true
        EventCenter.on(EventName.SellEquip,this.showCoinAni,this);
    }

    listenEvent() {
        this.addGoldBtn.addClick(this.onBtnAddGold, this)
        this.addDiamondBtn.addClick(this.onBtnDiamond, this)
        this.detailBtn.addClick(this.onBtnDetail, this)
        this.advBtn.addClick(this.onBtnAdv, this)
        this.fightBtn.addClick(this.onBtnFight, this)
        this.boxLvBtn.addClick(this.onBtnBoxLv, this)
        this.Avatar.addClick(this.onBtnAvatar, this)
        this.boxIcon.getComponent(ButtonPlus).addClick(this.onBtnBox, this)
        
        let idx = 1;
        this.equips.children.forEach(element => {
            let i = idx
            let equipNode = element.getComponent(ButtonPlus)
            equipNode.addClick(() => {
                this.openEquipDetails(i)
            }, this)
            idx ++;
        });
    }

    initEquipUIPos() {
        this.equipUIPos[ConstEnum.EquipPos.Shoulder] = 1
        this.equipUIPos[ConstEnum.EquipPos.Helmet] = 2
        this.equipUIPos[ConstEnum.EquipPos.Necklace] = 3
        this.equipUIPos[ConstEnum.EquipPos.Wrist] = 4
        this.equipUIPos[ConstEnum.EquipPos.Armor] = 5
        this.equipUIPos[ConstEnum.EquipPos.Glove] = 6
        this.equipUIPos[ConstEnum.EquipPos.Belt] = 7
        this.equipUIPos[ConstEnum.EquipPos.Trousers] = 8
        this.equipUIPos[ConstEnum.EquipPos.Weapon] = 9
        this.equipUIPos[ConstEnum.EquipPos.Jewelry] = 10
        this.equipUIPos[ConstEnum.EquipPos.Shoes] = 11
        this.equipUIPos[ConstEnum.EquipPos.Shield] = 12
        this.equipUIPos[ConstEnum.EquipPos.Mount] = 13
        this.equipUIPos[ConstEnum.EquipPos.Scroll] = 14
        this.equipUIPos[ConstEnum.EquipPos.Wing] = 15
        this.equipUIPos[ConstEnum.EquipPos.Pets] = 16
        this.equipUIPos[ConstEnum.EquipPos.Avatar] = 17
        this.equipUIPos[ConstEnum.EquipPos.Gemstone] = 18
        this.equipUIPos[ConstEnum.EquipPos.Artifact] = 19
    }

    async onBtnBoxLv() {
        UIManager.openView(Constants.Panels.UIChestLvInfo);
    }

    async onBtnAvatar(){
        UIManager.openView(Constants.Panels.UISetting);
    }

    async onBtnBox() {
        if (this.curEquip == null)
            this.openBox()
        else {
            this.compareEquip()
        }
    }

    async onBtnAddGold() {
        UIManager.openView(Constants.Panels.UIGM)
        // if(!GameUtils.checkRemeberIsValid(CHECK_KEY.TEST)){
        //     console.log("之前没记住")
        //     UIManager.showTip(2,"title","测试",()=>{
        //         console.log("confirm")
        //     },(isCheck)=>{
        //         console.log("isCheck===="+isCheck)
        //         if(isCheck){
        //             GameUtils.saveCheckRemenber(CHECK_KEY.TEST)
        //         }
        //     },)
        // }else{
        //     console.log("之前有记住,不用弹窗")
        // }
    }

    async showTips(){
        console.log("showTipsfsfasfa")
    }

    async onBtnDiamond() {
    }

    async onBtnDetail() {
        UIManager.openView(Constants.Panels.UIAttribute)
    }

    async onBtnAdv() {
        UIManager.openView(Constants.Panels.UIAdventure);
    }

    async onBtnFight() {
        
    }

    async startGame() {
    }

    async onShow() {
        this.connectRedux();
        this.initView()
    }

    connectRedux() {
        Redux.Watch(this, Redux.ReduxName.user, "accInfo", (accInfo: PlayerInfo) => {
            console.log("watch accInfo ", accInfo)
            this.nick.string = accInfo.name
            this.Power.string = Math.floor(accInfo.battlePower)  + ""
            this.goldNum.string = Common.formatEngNumber(UserModel.getItemByType(ConstEnum.ItemType.GoldCoin), 2, false)
            this.diamondNum.string = Common.formatEngNumber(UserModel.getItemByType(ConstEnum.ItemType.GemCoin), 2, false)
            this.refreshLvExp(accInfo)
            this.refreshBoxInfo(accInfo)
            this.initAttrs(accInfo.heroAttrs)
            this.initEquips(accInfo)
        });

        Redux.Watch(this, Redux.ReduxName.user, "myTs", (myTs) => {
            this.refreshBoxGenTime()
        });
    }

    refreshBoxGenTime(){
        let { chestAutoAddTs } = UserModel.countDownObj
        if (chestAutoAddTs > 0) {
            this.leftTime.string = Common.getLeftTime(chestAutoAddTs)
        } else {
            this.leftTime.string = "00:00:00"
        }
    }

    async initView() {
        let frameSize = screen.windowSize;
        if(frameSize.height/frameSize.width<1.8){
            let widget:Widget = this.middlePanel.getComponent(Widget)
            widget.top = 325
            let widget2:Widget = this.botPanel.getComponent(Widget)
            widget2.bottom = -AdapterMgr.safeBot
        }else{
            let widget:Widget = this.middlePanel.getComponent(Widget)
            widget.top = 400
            let widget2:Widget = this.botPanel.getComponent(Widget)
            widget2.bottom = 0
        }
    }

    refreshLvExp(accInfo) {
        this.lever.string = "Lv." + accInfo.lv
        let lvCfg = ConfigHelper.getCfg("RoleLevelCfg", accInfo.lv)
        this.expProBar.progress = accInfo.exp / lvCfg.exp
        this.expProLb.string = accInfo.exp + "/" + lvCfg.exp
    }

    refreshBoxInfo(accInfo) {
        let chestNum = UserModel.getItemByType(ConstEnum.ItemType.ChestCount)
        this.boxLv.string = "Lv." + accInfo.chestLevel
        this.boxNum.string = chestNum + "/50"
        //检测金币是否够升级
        let gold = UserModel.getItemByType(ConstEnum.ItemType.GoldCoin)
        let lvCfg = ConfigHelper.getCfg("ChestLevelCfg", accInfo.chestLevel)
        if (gold >= lvCfg.cost) { //可升级 显示红点
            this.boxRed.active = true
        } else {
            this.boxRed.active = false
        }

        //查看是否有未处理的装备
        if (!this.isFirstOpen) {
            if (this.curEquip == null && accInfo.curEquip != null) {
                console.log("initEquips2")
                //有新装备
                this.compareEquip()
            }
        }
        this.curEquip = accInfo.curEquip
        if (this.curEquip != null) {
            this.setCurEquipItem()
        } else {
            this.setBoxClose()
            this.equipItem.active = false;
        }
        this.isFirstOpen = false
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
                let quaUrl = "quality/" + equip.quality
                Common.setNodeImgSprite(quaUrl, item, null, () => {
                })
            }
        });
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

    async openBox() {
        let angle = 10;
        let tw1 = tween().to(0.1, { eulerAngles: new Vec3(0, 0, angle) }, { easing: 'cubicOut' })
        let tw2 = tween().to(0.1, { eulerAngles: new Vec3(0, 0, -angle) }, { easing: 'cubicOut' })
        let tw3 = tween().to(0.1, { eulerAngles: new Vec3(0, 0, 0) }, { easing: 'cubicOut' })
        await CocosHelper.runTweenSync(this.boxIcon, tw1, tw2, tw1, tw2, tw1, tw2, tw3);
        this.getEquip()
    }

    setBoxClose() {
        //设置宝箱为开启状态
        let boxOpenUrl = "main/box_close"
        Common.setNodeImgSprite(boxOpenUrl, this.boxIcon, null, () => {
        })
        this.equipItem.active = false
    }

    setBoxOpen() {
        //设置宝箱为开启状态
        let boxOpenUrl = "main/box_open"
        Common.setNodeImgSprite(boxOpenUrl, this.boxIcon, null, () => {
        })
    }

    getEquip() {
        ChestModel.openChest()
    }

    setCurEquipItem() {
        this.setBoxOpen()
        this.equipItem.active = true;
        let equipId: number = this.curEquip.equipId
        let equip = ConfigHelper.getCfg("EquipCfg", equipId)
        let icon = this.equipItem.children[0]
        let imgUrl = "gameRes/" + equip.imageId
        Common.setNodeImgSprite(imgUrl, icon, null, () => {
        })
        let quaUrl = "quality/" + equip.quality
        Common.setNodeImgSprite(quaUrl, this.equipItem, null, () => {
        })
        let itemLv = this.equipItem.children[1].getComponent(Label)
        itemLv.string = "LV."+this.curEquip.lv
    }

    showCoinAni(){
        this.timer = setInterval(()=>{
            if(UIManager.getInstance().checkUIFormIsShowingByPanel(Constants.Panels.UINewEquip)) return;
           let node = instantiate(this.coin);
           let dir = Math.random() > 0.5 ? 1 : -1;
           this.coin.scale = new Vec3(dir,1,1)
           node.position = new Vec3(node.position.x + (dir * Math.random()*200),node.position.y+ (Math.random()*50),node.position.z);

           const animation = node.children[0].getComponent(Animation);
           animation.on(Animation.EventType.FINISHED, (type,state)=>{
               this.onTriggered(type,state,node)
           }, this)
           node.active = true;
           this.botPanel.parent = this.node;
           this.botPanel.addChild(node);
           this.coinNumber++
           if(this.coinNumber>6)
           {
               clearInterval(this.timer);
               this.timer = -1;
               this.coinNumber = 0;
           }
       },20)
   }

   public onTriggered(type: Animation.EventType, state, node) {
       this.botPanel.removeChild(node);
   }

    onHide() {
        console.log('onHide');
    }

    onDestroy() {
        console.log('destory');
        this.isFirstOpen = true
        // 这里可以执行你的销毁操作, 在该窗体执行destory时, 会先调用onDestory方法
    }
}