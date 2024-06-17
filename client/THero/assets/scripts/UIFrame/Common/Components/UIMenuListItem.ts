
import { Component, tween, Vec3, _decorator } from "cc";
import CocosHelper from "../../CocosHelper";
// import { Vec3 } from './../../../../../extensions/i18n/@types/packages/scene/@types/public.d';

const {ccclass, property} = _decorator;

/**
 * 列表项基类
 * @author chenkai 2020.7.8
 */
@ccclass
export default class UIMenulistItem extends Component {
    public isListItem = false;
    public itemType = 0  // 用于表示是spItem还是lbItem 0代表spItem 1为lbItem listview处理分层时将一个item的label 分离出来成为一个独立的lbItem
    /**当前项ID，0表示第一项 */
    public itemID:number = 0;
    /**数据 */
    public data:any;
    
    // private bindLbNode:cc.Node = null

    private lbArr = []
    private lbStateArr = []
    /**
     * 刷新
     * @param itemID 当前项ID
     * @param data   数据
     */
    public updateItem(itemID, data) {
        // cc.log(data)
        this.itemID = itemID;
        this.data = data;
        // if(data!=null&&this.itemType == 0){
            // this.preRefreshBindLb()
            this.dataChanged();
            // this.refreshBindLb()
        // }
        // if(this.itemType == 0 &&this.bindLbNode!=null){
        //     let listItem = this.bindLbNode.getComponent(UIListItem)
        //     this.lbStateArr = []
        //     this.updateLbStates(this.node,true)
        //     listItem.updateLb(this.lbArr,this.lbStateArr)
        // }
    }

    protected flopMenu(isFlop){
        
    }

    protected postFlop(data, toFlop){

    }

    protected postActive(data){

    }

    // public updateLb(lbArr,lbStateArr) {
    //     for(let i=0;i<this.lbArr.length;i++){
    //         let orilb:cc.Label = lbArr[i]
    //         let lb:cc.Label = this.lbArr[i]
    //         lb.string = orilb.string
    //         lb.node.color = orilb.node.color
    //         lb.node.active = lbStateArr[i]
    //     }
    // }

    // _initItem(){
    //     this.getLbArr(this.node)
    //     if(this.itemType == 0){
    //         this.hideLbs()
    //     }else{
    //         this.hideSps(this.node)
    //         this.disableButtons(this.node)
    //     }
    // }

    // getLbArr(item:cc.Node,curNode:cc.Node=null){
    //     if(curNode==null){
    //         curNode = item
    //     }
    //     let self = this
    //     let lb:cc.Label = curNode.getComponent(cc.Label)
    //     let richlb:cc.RichText = curNode.getComponent(cc.RichText)
    //     if(lb){
    //         this.lbArr.push(lb)
    //         if(this.itemType == 1){ //label 设置cachemode为CHAR
    //             // lb.cacheMode = cc.Label.CacheMode.CHAR
    //         }
    //         return
    //     }
    //     if(richlb){
    //         this.lbArr.push(richlb)
    //         if(this.itemType == 1){ //label 设置cachemode为CHAR
    //             // richlb.cacheMode = cc.Label.CacheMode.CHAR
    //         }
    //         return
    //     }
    //     curNode.children.forEach((element: cc.Node) => {
    //         self.getLbArr(item,element)
    //     }); 
    // }

    // updateLbStates(item:cc.Node,curState,curNode:cc.Node=null){
    //     if(curNode==null){
    //         curNode = item
    //     }
    //     if(curState == true){
    //         curState = curNode.active 
    //     }
    //     let self = this
    //     let lb:cc.Label = curNode.getComponent(cc.Label)
    //     let richlb:cc.RichText = curNode.getComponent(cc.RichText)
    //     if(lb){
    //         this.lbStateArr.push(curState)
    //         return
    //     }
    //     if(richlb){
    //         this.lbStateArr.push(curState)
    //         return
    //     }
    //     curNode.children.forEach((element: cc.Node) => {
    //         self.updateLbStates(item,curState,element)
    //     }); 
    // }

    // getLbDatas(){
    //     let arr = []
    //     this.lbArr.forEach(element => {
    //         arr.push(element.string)
    //     });
    //     return arr
    // }

    // showLbs(){
    //     if(this.lbArr){
    //         this.lbArr.forEach(element => {
    //             element.enabled = true
    //         });
    //     }
    // }

    // hideLbs(){
    //     if(this.lbArr){
    //         this.lbArr.forEach(element => {
    //             element.enabled = false
    //         });
    //     }
    // }

    // hideSps(item:cc.Node){
    //     let sp:cc.Sprite = item.getComponent(cc.Sprite)  //本处只处理sprite 可能以后要处理其他渲染组件
    //     if(sp){
    //         sp.enabled = false
    //     }
    //     let sps = item.getComponentsInChildren(cc.Sprite)
    //     sps.forEach(element => {
    //         element.enabled = false
    //     });
    // }

    // disableButtons(item:cc.Node,curNode:cc.Node=null){
    //     if(curNode==null){
    //         curNode = item
    //     }
    //     let self = this
    //     let but:cc.Button = curNode.getComponent(cc.Button)  //本处只处理sprite 可能以后要处理其他渲染组件
    //     if(but){
    //         but.enabled = false
    //     }
    //     curNode.children.forEach((element: cc.Node) => {
    //         self.disableButtons(item,element)
    //     }); 
    // }

    // resetNode(item:cc.Node,curNode:cc.Node=null){
    //     if(curNode==null){
    //         curNode = item
    //     }
    //     let self = this
    //     curNode.active = true
    //     curNode.children.forEach((element: cc.Node) => {
    //         self.resetNode(item,element)
    //     }); 
    // }

    /**数据改变 */
    protected dataChanged(){
        
    }

    // private preRefreshBindLb(){
    //     this.showLbs()
    // }

    // private refreshBindLb(){
    //     let frameRate = cc.game.getFrameRate();
    //     let self = this
    //     setTimeout(() => {
    //         self.hideLbs()
    //     }, 1000/frameRate);
    // }

    // public bindNode(desNode,listItem){
    //     this.bindLbNode = desNode

    //     if(this.itemType == 0 &&this.bindLbNode!=null){
    //         this.resetNode(this.bindLbNode)
    //         // let listItem = this.bindLbNode.getComponent(UIListItem)
    //         this.lbStateArr = []
    //         this.updateLbStates(this.node,true)
    //         listItem.updateLb(this.lbArr,this.lbStateArr)
    //     }
    // }

    onLoad(){
    }

    start(){
        if(this.isListItem&&this.itemType == 0){
            let arr = [this.node]
            // if(this.bindLbNode){
            //     arr.push(this.bindLbNode)
            // }
            this.showAnimation(arr)
        }
    }

    showAnimation(nodes){
        nodes.forEach(node => {
            node.scale = new Vec3(0.5,0.5,0.5);
            CocosHelper.runTweenSync(node, tween().to(0.6, {scale: new Vec3(1,1,1)}, {easing:"backOut"}));
        });
    }

    onDestroy(){
        // super.onDestroy()
        this.data = null
    }
}