import { _decorator, Component, instantiate, Label, Node } from 'cc';
import { bindComp, FormType, ModalOpacity, UIBase, UIManager } from '../../../UIFrame/indexFrame';
import { MaskType } from '../../../UIFrame/UIBase';
import State from '../../../redux/state';
import Redux from '../../../redux';
import { Common } from '../../../utils/indexUtils';
import Constants from '../../../Constant';
import ArenaModel from '../../../model/ArenaModel';
const { ccclass, property } = _decorator;

@ccclass('UIArenaFightResult')
export class UIArenaFightResult extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, true);
    canDestory = true;
    static canRecall = true;
    static prefabPath = "arena/UIArenaFightResult";
    @bindComp("cc.Node")
    public defeatNode: Node = null;
    @bindComp("cc.Node")
    public victoryNode: Node = null;
    @bindComp("cc.Node")
    public defeatPlayername1: Node = null;
    @bindComp("cc.Node")
    public defeatPlayername2: Node = null;
    @bindComp("cc.Node")
    public defeatScore1: Node = null;
    @bindComp("cc.Node")
    public defeatScore2: Node = null;
    @bindComp("cc.Node")
    public defeatDiffScore1: Node = null;
    @bindComp("cc.Node")
    public defeatDiffScore2: Node = null;
    @bindComp("cc.Node")
    public rewardList: Node = null;
    @bindComp("cc.Node")
    public itemReward: Node = null;

    @bindComp("cc.Node")
    public victoryPlayername1: Node = null;
    @bindComp("cc.Node")
    public victoryPlayername2: Node = null;
    @bindComp("cc.Node")
    public victoryScore1: Node = null;
    @bindComp("cc.Node")
    public victoryScore2: Node = null;
    @bindComp("cc.Node")
    public victoryDiffScore1: Node = null;
    @bindComp("cc.Node")
    public victoryDiffScore2: Node = null;


    async onShow(param) {
        let accInfo = State.getState(Redux.ReduxName.user, "accInfo");
        let fighInfo = State.getState(Redux.ReduxName.arena, "fightInfo");
        let player2Info = fighInfo.curOppo;
        if(fighInfo.isWin)
        {
            this.victoryNode.active = true;
            this.defeatNode.active = false;

            this.victoryPlayername1.getComponent(Label).string = accInfo.name ? accInfo.name : accInfo.uid;
            this.victoryPlayername2.getComponent(Label).string = player2Info.name ? player2Info.name : player2Info.uid;
            this.victoryScore1.getComponent(Label).string = accInfo.arenaScore;
            this.victoryScore2.getComponent(Label).string = player2Info.arenaScore;
            this.victoryDiffScore1.getComponent(Label).string = "(+" + fighInfo.myScore + ")";
            this.victoryDiffScore2.getComponent(Label).string = "(-" + fighInfo.dstScore + ")";
            ArenaModel.getArenaRank();
            this.setWinRewardList(fighInfo.rewardInfos)
        }
        else
        {
            this.victoryNode.active = false;
            this.defeatNode.active = true;
            this.defeatPlayername1.getComponent(Label).string = accInfo.name ? accInfo.name : accInfo.uid;
            this.defeatPlayername2.getComponent(Label).string = player2Info.name ? player2Info.name : player2Info.uid;
            this.defeatScore1.getComponent(Label).string = accInfo.arenaScore;
            this.defeatScore2.getComponent(Label).string = player2Info.arenaScore;
            this.defeatDiffScore1.getComponent(Label).string = "(-" + fighInfo.myScore + ")";
            this.defeatDiffScore2.getComponent(Label).string = "(+" + fighInfo.dstScore+ ")";
        }
    }

    
    setWinRewardList(arr){
        for(let key in arr)
        {
            let node = this.rewardList.children[key]
            if(!node)
            {
                node = instantiate(this.itemReward);
                this.rewardList.addChild(node);
            }
            node.active = true;
            Common.setNodeImgSprite("itemRes/item" + arr[key].type, node.children[0],null, () => {});
            let numNode =  node.children[1];
            numNode.getComponent(Label).string = "x" + arr[key].count;
        }
    }

    protected onDisable(): void {
        UIManager.closeView(Constants.Panels.UIFight);
    }

    start() {

    }
}


