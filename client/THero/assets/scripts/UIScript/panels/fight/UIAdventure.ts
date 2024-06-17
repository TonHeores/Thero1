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
import State from "../../../redux/state";
import Redux from "../../../redux";
import { AttrInfo, PlayerInfo } from "../../../utils/pomelo/DataDefine";
import { ConfigHelper } from "../../../utils/ConfigHelper";
import FightUtil from "../../../../battle/FightUtil";
import FightMode from "../../../model/FightMode";
const { ccclass } = _decorator;
@ccclass
export default class UIAdventure extends UIBase {
    formType = FormType.PopUp;
    canDestory = false
    static prefabPath = "fight/UIAdventure";
    maskType = new MaskType(ModalOpacity.OpacityHigh, false);
    @bindComp("ButtonPlus")
    public btn_close: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public btn_challenge: ButtonPlus = null;
    @bindComp("cc.Label")
    public Power: Label = null;
    @bindComp("cc.Label")
    public conditionslb: Label = null;
    @bindComp("cc.Label")
    public stageLv: Label = null;
    
    @bindComp("cc.Node")
    public rewardItem: Node = null;
    @bindComp("cc.Node")
    public rewards: Node = null;
    @bindComp("cc.Node")
    public gradRewards: Node = null;
    @bindComp("cc.Node")
    public monster: Node = null;

    petDic = {}
    onLoad() {
        this.listenEvent();
    }

    connectRedux() {
        Redux.Watch(this, Redux.ReduxName.user, "accInfo", (userInfo: any) => {
            this.initView()
        });
    }

    listenEvent() {
        this.connectRedux()
        this.btn_close.addClick(() => {
            this.onClickClose()
        }, this);
        this.btn_challenge.addClick(async () => {
            FightMode.matchFightLevel()
        }, this);
    }

    async onShow() {
        this.connectRedux()
    }

    async initView() {
        let accInfo:PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
        console.log("accInfo========",accInfo)
        let mCfg = ConfigHelper.getCfg("MatchInfoCfg",accInfo.curMatchLv)
        let chapterCfg = ConfigHelper.getCfg("MatchChapterCfg",mCfg.chapter)
        this.rewards.removeAllChildren()
        this.gradRewards.removeAllChildren()

        mCfg.rewardInfos.forEach(element => {
            let itemNode = instantiate(this.rewardItem);
            let icon = itemNode.children[0]
            let imgUrl = "itemRes/item" + element.type
            Common.setNodeImgSprite(imgUrl, icon, null, () => {
            })
            let numLb = itemNode.children[1].getComponent(Label)
            numLb.string = element["count"]+""
            itemNode.active = true;
            this.rewards.addChild(itemNode)
        });
        
        chapterCfg.rewardInfos.forEach(element => {
            let itemNode = instantiate(this.rewardItem);
            let icon = itemNode.children[0]
            let imgUrl = "itemRes/item" + element.type
            Common.setNodeImgSprite(imgUrl, icon, null, () => {
            })
            let numLb = itemNode.children[1].getComponent(Label)
            numLb.string = element["count"]+""
            itemNode.active = true;
            this.gradRewards.addChild(itemNode)
        });
        let chapterLv = (accInfo.curMatchLv-1)%10+1
        this.stageLv.string = mCfg.chapter+"-"+chapterLv
        let idx = 1
        let arr = []
        mCfg.heroAttrs.forEach(element => {
            let info = new AttrInfo()
            info.attrVal = element
            info.attrId = idx
            arr.push(info)
            idx++
        });
        this.Power.string = Common.computeFightPower(arr) +""
        let lastLv = mCfg.chapter+"-"+ 10
        this.conditionslb.string = Ext.i18n.t("UI_Adventure_02_003").replace("{0#}",lastLv)
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
    }
}