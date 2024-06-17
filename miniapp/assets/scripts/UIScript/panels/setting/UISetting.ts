
import { _decorator, Node, sys, Slider, UITransform, Label, ProgressBar, ToggleContainer, Toggle, Sprite, color } from "cc";
import { ButtonPlus, EventCenter, FormType, ModalOpacity, UIBase, UIManager, bindComp } from "../../../UIFrame/indexFrame";
import { MaskType } from "../../../UIFrame/UIBase";
import Redux from "../../../redux";
import Constants, { EventName } from "../../../Constant";
import { Common, Ext } from "../../../utils/indexUtils";
import SoundMgr from "../../../UIFrame/SoundMgr";
import { UIEditname } from "../../indexPrefab";
import { GameRoot } from "../../../manager/GameRoot";
import { ConfigHelper } from "../../../utils/ConfigHelper";
import { PlayerInfo, SysSettingType } from "../../../utils/pomelo/DataDefine";
import { LangTxt } from "../../../config/basecfg";
import UserModel from "../../../model/UserModel";
import ConstEnum from "../../../utils/EnumeDefine";
import PlatformMgr from "../../../platform/PlatformMgr";
import GameUtils from "../../../utils/GameUtils";

const { ccclass } = _decorator;

// 操作类型
type OperatingMode = "mouse" | "rocker";

@ccclass
export default class UISetting extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, false);
    static prefabPath = "setting/UISetting";
    // 关闭按钮
    @bindComp('ButtonPlus')
    closeBtn: ButtonPlus;
    @bindComp('cc.Node')
    userPanel: Node;
    @bindComp('cc.Node')
    setPanel: Node;
    
    @bindComp('ButtonPlus')
    selectSvrBtn: ButtonPlus;
    @bindComp('ButtonPlus')
    avatarBtn: ButtonPlus;
    @bindComp('ButtonPlus')
    announceBtn: ButtonPlus;
    @bindComp('ButtonPlus')
    delBtn: ButtonPlus;
    @bindComp('ButtonPlus')
    changeNickBtn: ButtonPlus;
    @bindComp('ButtonPlus')
    lanBtn: ButtonPlus;
    @bindComp('ButtonPlus')
    changeGenderBtn: ButtonPlus;
    @bindComp("cc.ToggleContainer")
    pageBtns: ToggleContainer
    @bindComp("ButtonPlus")
    musicSwitch: ButtonPlus;
    @bindComp("ButtonPlus")
    effectSwitch: ButtonPlus;
    @bindComp("cc.Node")
    public musicBtn: Node = null;  
    @bindComp("cc.Node")
    public effectBtn: Node = null;  
    @bindComp("cc.Label")
    public musicLb: Label = null;  
    @bindComp("cc.Label")
    public effectLb: Label = null;  
    @bindComp('cc.Node')
    musicCheck: Node;
    @bindComp('cc.Node')
    effectCheck: Node;
    @bindComp('cc.Node')
    genderIcon: Node;
    
    @bindComp("cc.Label")
    public level: Label = null;  // 等级
    @bindComp("cc.Label")
    public nick: Label = null;  // 昵称
    @bindComp("cc.Label")
    public userId: Label = null;  // 昵称
    @bindComp("cc.Node")
    public noSex: Node = null;  // 
    @bindComp("cc.Node")
    public head: Node = null;  // 
    @bindComp("cc.Label")
    public server: Label = null;  // 
    @bindComp("cc.Label")
    public curLang: Label = null;  // 
    
    private selectType = 0
    private isOpenMusic = false
    private isOpenEffect = false

    start() {
        this.pageBtns.toggleItems.forEach(element => {
            if (element.node.name == this.selectType + "") {
                element.isChecked = true
            }
        });
    }

    connectRedux() {
        Redux.Watch(this, Redux.ReduxName.user, "accInfo", (accInfo: PlayerInfo) => {
            console.log("watch accInfo " ,accInfo)
            this.nick.string = accInfo.name
            this.level.string = accInfo.lv+""
            this.userId.string = "UID:"+accInfo.uid
            if(accInfo.gender){
                this.genderIcon.active = true
                this.noSex.active = false
                let url = "common/ui_icon_boy"
                if(accInfo.gender == 2){
                    url = "common/ui_icon_girl"
                    this.genderIcon.getComponent(Sprite).color = color(236, 93, 115);
                }else{
                    this.genderIcon.getComponent(Sprite).color = color(67, 125, 163);
                }
                Common.setNodeImg(url,this.genderIcon)
                
            }else{
                this.genderIcon.active = false
                this.noSex.active = true
            }
            GameUtils.setHeadImg(accInfo.avatar ,this.head)
        });
    }

    onInit() {
        this.connectRedux();
        this.listenEvent();
    }

    onShow() {
        this.selectType = 0
        let volumn = SoundMgr.inst.getVolume()
        if(volumn.effectVolume == 0){
            this.isOpenEffect = false
        }else{
            this.isOpenEffect = true
        }
        if(volumn.musicVolume == 0){
            this.isOpenMusic = false
        }else{
            this.isOpenMusic = true
        }
        this.refreshCurLang()
        this.refreshMusicBtn()
        this.refreshEffectBtn()
        this.switchPanel()
    }

    refreshMusicBtn(){
        if(this.isOpenMusic){
            this.musicLb.string = Ext.i18n.t("UI_PlayerInfo_02_006")
            this.musicCheck.active = true
            Common.setPositionX(this.musicBtn,45)
        }else{
            this.musicLb.string = Ext.i18n.t("UI_PlayerInfo_02_007")
            this.musicCheck.active = false
            Common.setPositionX(this.musicBtn,-45)
        }
    }

    refreshEffectBtn(){
        if(this.isOpenEffect){
            this.effectLb.string = Ext.i18n.t("UI_PlayerInfo_02_006")
            this.effectCheck.active = true
            Common.setPositionX(this.effectBtn,45)
        }else{
            this.effectLb.string = Ext.i18n.t("UI_PlayerInfo_02_007")
            this.effectCheck.active = false
            Common.setPositionX(this.effectBtn,-45)
        }
    }

    listenEvent(){
        this.closeBtn.addClick(()=>{
            this.closeUIForm();
        }, this);
        this.pageBtns.node.children.forEach(element => {
            element.on("toggle", this.radioButtonClicked, this)
        });
        this.selectSvrBtn.addClick(()=>{
            PlatformMgr.TGOpenTgLink("/TonHeroesTestBot?start=invite");
            PlatformMgr.getCurPlatForm().closeGame()
        }, this);
        this.announceBtn.addClick(()=>{
            PlatformMgr.TGOpenUrlLink("https://t.me/TonHeroesTestBot?start=invite");
            PlatformMgr.getCurPlatForm().closeGame()
        }, this);
        this.delBtn.addClick(()=>{
            UIManager.showTip(2,Ext.i18n.t("UI_Details_01_032"),Ext.i18n.t("UI_PlayerInfo_01_008")+"?",()=>{
                UserModel.roleDelete()
            })
        }, this);
        this.lanBtn.addClick(()=>{
            UIManager.openView(Constants.Panels.UILanguage)
        }, this);
        this.changeNickBtn.addClick(()=>{
            UIManager.openView(Constants.Panels.UIEditname)
        }, this);
        this.changeGenderBtn.addClick(()=>{
            UIManager.openView(Constants.Panels.UIEditGender)
        }, this);
        this.avatarBtn.addClick(()=>{
            UIManager.openView(Constants.Panels.UIEditAvatar)
        }, this);
        this.musicSwitch.addClick(this.toggleMusic, this);
        this.effectSwitch.addClick(this.toggleEffect, this);
        EventCenter.on(EventName.ChangeLang, this.onChangeLang, this);
    }

    onChangeLang() {
        console.log("onChangeLang")
        this.refreshCurLang()
    }

    refreshCurLang(){
        let toLang = Ext.i18n._language
        console.log("refreshCurLang toLang="+toLang)
        console.log(LangTxt)
        this.curLang.string = LangTxt[toLang]+""
        this.refreshMusicBtn()
        this.refreshEffectBtn()
    }

    toggleMusic() {
        this.isOpenMusic = !this.isOpenMusic
        if(this.isOpenMusic){
            SoundMgr.inst.setMusicVolume(1)
            UserModel.setSysSetting(SysSettingType.Music,1)
        }else{
            SoundMgr.inst.setMusicVolume(0)
            UserModel.setSysSetting(SysSettingType.Music,0)
        }
        this.refreshMusicBtn()
    }

    toggleEffect() {
        this.isOpenEffect = !this.isOpenEffect
        if(this.isOpenEffect){
            SoundMgr.inst.setEffectVolume(1)
            UserModel.setSysSetting(SysSettingType.Sound,1)
        }else{
            SoundMgr.inst.setEffectVolume(0)
            UserModel.setSysSetting(SysSettingType.Sound,0)
        }
        this.refreshEffectBtn()
    }

    radioButtonClicked(toggle) {
        if(!toggle.isChecked){
            return
        }
        let newType = parseInt(toggle.node.name)
        if (this.selectType == newType) {
            return
        }
        this.selectType = newType;
        this.switchPanel();
    }

    switchPanel(){
        //setting不分页
        // if(this.selectType == 0){
        //     this.userPanel.active = true
        //     this.setPanel.active = false
        // }else{
        //     this.userPanel.active = false
        //     this.setPanel.active = true
        // }
    }
}
