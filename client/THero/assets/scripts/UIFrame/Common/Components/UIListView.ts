
import {_decorator,Component,instantiate,Node,ScrollView,log,Vec2,Enum,Prefab,Widget, UITransform,size, Vec3, CCInteger, CCString
} from "cc";
import { Binder } from "../../indexFrame";
import UIListItem from "./UIListItem";

const {ccclass, property} = _decorator;

export enum ItemType{
    seprateTxt=1, //文本分离
    interateTxt=2
}
/**
 * 列表
 * 根据cocos_example的listView改动而来
 * @author chenkai 2020.7.8
 */
@ccclass
export default class UIListView extends Component {

    /**列表选项 */
    // @property(Node)
    // public item:Node = null;
    @property({type:Enum(ItemType),tooltip:"item类型"})
    itemType:ItemType = ItemType.interateTxt;

    @property(Prefab)
	public item: Prefab = null;

    /**列表选项类 */
    @property(CCString)
    public itemClass:string = "";
    private itemNode:Node = null;

    /**列表滚动容器 */
    @property(ScrollView)
    public scrollView:ScrollView = null;

    /**列表项之间间隔 */
    @property(CCInteger)
    public spacingX:number = 0;
    @property(CCInteger)
    public spacingY:number = 0;

    @property(CCInteger)
    public Top:number = 0;
    @property(CCInteger)
    public Left:number = 0;
    @property(CCInteger)
    public Bottom:number = 0;
    @property(CCInteger)
    public Right:number = 0;
    
    public spacing:number = 0;
    /**列表项实例数量 */
    private spawnCount:number = 0;
    /**距离scrollView中心点的距离，超过这个距离的item会被重置，一般设置为 scrollVIew.height/2 + item.heigt/2 + spaceing，因为这个距离item正好超出scrollView显示范围 */
    private bufferZone:number = 0;
    /**列表项总数 */
    public totalCount:number = 0;
    /**scrollView的内容容器 */
    private content:Node = null;
    private contentBg:Node = null;  //用于分离label的content
    private contentLb:Node = null;  //用于分离label的content
    /**存放列表项实例的数组 */
    private items:Array<Node> = [];
    /**存放列表项实例LB的数组 */
    private lbItems:Array<Node> = [];
    /**刷新列表计时 */
    private updateTimer:number = 0;
    /**刷新列表间隔 */
    private updateInterval:number = 0;
    /**上一次content的Y值，用于和现在content的Y值比较，得出是向上还是向下滚动 */
    private lastContentPosY:number = 0;
    /**上一次content的X值，用于和现在content的Y值比较，得出是向左还是向右滚动 */
    private lastContentPosX:number = 0;
    /**列表项数据 */
    private itemDataList:any = [];
    /**item的高度 */
    private itemHeight:number = 0;
    /**item的宽度 */
    private itemWidth:number = 0;
    /**列表项加载时间间隔 ms */
    @property(CCInteger)
    private initInl:number = 5;

    private rowNum = 0;//一行或一列有几个
    private seerowCount =0;//生成的一共几行（或几列）
    
    private refreshCb:Function = null;
    private itemClickCb:(id,data) => void = null;
    private itemLongClickCb:(id,data) => void = null;
    private itemRefreshCb:(id,data:UIListItem) => void = null;

    private isLoaded = false;
    private needCreatItem = false;
    private needReset = false;
    private isCreating = false// 正在生成item
    private waitingDatas = []
    private isDestroy = false
    private isDisable = false

    onLoad() {
        this.isLoaded = true
        //初始化
        this.itemNode = instantiate(this.item);
        this.initContent()
        this.items = [];
        this.updateTimer = 0;
        this.updateInterval = 0.1;
        this.lastContentPosY = 0;
        this.itemHeight = this.itemNode.getComponent(UITransform).height;
        this.itemWidth = this.itemNode.getComponent(UITransform).width;
        

        //layout的方向要和scrollview的方向相对应

        
        //计算bufferZone
        let trans = this.scrollView.node.getComponent(UITransform)
        //如果是竖向滚动的grid
        if(this.scrollView.vertical){
            this.spacing = this.spacingX;
            //计算每行可以拍几个
            this.rowNum = Math.floor((trans.width-this.Left-this.Right+this.spacing)/( this.itemWidth + this.spacing))
            if(this.rowNum==0){
                this.rowNum = 1
            }
            //计算创建的item实例数量，比当前scrollView容器能放下的item数量再加上2个
            this.seerowCount = (Math.round(trans.height/( this.itemHeight + this.spacingY)) + 2)
            this.spawnCount = this.seerowCount*this.rowNum;
            this.bufferZone = trans.height/2 +  this.itemHeight + this.spacingY;
        }else{
            this.spacing = this.spacingY;
            //计算每列可以拍几个
            this.rowNum = Math.floor((trans.height-this.Top-this.Bottom+this.spacing)/( this.itemHeight + this.spacing))
            if(this.rowNum==0){
                this.rowNum = 1
            }
            //计算创建的item实例数量，比当前scrollView容器能放下的item数量再加上2个
            this.seerowCount = (Math.round(trans.width/( this.itemWidth + this.spacingX)) + 2)
            this.spawnCount = this.seerowCount*this.rowNum;
            this.bufferZone = trans.width/2 +  this.itemWidth + this.spacingX;
        }

        //增加监听事件
        this.scrollView.node.on('bounce-top', this.onScrollToTop, this);
        this.scrollView.node.on('bounce-left', this.onScrollToBot, this);
        this.scrollView.node.on('scrolling', this.onScrolling, this);
        this.scrollView.node.on('scroll-to-bottom', this.onScrollToBot, this);

        if(this.needCreatItem){
            this.needCreatItem = false
            this.createItem(this.needReset);
            this.needReset = false
        }
    }

    private curTouchItemId = -1
    private touchstartTs = 0
    onItemTouchStart(event){
        let item:UIListItem = event.currentTarget.getComponent(UIListItem)
        this.curTouchItemId = item.itemID
        this.touchstartTs = new Date().getTime()
    }

    onItemTouchEnd(event){
        let item:UIListItem = event.currentTarget.getComponent(UIListItem)
        let id = item.itemID
        let curtx = new Date().getTime()
        if(id == this.curTouchItemId){
            if(curtx-this.touchstartTs<800){
                if(this.itemClickCb){
                    this.itemClickCb(id,this.itemDataList[id])
                }
            }else{
                if(this.itemLongClickCb){
                    this.itemLongClickCb(id,this.itemDataList[id])
                }
            }
            this.curTouchItemId = -1
        }
    }

    onScrollToTop(){
        if(this.refreshCb){
            this.refreshCb(0)
        }
    }
    onScrollToBot(){
        if(this.refreshCb){
            this.refreshCb(0)
        }
    }

    onScrolling(){
        if(this.scrollView.vertical){
            //console.log("this.scrollView.content.y="+this.scrollView.content.y)
        }else{
            //console.log("this.scrollView.content.x="+this.scrollView.content.x)
        }
    }

    //设置回调 用于实现上拉刷新和下拉加载
    public setCB(cb){
        this.refreshCb = cb;
    }

    public setItemClickCb(cb:(id,data) => void){
        this.itemClickCb = cb
    }

    public setItemLongClickCb(cb:(id,data) => void){
        this.itemLongClickCb = cb
    }
    
    public getDatas(){
        return this.itemDataList
    }
    
    public getItem(idx):UIListItem{
        let re = null
        this.items.forEach(element => {
            let itemS = element.getComponent(UIListItem)
            if(idx = itemS.itemID){
                re = itemS
            }
        });
        return re
    }
    
    public setItemRefreshCb(cb:(id,node:UIListItem) => void){
        return this.itemRefreshCb = cb
    }

    public refreshCurItem(){
        if(this.itemRefreshCb){
            this.items.forEach(element => {
                let itemS = element.getComponent(UIListItem)
                this.itemRefreshCb(itemS.itemID,itemS)
            });
        }
    }

    /**
     * 设置item的数据
     * @example
     *   setData([{id:1,msg:"a"},{id:2,msg:"b"}])
     * @param itemDataList item数据列表
     */
    public setData(itemDataList:any,isReset=false){
        // if(this.isDisable){
        //     this.waitingDatas.push(itemDataList)
        //     return
        // }
        if(this.isCreating){
            this.waitingDatas.push(itemDataList)
            return
        }
        //复制item数据，如果item数据源改变，则需要重新setData一次来显示新数据
        this.itemDataList = itemDataList.slice();
        this.totalCount = this.itemDataList.length;
        this.scrollView.stopAutoScroll()
        
        if(this.isLoaded){
            this.initContent()
            this.createItem(isReset);
        }else{
            this.needCreatItem = true
            this.needReset = isReset
        }
    }

    private initContent(){
        if(this.content == null){
            let widget = this.node.getComponent(Widget)
            widget&&widget.updateAlignment()
            this.content = new Node("content")
            let trans = this.content.addComponent(UITransform)
            trans.setContentSize(size(this.node.getComponent(UITransform).width,this.node.getComponent(UITransform).height))
            this.content.position = new Vec3(this.node.getComponent(UITransform).width/2,this.node.getComponent(UITransform).height/2,0)
            trans.anchorX = 0
            trans.anchorY = 1
            this.scrollView.node.addChild(this.content);
            this.scrollView.content = this.content

            this.contentBg = new Node("contentBg")
            let trans2 = this.contentBg.addComponent(UITransform)
            trans2.setContentSize(size(this.node.getComponent(UITransform).width,this.node.getComponent(UITransform).height))
            this.contentBg.position = new Vec3(0,0,0)
            trans2.anchorX = 0
            trans2.anchorY = 0.5
            this.content.addChild(this.contentBg)

            if(this.itemType == ItemType.seprateTxt){
                this.contentLb = new Node("contentLb")
                let trans3 = this.contentLb.addComponent(UITransform)
                trans3.setContentSize(size(this.node.getComponent(UITransform).width,this.node.getComponent(UITransform).height))
                this.contentLb.position = new Vec3(0,0,0)
                trans3.anchorX = 0
                trans3.anchorY = 0.5
                this.content.addChild(this.contentLb)
            }
        }
    }

    private updataContent(width,height){
        this.content.getComponent(UITransform).height = height
        this.content.getComponent(UITransform).width = width
        this.contentBg.getComponent(UITransform).height = height
        this.contentBg.getComponent(UITransform).width = width
        if(this.itemType == ItemType.seprateTxt){
            this.contentLb.getComponent(UITransform).height = height
            this.contentLb.getComponent(UITransform).width = width
        }
    }
    
    /**创建item实例 */
    private async createItem (isReset) {
        if(this.isCreating){
            return
        }
        this.isCreating = true;
        let rowCount = Math.ceil(this.totalCount / this.rowNum)
        let interVal = this.spacingY
        if(this.scrollView.vertical){
            this.updataContent(this.content.getComponent(UITransform).width,rowCount * ( this.itemHeight + interVal) + interVal+this.Top)
        }else{
            interVal = this.spacingX
            this.updataContent(rowCount * ( this.itemWidth + interVal) + interVal + this.Left,this.content.getComponent(UITransform).height)
        }
        let len = this.totalCount < this.spawnCount?this.totalCount:this.spawnCount;
        let curLen = this.items.length

        this.items.forEach(element => {
            element.active = false
        });
        
        this.lbItems.forEach(element => {
            element.active = false
        });

        if(isReset){
            if(this.scrollView.vertical){
                this.scrollView.scrollToTop()
            }else{
                this.scrollView.scrollToLeft()
            }
        }
        // await this.sleep(100)

         //暂停滚动
         if(this==null||this.node==null){
            return 
         }
         this.enabled = false;
         this.scrollView.enabled = false;
        for (let i = 0; i < len; i++) { // spawn items, we only need to do this once
            let isNew = false
            let itemID = 0 
            let item:Node = null
            let itemLb:Node = null
            let rowNum = Math.floor(i/this.rowNum)  //属于第几行或列
            let rowIdx = i%this.rowNum
            if(i>=curLen){
                item = instantiate(this.itemNode);
                if(this.itemWidth>this.scrollView.node.getComponent(UITransform).width){
                    item.getComponent(UITransform).width = this.scrollView.node.getComponent(UITransform).width - this.Left - this.Right - this.spacing
                }
                if(this.itemHeight>this.scrollView.node.getComponent(UITransform).height){
                    item.getComponent(UITransform).height = this.scrollView.node.getComponent(UITransform).height - this.Top-this.Bottom-this.spacing
                }
                let widget = item.children[0].getComponent(Widget)
                widget&&widget.updateAlignment()
                isNew = true
                let listItem = item.getComponent(UIListItem)
                if(listItem == null){
                    listItem = item.addComponent(this.itemClass) as UIListItem
                }
                Binder.bindComponent(listItem)
                listItem.isListItem = true;
                this.contentBg.addChild(item)
                item.on(Node.EventType.TOUCH_END, this.onItemTouchEnd, this)
                item.on(Node.EventType.TOUCH_START, this.onItemTouchStart, this)
                if(this.scrollView.vertical){
                    let y= -item.getComponent(UITransform).height * (0.5 + rowNum) - interVal * (rowNum + 1)-this.Top
                    item.setPosition(this.Left+item.getComponent(UITransform).width * (0.5 + rowIdx)+this.spacing* (rowIdx + 1), -item.getComponent(UITransform).height * (0.5 + rowNum) - interVal * (rowNum + 1)-this.Top);
                }else{
                    item.setPosition(this.Left+item.getComponent(UITransform).width * (0.5 + rowNum) + interVal * (rowNum + 1),-item.getComponent(UITransform).height * (0.5 + rowIdx)-this.spacing* (rowIdx + 1)-this.Top);
                }
                this.items.push(item);
                itemID = i
                listItem.updateItem(itemID, this.itemDataList[itemID]);
                if(this.itemType == ItemType.seprateTxt){
                    //创建分离的lbItem
                    itemLb = instantiate(item);
                    let listItemLb = itemLb.getComponent(UIListItem)
                    if(listItemLb == null){
                        listItemLb = itemLb.addComponent(UIListItem)
                    }
                    listItemLb.isListItem = true;
                    listItemLb.itemType = 1
                    this.contentLb.addChild(itemLb)
                    this.lbItems.push(itemLb)
                    listItem._initItem()
                    listItemLb._initItem()
                    listItem.bindNode(listItemLb.node,listItemLb)
                }
                await this.sleep(this.initInl)
            }else{
                item = this.items[i]
                if(this.itemType == ItemType.seprateTxt){
                    itemLb = this.lbItems[i]
                }
                itemID = item.getComponent(UIListItem).itemID
                if(itemID==0){
                    itemID = i
                }
                if(isReset){
                    if(this.scrollView.vertical){
                        item.setPosition(this.Left+item.getComponent(UITransform).width * (0.5 + rowIdx)+this.spacing* (rowIdx + 1), -item.getComponent(UITransform).height * (0.5 + rowNum) - interVal * (rowNum + 1)-this.Top);
                        if(itemLb){
                            itemLb.setPosition(this.Left+item.getComponent(UITransform).width * (0.5 + rowIdx)+this.spacing* (rowIdx + 1), -item.getComponent(UITransform).height * (0.5 + rowNum) - interVal * (rowNum + 1)-this.Top);
                        }
                    }else{
                        item.setPosition(this.Left+item.getComponent(UITransform).width * (0.5 + rowNum) + interVal * (rowNum + 1),-item.getComponent(UITransform).height * (0.5 + rowIdx)-this.spacing* (rowIdx + 1)-this.Top);
                        if(itemLb){
                            itemLb.setPosition(this.Left+item.getComponent(UITransform).width * (0.5 + rowNum) + interVal * (rowNum + 1),-item.getComponent(UITransform).height * (0.5 + rowIdx)-this.spacing* (rowIdx + 1)-this.Top);
                        }
                        
                    }
                    itemID = i
                    let listItem = item.getComponent(UIListItem)
                    listItem.updateItem(itemID, this.itemDataList[itemID]);
                }
            }
            if(this.itemDataList==null){
                return
            }
            if(itemID<this.itemDataList.length){
                item.active = true
                if(this.itemType == ItemType.seprateTxt){
                    itemLb.active = true
                }
                if(!isNew){
                    item.getComponent(UIListItem).updateItem(itemID, this.itemDataList[itemID]);
                }
            }else{
                item.active = false
                if(this.itemType == ItemType.seprateTxt){
                    itemLb.active = false
                }
            }
        }
         this.enabled = true;
         this.scrollView.enabled = true;
         this.finishCreateItem()
    }

    private finishCreateItem(){
        this.isCreating = false;
        this.refreshCurItem()
        if(this.waitingDatas&&this.waitingDatas.length>0){
            let datas =  this.waitingDatas.shift()
            this.setData(datas)
        }
    }

    /**清理item实例 */
    private clearAllItem(){
        for(let i=0,len=this.items.length;i<len;i++){
            let item = this.items[i];
            item.destroy();
        }
        this.items.length = 0;
        
        for(let i=0,len=this.lbItems.length;i<len;i++){
            let item = this.lbItems[i];
            item.destroy();
        }
        this.lbItems.length = 0;
    }
    
    /**获取item在scrollView的局部坐标 */
    private getPositionInView(item:Node) { 
        let worldPos = item.parent.getComponent(UITransform).convertToWorldSpaceAR(item.position);
        let viewPos = this.scrollView.node.getComponent(UITransform).convertToNodeSpaceAR(worldPos);
        return viewPos;
    }
 
    update(dt) {
        this.updateTimer += dt;
        if (this.updateTimer < this.updateInterval) return;
        if(this.isCreating){
            return
        }
        this.updateTimer = 0;
        let items = this.items;
        let lbItems = this.lbItems;
        let buffer = this.bufferZone;
        let isDown = this.scrollView.content.position.y < this.lastContentPosY; // scrolling direction
        let isUp = this.scrollView.content.position.y > this.lastContentPosY; // scrolling direction
        let itemSize = this.itemHeight
        if(this.scrollView.horizontal){
            isDown = this.scrollView.content.position.x < this.lastContentPosX;
            isUp = this.scrollView.content.position.x > this.lastContentPosX;
            itemSize = this.itemWidth
        }
        let interVal = this.spacingY
        if(this.scrollView.vertical){
        }else{
            interVal = this.spacingX
        }
        let offset = ( itemSize + interVal) * this.seerowCount;
        for (let i = 0; i < items.length; ++i) {
            let viewPos = this.getPositionInView(items[i]);
            let needUpdate = false
            let delIdx = 0;
            if (isDown) {
                // if away from buffer zone and not reaching top of content
                if(this.scrollView.vertical){
                    if (viewPos.y < -buffer && items[i].position.y + offset < 0) {
                        //console.log("更新A前,items[i]:" + i +"viewPos.y:",viewPos.y,"buffer:" ,buffer,"items[i].y:", items[i].y,"offset:",offset,"this.content.height:",this.content.height,"uuid:",items[i].uuid);
                        items[i].position = new Vec3(items[i].position.x,items[i].position.y + offset,items[i].position.z);
                        if(this.itemType == ItemType.seprateTxt){
                            lbItems[i].position = new Vec3(lbItems[i].position.x,lbItems[i].position.y + offset,lbItems[i].position.z);
                        }
                        needUpdate = true;
                        //console.log("更新B后,i:" ,i,"viewPosY:", viewPos.y,"buffer:",buffer,"offset:",offset,"uuid:",items[i].uuid);
                    }
                    delIdx= -this.seerowCount*this.rowNum
                }else{
                    if (viewPos.x < -buffer && items[i].position.x + offset > 0) {
                        //console.log("更新A前,i:" + i +"viewPos.x:",viewPos.x,"buffer:" ,buffer,"items[i].x:", items[i].x,"offset:",offset,"this.content.width:",this.content.width,"uuid:",items[i].uuid); 
                    
                        items[i].position = new Vec3(items[i].position.x + offset,items[i].position.y,items[i].position.z);
                        if(this.itemType == ItemType.seprateTxt){
                            lbItems[i].position = new Vec3(lbItems[i].position.x + offset,lbItems[i].position.y,lbItems[i].position.z);
                        }
                        needUpdate = true;
                        //console.log("更新B后,i:" ,i,"viewPosx:", viewPos.x,"buffer:",buffer,"offset:",offset,"uuid:",items[i].uuid);
                    }
                    delIdx= this.seerowCount*this.rowNum
                }
            } else if(isUp) {
                // if away from buffer zone and not reaching bottom of content
                if(this.scrollView.vertical){
                    if (viewPos.y > buffer && items[i].position.y - offset > -this.content.getComponent(UITransform).height) {
                        //console.log("更新B前,items[i]:" + i +"viewPos.y:",viewPos.y,"buffer:" ,buffer,"items[i].y:", items[i].y,"offset:",offset,"this.content.height:",this.content.height,"uuid:",items[i].uuid);
                        items[i].position = new Vec3(items[i].position.x,items[i].position.y - offset,items[i].position.z);
                        if(this.itemType == ItemType.seprateTxt){
                            lbItems[i].position = new Vec3(lbItems[i].position.x,lbItems[i].position.y - offset,lbItems[i].position.z);
                        }
                        needUpdate = true;
                        // "更新B后,tmpID:",item.tmplID,
                        //console.log("更新B后,i:" ,i,"viewPosY:", viewPos.y,"items[i].y:",items[i].y,"buffer:",buffer,"offset:",offset,"uuid:",items[i].uuid);
                    }
                    delIdx = this.seerowCount*this.rowNum
                }else{
                    if (viewPos.x > buffer &&items[i].position.x >offset) {
                        //console.log("更新A前,i:" + i +"viewPos.x:",viewPos.x,"buffer:" ,buffer,"items[i].x:", items[i].x,"offset:",offset,"this.content.width:",this.content.width,"uuid:",items[i].uuid);
                        items[i].position = new Vec3(items[i].position.x - offset,items[i].position.y,items[i].position.z);
                        if(this.itemType == ItemType.seprateTxt){
                            lbItems[i].position = new Vec3(lbItems[i].position.x - offset,items[i].position.y,items[i].position.z);
                        }
                        needUpdate = true;
                        //console.log("更新B后,i:" ,i,"viewPosx:", viewPos.x,"buffer:",buffer,"offset:",offset,"uuid:",items[i].uuid);
                    }
                    delIdx = -this.seerowCount*this.rowNum
                }
            }
            if(needUpdate){
                let item:UIListItem = items[i].getComponent(this.itemClass) as UIListItem;
                
                let itemId = item.itemID + delIdx; // update item id
                if(itemId <0 || itemId >= this.itemDataList.length){
                    item.node.active = false
                    if(this.itemType == ItemType.seprateTxt){
                        this.lbItems[i].active = false
                    }
                    item.updateItem(itemId,null);
                }else{
                    item.node.active = true
                    if(this.itemType == ItemType.seprateTxt){
                        this.lbItems[i].active = true
                    }
                    item.updateItem(itemId,this.itemDataList[itemId]);
                }

            }
        }
        // update lastContentPosY
        this.lastContentPosY = this.scrollView.content.position.y;
        this.lastContentPosX = this.scrollView.content.position.x;
    }

    /**
     * 滚动到底部
     * @param vec2 位置
     */
     public scrollToBottom () {
         this.scrollView.scrollToBottom()
    }

    public scrollToRight (timeInSecond?: number, attenuated?: boolean) {
        this.scrollView.scrollToRight(timeInSecond,attenuated)
   }
    
    /**
     * 滚动到指定位置
     * @param vec2 位置
     */
    public scrollToFixedPosition (vec2:Vec2,time =2) {
       console.log(vec2)
        this.scrollView.scrollToOffset(vec2, time,false);
    }

    /**销毁 */
    public onDestroy(){
        this.items.forEach(item => {
            // item&&item.off(Node.EventType.TOUCH_START, this.onItemTouchStart, this)
            // item&&item.off(Node.EventType.TOUCH_END, this.onItemTouchEnd, this)
        });
        this.items = []
        this.lbItems = []
        this.itemClickCb = null
        this.refreshCb = null
        this.isDestroy = true
    }

    onDisable(){
        this.isDisable = true
    }

    
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}