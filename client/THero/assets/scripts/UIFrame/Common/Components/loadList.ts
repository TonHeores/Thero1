import { Component, instantiate, Layout, Prefab, ScrollView, UITransform, Vec2, _decorator } from "cc";
import Common from "../../../utils/common";

const {ccclass, property} = _decorator;

@ccclass
export default class NewClass extends Component {

    // 专治聊天这种双向加载不确定性
    @property(ScrollView)
    scrollView: ScrollView = null;
    @property(Prefab)
    itemPrefab: Prefab = null;

    private scriptName = "";
    private baseItem = 0;
    private maxItem = 0;
    private addNumItem = 0;

    private listData = [];
    private content = null as any;
    private itemDis = 0;
    private index = 0;
    
    private t = null as any;
    

    onLoad(){
        this.listenEvent()

        // setInterval(()=>{
        //     this.loadTop()
        // }, 5000)
    }

    onEnable(){
        // this.scrollToBot(0, ()=>{})
    }

    init(scriptName, baseItem, maxItem, addNumItem){
        this.content = this.scrollView.content

        this.scriptName = scriptName;
        this.baseItem = baseItem;
        this.maxItem = maxItem;
        this.addNumItem = addNumItem;
        this.itemDis = Number(this.content.getComponent(Layout).spacingY)
    }

    listenEvent(){
        this.scrollView.node.on("scroll-to-top", ()=>{
            console.log("toptop")
            // this.loadTop()
        })

        // setTimeout(() => {
        //     this.scrollView.setContentPosition(cc.v2())
        // }, 2000);

        this.scrollView.node.on("scrolling", ()=>{
            // cc.log(this.scrollView.getContentPosition())
        })
    }

    // 初始化元素的长度
    initContain(data){
        let len = data.length
        let childLen = this.content.children.length
        
        // 补充足够的元素至基本水平
        if(len>childLen&&childLen<this.baseItem){
            let dis = len > this.baseItem ?  this.baseItem - childLen : len- childLen
            new Array(dis).fill(0).map((item,i)=>{
                let itemPrefab = instantiate(this.itemPrefab)
                this.content.addChild(itemPrefab)
            })
        } else if(len < childLen) {
            this.content.children.map((item,i)=>{
                item.active = !!data[i];
            })
        }
    }

    renderList(data){
        this.initContain(data)
        this.listData = Common.ObjClone(data)

        let childLen = this.content.children.length
        let newData = data.slice(data.length-childLen, data.length)
        // 数据目前所在锚点
        this.index = data.length - childLen

        this.content.children.map((item,i)=>{
            item.active = !!newData[i];

            if(!!newData[i]) {
                let scirpt = item.getComponent(this.scriptName)
                scirpt.init(newData[i])
            }
        })

        this.scrollToBot(200, ()=>{})
    }

    addItem(data){
        // 如果数据连msg都没有直接跳过
        if(!data.id){return}

        // 往全量数据中加入元素
        this.listData.push(data)

        // 往最下方插入最新的元素
        let itemPrefab = instantiate(this.itemPrefab)
        let scirpt = itemPrefab.getComponent(this.scriptName) as any

        scirpt.init(data)
        this.content.addChild(itemPrefab)

        // 滑动至最底部
        this.scrollToBot(200, ()=>{
            // 获取目前content的长度
            let childLen = this.content.children.length
            let dis = childLen - this.maxItem

            if(dis>0){
                // 清除超过最大值的元素
                new Array(dis).fill(0).map((item,i)=>{
                    if(i<dis){this.content.children[i].destroy()}
                })
    
                // 更新锚点
                this.index += dis
            }
        })
    }

    loadTop(){
        // 当锚点已经是数据首位的时候 不执行此方法
        if(this.index<=0){return;}

        let dataHead = this.index-this.addNumItem <0 ? 0:this.index-this.addNumItem
        let insertData = this.listData.slice(dataHead, this.index)
        insertData.reverse()

        let sumHeight = 0

        insertData.map((item,i)=>{
            let itemPrefab = instantiate(this.itemPrefab)
            let script = itemPrefab.getComponent(this.scriptName) as any
            sumHeight += script.init(item) + this.itemDis

            this.scrollView.content.insertChild(itemPrefab, 0)
        })

        // cc.log(sumHeight)
        this.scrollView.stopAutoScroll()
        let scrollY = this.scrollView.getScrollOffset().y
        this.scrollView.scrollToOffset(new Vec2(0, scrollY + sumHeight), 0)

        // this.scrollView.stopAutoScroll()
        // let scrollY = this.scrollView.getContentPosition().y
        // this.scrollView.setContentPosition(cc.v2(0, scrollY + sumHeight))

        this.index = dataHead
    }

    resizeCont(){
        if(this.content.height > this.content.parent.height){
            this.scrollView.scrollToBottom()
        } else {
            this.scrollView.scrollToTop()
        }
    }

    scrollToBot(delay, cb){
        clearTimeout(this.t)

        this.t = setTimeout(() => {
            if(cb) {
                cb();
            }

            // 防止冲突
            if(!this.node.active){return}
            if(this.content.getComponent(UITransform).height < this.content.parent.getComponent(UITransform).height){return}
            
            this.scrollView.stopAutoScroll()
            this.scrollView.scrollToBottom(0)
        }, 200);
    }

    // update (dt) {}
}
