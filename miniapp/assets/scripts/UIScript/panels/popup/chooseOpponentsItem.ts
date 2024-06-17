import { _decorator, Component, instantiate, Label, Node } from 'cc';
import { bindComp, ButtonPlus, UIListItem, UIManager } from '../../../UIFrame/indexFrame';
import { CommUtil } from '../../../utils/pomelo/CommUtil';
import ArenaModel from '../../../model/ArenaModel';
import UserModel from '../../../model/UserModel';
import ConstEnum from '../../../utils/EnumeDefine';
import Ext from '../../../utils/exts';
import { Common } from '../../../utils/indexUtils';
import Constants from '../../../Constant';
const { ccclass, property } = _decorator;

@ccclass('chooseOpponentsItem')
export class chooseOpponentsItem extends UIListItem {

    @bindComp("ButtonPlus")
    public challengeBtn: ButtonPlus = null;
    @bindComp("cc.Node")
    public playerName: Node = null;
    @bindComp("cc.Node")
    public Power: Node = null;
    @bindComp("cc.Node")
    public head: Node = null;
    @bindComp("cc.Node")
    public score: Node = null;
    @bindComp("cc.Node")
    public playerLevel: Node = null;
    @bindComp("cc.Node")
    public item: Node = null;
    @bindComp("cc.Node")
    public rewarList: Node = null;
    @bindComp("ButtonPlus")
    public headBtn: ButtonPlus = null;
    
    protected onEnable(): void {
        this.headBtn.addClick(this.openOpponentsInfo,this)
    }

    protected dataChanged(): void {
        if(this.data.playerSmpl.avatar == ""){
            Common.setNodeImgSprite("headIcon/0", this.head,null, () => {});
        }else{
            if(this.data.playerSmpl.avatar.indexOf("img://") != -1){ //系统默认头像
                let idxStr = this.data.playerSmpl.avatar.split("img://")[1]
                let oriIdx = parseInt(idxStr)
                Common.setNodeImgSprite("headIcon/"+oriIdx, this.head,null, () => {});
            }
        }
        this.challengeBtn.addClick(this.toChallenge,this)
        this.Power.getComponent(Label).string = this.data.playerSmpl.battlePower + "";
        this.score.getComponent(Label).string = this.data.playerSmpl.arenaScore + "";
        this.playerLevel.getComponent(Label).string = Ext.i18n.t("UI_Main_01_001").replace("{0#}",this.data.playerSmpl.lv);
        this.playerName.getComponent(Label).string =  this.data.playerSmpl.name ? this.data.playerSmpl.name : this.data.playerSmpl.uid;
        this.setWinRewardList(this.data.winRewards);
    }

    toChallenge()
    {
        if(UserModel.getItemByType(ConstEnum.ItemType.ArenaTicket) == 0)
        {
            let str = Ext.i18n.t("BannerTips_001").replace("{0#}",Ext.i18n.t("UI_Item_01_005"));
            UIManager.showToast(str);
            return;
        }
        console.log(this.data.playerSmpl.uid);
        ArenaModel.fightOpponents(this.data.playerSmpl.uid)
    }

    openOpponentsInfo(){
        ArenaModel.getOpponentsInfo(this.data.playerSmpl.uid)
    }

    setWinRewardList(arr){
        for(let key in arr)
        {
            let node = this.rewarList.children[key]
            if(!node)
            {
                node = instantiate(this.item);
                this.rewarList.addChild(node);
            }
            node.active = true;
            Common.setNodeImgSprite("itemRes/item" + arr[key].type, node.children[0],null, () => {});
            let numNode =  node.children[1];
            numNode.getComponent(Label).string = "" + arr[key].count;
        }
    }

    start() {

    }

}


