import { _decorator, Component, Label, Node } from 'cc';
import { bindComp, ButtonPlus, FormType, ModalOpacity, UIBase, UIListView, UIManager } from '../../../UIFrame/indexFrame';
import { MaskType } from '../../../UIFrame/UIBase';
import Constants, { SERVER_Evn } from '../../../Constant';
import Redux from '../../../redux';
import RankModel from '../../../model/RankModel';
import State from '../../../redux/state';
import { PlayerInfo } from '../../../utils/pomelo/DataDefine';
import { Common } from '../../../utils/indexUtils';
import PlatformMgr from '../../../platform/PlatformMgr';
const { ccclass, property } = _decorator;

@ccclass('UIInvite')
export default class UIInvite extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, false);
    static prefabPath = "popup/UIInvite";
    @bindComp("ButtonPlus")
    public btn_close: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public btn_invite: ButtonPlus = null;
    @bindComp("cc.Label")
    public addNum: Label = null;

    onInit() {
        this.btn_close.addClick(this.onBtnClose,this);
        this.btn_invite.addClick(this.onBtnInvite,this);
    }

    onShow() {
    }

    connectRedux() {
    }

    onBtnInvite(){
        //ton_hero_game_bot 正式
        //TonHeroesTestBot 测试
        // PlatformMgr.TGOpenUrlLink("https://t.me/TonHeroesTestBot?start=invite");
        // PlatformMgr.TGOpenTgLink("/TonHeroesTestBot?start=invite");
        
        if (Constants.Evn == SERVER_Evn.product) {
            PlatformMgr.TGOpenTgLink("/TonHeroesBot?start=invite");
        }else{
            PlatformMgr.TGOpenTgLink("/TonHeroesTestBot?start=invite");
        }
        PlatformMgr.getCurPlatForm().closeGame()
    }

    onBtnClose(){
        this.closeUIForm()
    }
}


