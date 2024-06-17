import { _decorator, color, Component, Label, Node } from 'cc';
import { bindComp, ButtonPlus, UIListItem, UIManager } from '../../../../UIFrame/indexFrame';
import { Common, Ext } from '../../../../utils/indexUtils';
import { CommUtil } from '../../../../utils/pomelo/CommUtil';
import Constants from '../../../../Constant';
import ArenaModel from '../../../../model/ArenaModel';
import GameUtils from '../../../../utils/GameUtils';
const { ccclass, property } = _decorator;

@ccclass('ArenaListItem')
export class ArenaListItem extends UIListItem {

    @bindComp("cc.Node")
    public playerName: Node = null;
    @bindComp("cc.Node")
    public playerlevel: Node = null;
    @bindComp("cc.Node")
    public Powelb: Node = null;
    @bindComp("cc.Node")
    public score: Node = null;
    @bindComp("cc.Node")
    public imgRank: Node = null;
    @bindComp("cc.Node")
    public rankingnum: Node = null;
    @bindComp("cc.Node")
    public head: Node = null;
    @bindComp("cc.Node")
    public headIcon: Node = null;
    @bindComp("cc.Node")
    public rankBg: Node = null;
    @bindComp("cc.Node")
    public scoreBg: Node = null;
    @bindComp("ButtonPlus")
    public headBtn: ButtonPlus = null;

    private strColor = ["#F9F4A0","#F5F6F7","#FFF0E4","#B66F38"];
    private outlineColor = ["#6B1903","#2E3549","#4D322C"];
    
    protected onEnable(): void {
        this.headBtn.addClick(this.openOpponentsInfo,this)
    }

    protected dataChanged(){
        this.playerName.getComponent(Label).string = this.data.playerSmpl.name ?this.data.playerSmpl.name: this.data.playerSmpl.uid;
        this.playerlevel.getComponent(Label).string =  Ext.i18n.t("UI_Main_01_001").replace("{0#}",this.data.playerSmpl.lv);
        this.Powelb.getComponent(Label).string = this.data.playerSmpl.battlePower//CommUtil.calcBattlePower(this.data.playerSmpl.heroAttrs) + "";
        this.score.getComponent(Label).string = this.data.playerSmpl.arenaScore;

        if(this.data.playerSmpl.avatar == ""){
            Common.setNodeImgSprite("headIcon/0", this.headIcon,null, () => {});
        }else{
            if(this.data.playerSmpl.avatar.indexOf("img://") != -1){ //系统默认头像
                let idxStr = this.data.playerSmpl.avatar.split("img://")[1]
                let oriIdx = parseInt(idxStr)
                Common.setNodeImgSprite("headIcon/"+oriIdx, this.headIcon,null, () => {});
            }
        }
        GameUtils.setHeadImg(this.data.playerSmpl.avatar,this.head)

        this.rankingnum.getComponent(Label).string = this.data.rank + "";
        if(this.data.rank == 1)
        {
            this.rankingnum.getComponent(Label).color = color(this.strColor[this.data.rank-1]);
            this.rankingnum.getComponent(Label).outlineColor = color(this.outlineColor[this.data.rank-1]);
            Common.setNodeImgSprite("arena/jjc_pmtxk1", this.head,null, () => {});
            Common.setNodeImgSprite("arena/jjc_pm1", this.imgRank,null, () => {});
            this.rankingnum.getComponent(Label).outlineWidth = 2;
            this.imgRank.active = true;
        }
        else if(this.data.rank == 2)
        {
            this.rankingnum.getComponent(Label).color = color(this.strColor[this.data.rank-1]);
            this.rankingnum.getComponent(Label).outlineColor = color(this.outlineColor[this.data.rank-1]);
            Common.setNodeImgSprite("arena/jjc_pmtxk2", this.head,null, () => {});
            Common.setNodeImgSprite("arena/jjc_pm2", this.imgRank,null, () => {});
            this.rankingnum.getComponent(Label).outlineWidth = 2;
            this.imgRank.active = true;
        }
        else if(this.data.rank == 3)
        {
            this.rankingnum.getComponent(Label).color = color(this.strColor[this.data.rank-1]);
            this.rankingnum.getComponent(Label).outlineColor = color(this.outlineColor[this.data.rank-1]);
            Common.setNodeImgSprite("arena/jjc_pmtxk3", this.head,null, () => {});
            Common.setNodeImgSprite("arena/jjc_pm3", this.imgRank,null, () => {});
            this.rankingnum.getComponent(Label).outlineWidth = 2;
            this.imgRank.active = true;
        }
        else
        {
            Common.setNodeImgSprite("arena/jjc_pmtxk4", this.head,null, () => {})
            
            this.rankingnum.getComponent(Label).color = color("#B66F38");
            this.rankingnum.getComponent(Label).outlineWidth = 0;
            this.imgRank.active = false;
        }
        Common.setNodeImgSprite("arena/jjc_pmdk4", this.rankBg,null, () => {})

    }

    openOpponentsInfo(){
        ArenaModel.getOpponentsInfo(this.data.playerSmpl.uid)
    }

    start() {

    }

}


