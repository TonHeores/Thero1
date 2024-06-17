
import { _decorator, Component, Node, Label, Vec3, color } from 'cc';
import { Binder, ButtonPlus, EventCenter, UIListItem, UIManager, bindComp } from '../../UIFrame/indexFrame';
import { Common } from '../../utils/indexUtils';
import Constants from '../../Constant';
import { ConfigHelper } from '../../utils/ConfigHelper';
import GameUtils from '../../utils/GameUtils';
const { ccclass, property } = _decorator;
 
@ccclass('PowerRankListItem')
export class PowerRankListItem extends UIListItem {
    // [1]
    // dummy = '';

    @bindComp("cc.Node")
    bg : Node;
    @bindComp("cc.Node")
    head : Node;
    @bindComp("cc.Node")
    headbg : Node;
    @bindComp("cc.Node")
    rankIcon : Node;
    @bindComp("cc.Label")
    rankNumTop : Label;
    @bindComp("cc.Label")
    rankNum : Label;
    @bindComp("cc.Label")
    nick : Label;
    @bindComp("cc.Label")
    power : Label;

    private strColor = ["#F9F4A0","#F5F6F7","#FFF0E4","#B66F38"];
    private outlineColor = ["#6B1903","#2E3549","#4D322C"];

    onLoad(){
        this.initEventListener()
    }

    protected dataChanged(){
        if(this.data.rank <= 3){
            this.rankNum.node.active = false
            this.rankIcon.active = true
            this.rankNumTop.string = this.data.rank+""
            if(this.data.rank == 1){
                Common.setNodeImgSprite("arena/jjc_pmtxk1", this.headbg,null, () => {});
                Common.setNodeImgSprite("arena/jjc_pm1", this.rankIcon,null, () => {});
            }else if(this.data.rank == 2){
                Common.setNodeImgSprite("arena/jjc_pmtxk2", this.headbg,null, () => {});
                Common.setNodeImgSprite("arena/jjc_pm2", this.rankIcon,null, () => {});
            }else if(this.data.rank == 3){
                Common.setNodeImgSprite("arena/jjc_pmtxk3", this.headbg,null, () => {});
                Common.setNodeImgSprite("arena/jjc_pm3", this.rankIcon,null, () => {});
            }
            this.rankNumTop.color = color(this.strColor[this.data.rank-1]);
            this.rankNumTop.outlineColor = color(this.outlineColor[this.data.rank-1]);
            this.rankNumTop.getComponent(Label).outlineWidth = 2;
        }else{
            this.rankIcon.active = false
            this.rankNum.node.active = true
            this.rankNum.string = this.data.rank+""
            this.rankNum.color = color(this.strColor[3]);
            this.rankNum.getComponent(Label).outlineWidth = 0;
            Common.setNodeImgSprite("arena/jjc_pmtxk4", this.headbg,null, () => {});
        }
        Common.setNodeImgSprite("arena/jjc_pmdk4", this.bg,null, () => {});
        if(this.data.playerSmpl.name == ""){
            this.nick.string = "--"
        }else{
            this.nick.string = this.data.playerSmpl.name+""
        }
        this.power.string =  Common.formatEngNumber(this.data.playerSmpl.battlePower, 2, false)

        GameUtils.setHeadImg(this.data.playerSmpl.avatar,this.head)
    }

    initEventListener(){
    }

   
    onDeStroy(){
        super.onDestroy()
    }
}
