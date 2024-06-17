import Constants, { SceneName } from "../../../Constant";
import { _decorator, EditBox, sys, Node, Label, native, UITransform, Vec2, Vec3, tween, instantiate, } from "cc";
import { UIManager, FormType, UIBase, ButtonPlus, bindComp, EventCenter, ModalOpacity } from "../../../UIFrame/indexFrame";
import { Ext, HttpNet, NativeMgr } from "../../../utils/indexUtils";
import Common from "../../../utils/common";
import SeverConfig, { SERVER_OPT } from "../../../SeverConfig";
import { GameRoot } from "../../../manager/GameRoot";
import { MainScene } from "../../../scene/MainScene";
import { MaskType } from "../../../UIFrame/UIBase";
import FightMgr from "../../../module/fight/FightMgr";
import { ConfigHelper } from "../../../utils/ConfigHelper";
import SoundMgr from "../../../UIFrame/SoundMgr";
import { SOUND_RES } from "../../../config/basecfg";
const { ccclass } = _decorator;
@ccclass
export default class UIFightResult extends UIBase {
    formType = FormType.PopUp;
    canDestory = false
    static prefabPath = "fight/UIFightResult";
    maskType = new MaskType(ModalOpacity.OpacityHigh, false);
    @bindComp("ButtonPlus")
    public box: ButtonPlus = null;
    @bindComp("cc.Node")
    public win: Node = null;
    @bindComp("cc.Node")
    public lost: Node = null;
    @bindComp("cc.Node")
    public rewardItem: Node = null;
    @bindComp("cc.Node")
    public rewards: Node = null;
    gameAccTime = 1
    stateTimer = null
    loadPetNum = 0
    haveLoadPetNum = 0

    petDic = {}
    onLoad() {
        this.listenEvent();
    }
    listenEvent() {
        this.box.addClick(() => {
            this.onClickClose()
        }, this);
    }

    onBtnClose() {

    }
    async onShow() {
        this.initView()
    }

    async initView() {
        let winner = FightMgr.getInstance().getWinner()
        if (winner == 1) {
            this.win.active = true
            this.lost.active = false
            this.showRewards()
            SoundMgr.inst.playEffect(SOUND_RES.Win)
        } else {
            this.win.active = false
            this.lost.active = true
            SoundMgr.inst.playEffect(SOUND_RES.Lose)
        }
    }

    showRewards() {
        let rewards = FightMgr.getInstance().getRewardInfo()
        console.log("rewards========",rewards)
        if (rewards && rewards.length > 0) {
            this.rewards.removeAllChildren()

            rewards.forEach(element => {
                let itemNode = instantiate(this.rewardItem);
                let icon = itemNode.children[0]
                let imgUrl = "itemRes/item" + element.type
                Common.setNodeImgSprite(imgUrl, icon, null, () => {
                })
                let numLb = itemNode.children[1].getComponent(Label)
                numLb.string = element["count"] + ""
                itemNode.active = true;
                this.rewards.addChild(itemNode)
            });
        }
    }



    onHide() {
        console.log('onHide');
    }
    onDestroy() {
        console.log('destory');
        // 这里可以执行你的销毁操作, 在该窗体执行destory时, 会先调用onDestory方法
    }
    async onClickClose() {
        this.closeUIForm();
        UIManager.closeView(Constants.Panels.UIFight)
        // UIManager.openView(Constants.Panels.UIMainMenu)
    }
}