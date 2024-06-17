
import { _decorator, Node, sys, Slider, UITransform, Label, ProgressBar, ToggleContainer, Toggle } from "cc";
import { ButtonPlus, EventCenter, FormType, ModalOpacity, UIBase, UIManager, bindComp } from "../../../UIFrame/indexFrame";
import { MaskType } from "../../../UIFrame/UIBase";
import Redux from "../../../redux";
import Constants from "../../../Constant";
import { Common, Ext } from "../../../utils/indexUtils";
import SoundMgr from "../../../UIFrame/SoundMgr";
import { UIEditname } from "../../indexPrefab";
import { GameRoot } from "../../../manager/GameRoot";
import { ConfigHelper } from "../../../utils/ConfigHelper";
import { PlayerInfo } from "../../../utils/pomelo/DataDefine";

const { ccclass } = _decorator;

// 操作类型
type OperatingMode = "mouse" | "rocker";

@ccclass
export default class UISetting extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, false);
    static prefabPath = "popup/UISetting";
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
    announceBtn: ButtonPlus;
    @bindComp('ButtonPlus')
    delBtn: ButtonPlus;
    @bindComp('ButtonPlus')
    changeNickBtn: ButtonPlus;
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
                }
                Common.setNodeImg(url,this.genderIcon)
            }else{
                this.genderIcon.active = false
                this.noSex.active = true
            }
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
        this.refreshMusicBtn()
        this.refreshEffectBtn()
        this.switchPanel()
        this.refreshView()
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

    refreshView(){

    }

    listenEvent(){
        this.closeBtn.addClick(()=>{
            this.closeUIForm();
        }, this);
        this.pageBtns.node.children.forEach(element => {
            element.on("toggle", this.radioButtonClicked, this)
        });
        this.selectSvrBtn.addClick(()=>{
        }, this);
        this.announceBtn.addClick(()=>{
        }, this);
        this.delBtn.addClick(()=>{
        }, this);
        this.changeNickBtn.addClick(()=>{
            UIManager.openView(Constants.Panels.UIEditname)
        }, this);
        this.changeGenderBtn.addClick(()=>{
            UIManager.openView(Constants.Panels.UIEditGender)
        }, this);
        this.musicSwitch.addClick(this.toggleMusic, this);
        this.effectSwitch.addClick(this.toggleEffect, this);
    }

    toggleMusic() {
        this.isOpenMusic = !this.isOpenMusic
        if(this.isOpenMusic){
            SoundMgr.inst.setMusicVolume(1)
        }else{
            SoundMgr.inst.setMusicVolume(0)
        }
        this.refreshMusicBtn()
    }

    toggleEffect() {
        this.isOpenEffect = !this.isOpenEffect
        if(this.isOpenEffect){
            SoundMgr.inst.setEffectVolume(1)
        }else{
            SoundMgr.inst.setEffectVolume(0)
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
        if(this.selectType == 0){
            this.userPanel.active = true
            this.setPanel.active = false
        }else{
            this.userPanel.active = false
            this.setPanel.active = true
        }
    }
}
