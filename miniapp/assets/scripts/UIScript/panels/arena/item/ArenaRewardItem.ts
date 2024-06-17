import { _decorator, color, Component, instantiate, Label, Node } from 'cc';
import { bindComp, UIListItem } from '../../../../UIFrame/indexFrame';
import { Common } from '../../../../utils/indexUtils';
const { ccclass, property } = _decorator;

@ccclass('ArenaRewardItem')
export class ArenaRewardItem extends UIListItem {

    @bindComp("cc.Node")
    public imgRank: Node = null;
    @bindComp("cc.Node")
    public rankingnum: Node = null;
    @bindComp("cc.Node")
    public list: Node = null;
    @bindComp("cc.Node")
    public item: Node = null;
    @bindComp("cc.Node")
    public itemIcon: Node = null;
    @bindComp("cc.Node")
    public itemNum: Node = null;
    private colorArr = ["F9F4A0","F5F6F7","FFF0E4","B66F38"];
    private outLineColorArr = ["6B1903","2E3549","4D322C"];
    
    protected dataChanged(): void {
        if(this.data.info.rankEnd == 0)
        {
            this.rankingnum.getComponent(Label).string = this.data.info.rankBegin;
            this.imgRank.active = true;
            if(this.data.info.rankBegin <= 3)
                Common.setNodeImgSprite("arena/jjc_pm" + this.data.info.rankBegin, this.imgRank,null, () => {});
            else
                this.imgRank.active = false;
        }
        else if(this.data.info.rankEnd == 999999)
        {
            this.rankingnum.getComponent(Label).string = ">"+ this.data.info.rankBegin;
        }
        else
        {
            this.rankingnum.getComponent(Label).string = this.data.info.rankBegin + "-" + this.data.info.rankEnd;
            this.imgRank.active = false;
        }
         let arr = this.data.type == "daily" ? this.data.info.dailyRewards : this.data.info.weeklyRewards;
         this.removeListItem();
         this.setItemList(arr);
         let str = this.rankingnum.getComponent(Label).string;
        if(str.indexOf("-") != -1 || str.indexOf(">") != -1)
        {
            this.rankingnum.getComponent(Label).color = color(this.colorArr[3]);
            this.rankingnum.getComponent(Label).outlineWidth = 0;
        }
        else{
            if(Number(str) <= 3)
                {
                    this.rankingnum.getComponent(Label).color = color(this.colorArr[Number(str) - 1]);
                    this.rankingnum.getComponent(Label).outlineColor = color(this.outLineColorArr[Number(str) - 1]);
                    this.rankingnum.getComponent(Label).outlineWidth = 2;
                }
            else
            {
                this.rankingnum.getComponent(Label).color = color(this.colorArr[3]);
                this.rankingnum.getComponent(Label).outlineWidth = 0;
            }
        }
    }

    setItemList(arr){
        for(let key in arr)
        {
            let node = this.list.children[key]
            if(!node)
            {
                node = instantiate(this.item);
                this.list.addChild(node);
            }
            node.active = true;
            Common.setNodeImgSprite("itemRes/item" + arr[key].type, node.children[0],null, () => {});
            let numNode =  node.children[1];
            numNode.getComponent(Label).string = "x" + arr[key].count;
        }
    }

    removeListItem(){
        this.list.children.forEach(ele => {
            this.list.removeChild(ele)
        })
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}


