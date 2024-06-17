import {UIManager,FormType,UIBase, bindComp} from "../../../UIFrame/indexFrame";
import { _decorator, instantiate, Label, Toggle, Node, log, Widget,RichText,Asset, loader,tween, Vec3, View } from "cc";
import CocosHelper from '../../../UIFrame/CocosHelper';

const {ccclass, property} = _decorator;

@ccclass
export default class UIToast extends UIBase {

    formType = FormType.TopTips;
    static prefabPath = "common/UIToast";
    /** 可多次调用openView 如果已经显示，则调用其onChange函数 */
    static canRecall = true

    labPrefab = null

    private showingArr = []
    
    async load () {
        this.labPrefab = this.node.getChildByName("item")
        this.labPrefab.removeFromParent()
    }
    start () {

    }

    async onShow(str) {
        console.log("onShow111111111111111111111111111111111111111111111")
        this.showTip(str)
    }

    //
    onReshow(str){
        console.log("onReshow111111111111111111111111111111111111111111111")
        this.showTip(str)
    }

    showTip(str){
        // 初始化操作
        let item = instantiate(this.labPrefab);
        this.showingArr.push(item)
        let label = item.getChildByName("tips").getComponent(Label)
        label.string = str;
        this.node.addChild(item)
        this.showAnim(item)
    }

    public showAnim(item) {
        item.y = 0;
        item.opacity = 255;
        (item as Node).scale = new Vec3(0,0,1);

        // tween(item).to(1, {position: new Vec3(0, 200, 0)},  { easing: 'linear' }).to(0.3, {opacity: 0}).call(this.moveFinish.bind(this)).start();
        tween(item).to(0.3, {scale: new Vec3(1, 1, 1)},  { easing: 'cubicOut' }).delay(1.5).to(0.1, {scale: new Vec3(0, 0, 1)}).call(this.moveFinish.bind(this)).start();
    }

    moveFinish(){
        let node = this.showingArr.shift()
        node.removeFromParent()
        if(this.showingArr.length == 0){
            UIManager.closeView(UIToast);
        }
    }
}
