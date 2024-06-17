import { Component, instantiate, Prefab, ScrollView, TERRAIN_HEIGHT_BASE, tween, UITransform, Vec2, Vec3, _decorator } from "cc";
import { Common } from "../../../utils/indexUtils";
import CocosHelper from "../../CocosHelper";
import { Binder } from "../../indexFrame";
import UIMenulistItem from './UIMenuListItem';

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
export default class UIMenuList extends Component {

    /**列表选项 */
    // @property(cc.Node)
    // public item:cc.Node = null;
    // @property({type:cc.Enum(ItemType),tooltip:"item类型"})
    // itemType:ItemType = ItemType.interateTxt;

    @property(Prefab)
	public item: Prefab = null;
    @property(Prefab)
	public childItem: Prefab = null;
    @property("cc.Boolean")
	public canMulitSelect: Boolean = false;

    private content = null;
    private hasInit = false;

    private itemHeight = 0;
    private childItemHeight = 0;

    private nowActiveIdx = 100;
    private activeData = {key:-1, idx:-1};

    private itemDataList = [];

    private isCreating = true;
    private myScrollView = null as any;

    onLoad(){
        this.initNodes();
        // console.log("do onload!!!!!!!!!!!!!!!!")
        // console.log("content!!!!!!!!!!!")
        // console.log(this.content)
        
        // new Array(10).fill(0).map((item)=>{
            //     const prefab = instantiate(this.item);
            //     this.content.addChild(prefab);
            // })
    }
        
    initNodes(){
        if(this.hasInit) { return }
        this.itemHeight = this.item.data.getComponent(UITransform).height;
        this.childItemHeight = this.childItem.data.getComponent(UITransform).height;
        this.myScrollView = this.node.getComponent(ScrollView);

        this.content = this.node.getChildByName("view").getChildByName("content");
        this.hasInit = true;
    }

    oprFlop(data, toFlop, isToPos = false){
        // console.log(data)
        if(this.isCreating) {return}

        this.nowActiveIdx = 100;
        this.itemDataList.map((item, i)=>{
            if(data.key == item.key && toFlop) {
                this.nowActiveIdx = i;
            }
        })

        // if(!toFlop && this.nowActiveIdx == data.itemId) {
        //     this.nowActiveIdx = 100;
        // } else {
        //     this.nowActiveIdx = data.itemId;
        // }

        this.content.children.map((item)=>{
            const listItem = item.getComponent(UIMenulistItem);
            listItem.nowFlop(data, toFlop);
        })
        
        this.setContentLen();
        this.setAllPosition();

        if(isToPos) {
            this.scheduleOnce(()=>{
                // const node = this.content.children[this.nowActiveIdx];
                const height = this.nowActiveIdx * this.childItemHeight;
                if(height > 0) {
                    this.myScrollView.scrollToOffset(new Vec2(0, height), 0.3, false);
                    // this.scrollView.scrollToOffset(vec2, time,false);
                }
    
                console.log("sce end")
                console.log({height})
            }, 0.3)
        }

        if(toFlop) {
            this.setKey(data.key)
        }
    }

    oprActive(data) {
        this.activeData = data;

        this.content.children.map((item)=>{
            const listItem = item.getComponent(UIMenulistItem);
            listItem.nowActive(data);
        });

        this.setSelect(data);
    }

    setKey(data){

    }

    setSelect(data){

    }

    setContentLen(){
        // const extraLen = 5*this.childItemHeight;
        // this.content.height = this.itemHeight* + extraLen;
        // this.nowActiveIdx

        const extraLen = this.itemDataList[this.nowActiveIdx] ? this.itemDataList[this.nowActiveIdx].menus.length*this.childItemHeight : 0;
        this.content.getComponent(UITransform).height = extraLen + this.itemHeight*this.itemDataList.length;
    }

    setAllPosition(isMove=true){
        // const newYPos = [];
        const addHeight = this.itemDataList[this.nowActiveIdx] ? this.itemDataList[this.nowActiveIdx].menus.length*this.childItemHeight : 0;
        this.content.children.map((item, i)=>{
            // const posY = -i*this.itemHeight-this.itemHeight/2 - (i > this.nowActiveIdx ? -5*this.childItemHeight : 0);
            const posY = -i*this.itemHeight-this.itemHeight/2 - (i > this.nowActiveIdx ? addHeight : 0);
            if(isMove) {
                CocosHelper.runTweenSync(item, tween().to(0.2, {position: new Vec3(0, posY, 0)}, {easing : 'cubicOut'}));
            }else {
                item.setPosition(new Vec3(0, posY, 0));
            }
        })
    }

    public setActive(data, isOprSheet = true) {
        if(isOprSheet) {
            this.oprFlop(data, true, true);
            this.oprActive(data);
        } else {
            this.nowActiveIdx = 100;
            this.itemDataList.map((item, i)=>{
                if(data.key == item.key) {
                    this.nowActiveIdx = i;
                }
            })
            // this.activeData = data;

            this.oprActive(data);
        }
    }
    
    public async setData(itemDataList:any,isReset=false){
        this.initNodes();
        
        const nodeLen = this.content.children.length;
        
        // console.log("mafaker");
        // console.log({itemHeight});
        // console.log(this.item.data);
        this.itemDataList = itemDataList;
        this.setContentLen();

        const len = nodeLen < itemDataList.length ? itemDataList.length : nodeLen;
        // if(itemDataList.length > nodeLen) {
        const addHeight = this.itemDataList[this.nowActiveIdx] ? this.itemDataList[this.nowActiveIdx].menus.length*this.childItemHeight : 0;
        for(let i = 0; i < len; i++){
            if(!this.content) {
                break
            }
            let item = this.content.children[i];
            let data = itemDataList[i];

            if(!data && item) {
                item.active = false;
                continue
            } else {
                const posY = -i*this.itemHeight-this.itemHeight/2 - (i > this.nowActiveIdx ? addHeight : 0);

                if(!item){
                    item = instantiate(this.item);
                    const listItem = item.getComponent(UIMenulistItem);
                    Binder.bindComponent(listItem);
                    listItem.isListItem = true;
                    // this.oprFlop = listItem.postFlop.bind(listItem); 
                    listItem.postFlop = this.oprFlop.bind(this);
                    listItem.postActive = this.oprActive.bind(this);
                    this.content.addChild(item);
                    listItem.updateItem(i, data);
                } else {
                    const listItem = item.getComponent(UIMenulistItem);
                    listItem.updateItem(i, data);
                }
                
                item.setPosition(new Vec3(0, posY, 0));
                if(this.isCreating) {
                    await Common.sleep(100);
                }
            }
        }

        this.isCreating = false;
        // } else {
            // for(let i = 0; i < nodeLen; i++){
            //     const prefab = instantiate(this.item);
            //     const listItem = prefab.getComponent(UIMenulistItem);
            //     Binder.bindComponent(listItem);
            //     listItem.isListItem = true;
            //     this.content.addChild(prefab);
            //     listItem.updateItem(i, {});
                
            //     await Common.sleep(100);
            // }
        // }
    }
}