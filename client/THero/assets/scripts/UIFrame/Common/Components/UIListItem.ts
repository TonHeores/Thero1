import {_decorator,Component,Label,Node,RichText,Button,Sprite,game
} from "cc";
import Redux from "../../../redux";

const {ccclass, property} = _decorator;

/**
 * 列表项基类
 * @author chenkai 2020.7.8
 */
@ccclass
export default class UIListItem extends Component {
    public isListItem = false;
    public itemType = 0  // 用于表示是spItem还是lbItem 0代表spItem 1为lbItem listview处理分层时将一个item的label 分离出来成为一个独立的lbItem
    /**当前项ID，0表示第一项 */
    public itemID:number = 0;
    /**数据 */
    public data:any;
    
    private bindLbNode:Node = null

    private lbArr = []
    private lbStateArr = []
    /**
     * 刷新
     * @param itemID 当前项ID
     * @param data   数据
     */
    public updateItem(itemID, data) {
        //console.log(data)
        this.itemID = itemID;
        this.data = data;
        if(data!=null&&this.itemType == 0){
            this.preRefreshBindLb()
            this.dataChanged();
            this.refreshBindLb()
        }
        if(this.itemType == 0 &&this.bindLbNode!=null){
            let listItem = this.bindLbNode.getComponent(UIListItem)
            this.lbStateArr = []
            this.updateLbStates(this.node,true)
            listItem.updateLb(this.lbArr,this.lbStateArr)
        }
    }

    public updateLb(lbArr,lbStateArr) {
        for(let i=0;i<this.lbArr.length;i++){
            let orilb:Label = lbArr[i]
            let lb:Label = this.lbArr[i]
            lb.string = orilb.string
            lb.color = orilb.color
            lb.node.active = lbStateArr[i]
        }
    }

    _initItem(){
        this.getLbArr(this.node)
        if(this.itemType == 0){
            this.hideLbs()
        }else{
            this.hideSps(this.node)
            this.disableButtons(this.node)
        }
    }

    getLbArr(item:Node,curNode:Node=null){
        if(curNode==null){
            curNode = item
        }
        let self = this
        let lb:Label = curNode.getComponent(Label)
        let richlb:RichText = curNode.getComponent(RichText)
        if(lb){
            this.lbArr.push(lb)
            if(this.itemType == 1){ //label 设置cachemode为CHAR
                // lb.cacheMode = Label.CacheMode.CHAR
            }
            return
        }
        if(richlb){
            this.lbArr.push(richlb)
            if(this.itemType == 1){ //label 设置cachemode为CHAR
                // richlb.cacheMode = Label.CacheMode.CHAR
            }
            return
        }
        curNode.children.forEach((element: Node) => {
            self.getLbArr(item,element)
        }); 
    }

    updateLbStates(item:Node,curState,curNode:Node=null){
        if(curNode==null){
            curNode = item
        }
        if(curState == true){
            curState = curNode.active 
        }
        let self = this
        let lb:Label = curNode.getComponent(Label)
        let richlb:RichText = curNode.getComponent(RichText)
        if(lb){
            this.lbStateArr.push(curState)
            return
        }
        if(richlb){
            this.lbStateArr.push(curState)
            return
        }
        curNode.children.forEach((element: Node) => {
            self.updateLbStates(item,curState,element)
        }); 
    }

    getLbDatas(){
        let arr = []
        this.lbArr.forEach(element => {
            arr.push(element.string)
        });
        return arr
    }

    showLbs(){
        if(this.lbArr){
            this.lbArr.forEach(element => {
                element.enabled = true
            });
        }
    }

    hideLbs(){
        if(this.lbArr){
            this.lbArr.forEach(element => {
                element.enabled = false
            });
        }
    }

    hideSps(item:Node){
        let sp:Sprite = item.getComponent(Sprite)  //本处只处理sprite 可能以后要处理其他渲染组件
        if(sp){
            sp.enabled = false
        }
        let sps = item.getComponentsInChildren(Sprite)
        sps.forEach(element => {
            element.enabled = false
        });
    }

    disableButtons(item:Node,curNode:Node=null){
        if(curNode==null){
            curNode = item
        }
        let self = this
        let but:Button = curNode.getComponent(Button)  //本处只处理sprite 可能以后要处理其他渲染组件
        if(but){
            but.enabled = false
        }
        curNode.children.forEach((element: Node) => {
            self.disableButtons(item,element)
        }); 
    }

    resetNode(item:Node,curNode:Node=null){
        if(curNode==null){
            curNode = item
        }
        let self = this
        curNode.active = true
        curNode.children.forEach((element: Node) => {
            self.resetNode(item,element)
        }); 
    }

    /**数据改变 */
    protected dataChanged(){
        
    }

    private preRefreshBindLb(){
        this.showLbs()
    }

    private refreshBindLb(){
        let frameRate = game.getFrameRate();
        let self = this
        setTimeout(() => {
            self.hideLbs()
        }, 1000/frameRate);
    }

    public bindNode(desNode,listItem){
        this.bindLbNode = desNode

        if(this.itemType == 0 &&this.bindLbNode!=null){
            this.resetNode(this.bindLbNode)
            // let listItem = this.bindLbNode.getComponent(UIListItem)
            this.lbStateArr = []
            this.updateLbStates(this.node,true)
            listItem.updateLb(this.lbArr,this.lbStateArr)
        }
    }

    onLoad(){
    }

    start(){
        if(this.isListItem&&this.itemType == 0){
            let arr = [this.node]
            if(this.bindLbNode){
                arr.push(this.bindLbNode)
            }
            this.showAnimation(arr)
        }
    }

     showAnimation(nodes){
        // nodes.forEach(node => {
        //     node.scale = 0;
        //     CocosHelper.runTweenSync(node, tween().to(0.6, {scale: 1}, easeBackOut()));
        // });
    }

    onDisable(){
    }

    onDestroy(){
        // console.log("UIListItem onDestroy")
        this.bindLbNode = null
        this.data = null
        this.node.off(Node.EventType.TOUCH_START, null, this)

        Redux.disConnect(this)
    }
}