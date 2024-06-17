import {UIManager,FormType,UIBase, bindComp, EventCenter} from "../../../UIFrame/indexFrame";
import { _decorator, instantiate, Label, Toggle, Node, log, Widget,RichText,Asset, loader,tween, Vec3, View, sp, color,screen, HorizontalTextAlignment, UITransform, Vec2, Layers } from "cc";
import CocosHelper from '../../../UIFrame/CocosHelper';
import { Common, Ext } from "../../../utils/indexUtils";
import { PlayerInfo } from "../../../utils/pomelo/DataDefine";
import State from "../../../redux/state";
import Redux from "../../../redux";
import SoundMgr from "../../../UIFrame/SoundMgr";
import { SOUND_RES } from "../../../config/basecfg";

const {ccclass, property} = _decorator;

@ccclass
export default class UIEffect extends UIBase {

    formType = FormType.TopTips;
    static prefabPath = "common/UIEffect";
    /** 可多次调用openView 如果已经显示，则调用其onChange函数 */
    static canRecall = true
    @bindComp("cc.Node")
    public aniPrefab: Node = null;
    playingAniArr = []

    async load () {
    }
    start () {

    }

    async onShow(params) {
        this.initView(params)
        EventCenter.on("openUIView", this.onOpenUIView,this);
    }

    //
    onReshow(params){
        this.initView(params)
    }

    //type 1 为升级动画 2为战力提升动画 3为金币飞行动画
    initView(params){
        if(params){
            if(params.type == 1){
                this.loadLvUPAni()
            }
            else if(params.type == 2)
            {
                this.addPowerAni(params);
            }
            else if(params.type == 3)
            {
                this.goldFlyAni(params);
            }
            else if(params.type == 4)
            {
                
            }
        }
    }

    loadLvUPAni(){
        SoundMgr.inst.playEffect(SOUND_RES.Levelup)
        let aniNode =  instantiate(this.aniPrefab);
        this.node.addChild(aniNode)
        aniNode.active = true
        aniNode.name = "lvUpAni"
        let spine: sp.Skeleton = aniNode.getComponent(sp.Skeleton)
        spine.premultipliedAlpha = false
        spine.setCompleteListener(this.spineEventCallback.bind(this,aniNode))
        let quaUrl = "uiEffect/zhujueshengji"
        Common.setNodeSpine(quaUrl, aniNode, () => {
            spine.setAnimation(0, "animation", false);
        });
    }

    addPowerAni(params){
        let aniNode =  instantiate(this.aniPrefab);
        this.node.addChild(aniNode);
        aniNode.position = new Vec3(0,560,0);

        let lb = new Node("addPower");
        let myPow = new Node("myPow");
        let aniWidget = aniNode.addComponent(Widget);
        aniWidget.isAlignTop = true;
        aniWidget!.isAbsoluteTop = false;
        aniWidget!.isAbsoluteBottom = false;
        let frameSize =  screen.windowSize;
        let ratio = frameSize.height/frameSize.width;
        if(ratio<1.6)
        {
            aniWidget!.top = 0.11;
        }
        else if(ratio<2)
        {
            aniWidget!.top = 0.14;
        }
        else
        {
            aniWidget!.top = 0.16;
        }

        myPow.position = new Vec3(-230,60,0);
        myPow.layer = 33554432;
        let myPowCom = myPow.addComponent(Label);
        myPowCom.string = "";
        myPow.getComponent(UITransform).anchorPoint = new Vec2(0,0.5)
        myPowCom.horizontalAlign = HorizontalTextAlignment.LEFT;
        let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");

        lb.position = new Vec3(180,60,0);
        lb.layer = 33554432;
        let lbCom = lb.addComponent(Label);
        lbCom.string = "";
        myPowCom.useSystemFont = false;
        lbCom.useSystemFont = false;

        let promise1 = new Promise((resolve, reject) => {
            Common.setNodeFont("powerNumber",myPow,()=>{
                myPowCom.spacingX = -45;
                myPowCom.fontSize = 100
                myPowCom.string = accInfo.battlePower + "";
                resolve(0)
            })
        })

        let promise2 = new Promise((resolve, reject) => {
            Common.setNodeFont("powerNumber1",lb,()=>{
                lbCom.spacingX = -45;
                lbCom.fontSize = 100;
                lbCom.string = "+" + params.num;
                resolve(0)
            })
        })

        Promise.all([promise1,promise2]).then(() => {
            lb.parent = aniNode;
            aniNode.addChild(lb);
            myPow.parent = aniNode;
            aniNode.addChild(myPow);
    
            aniNode.active = true;
            aniNode.name = "zhanlizengjia"
            let spine: sp.Skeleton = aniNode.getComponent(sp.Skeleton)
            spine.premultipliedAlpha = false
            spine.setCompleteListener(this.spineEventCallback.bind(this,aniNode))
            let quaUrl = "uiEffect/zhanlizengjia"
            Common.setNodeSpine(quaUrl, aniNode, () => {
                spine.setAnimation(0, "hy_chuxian", false);
                this.changeNumber(myPow,accInfo.battlePower,params.num)
            });
        })
        

    }

    changeNumber(node,playerPow,addNum){
        let addnumber = addNum
        let total = playerPow+addNum;
        let timer = setInterval(()=>{
        
            if(playerPow+10>total)
            {
                node.getComponent(Label).string = total;
                clearInterval(timer)
            }
            else
            {
                addnumber = Math.floor(addNum/3)
                addNum -= addnumber
                playerPow += addnumber
                node.getComponent(Label).string = playerPow;
            }
        },150)
    }

    goldFlyAni(params){
        let topMenuPos = State.getState(Redux.ReduxName.global, "topMenuPos");
        let goldPos:Vec3 = new Vec3 (topMenuPos.goldPos.x-50 ,topMenuPos.goldPos.y+100,topMenuPos.goldPos.z);
        let expPos:Vec3 = new Vec3 (topMenuPos.headPos.x-50 ,topMenuPos.headPos.y+120,topMenuPos.goldPos.z);
        console.log(params.node.position.toString());
        params.node.position = this.node.getComponent(UITransform).convertToNodeSpaceAR(params.node.position).add(new Vec3(375,100,0))
        params.node.parent = this.node
        
        if(params.node.name == "coin")
        {
            
            tween(params.node).to(.5, {position:goldPos,scale: new Vec3(0.7, 0.7, 1)}).delay(0.1).call(() => {
                // params.botPanel.removeChild(params.node);
                // params.node.removeFromParent()
                params.node.active = false;
                params.pool.put(params.node)
            }).start();
        }
        else
        {
            // params.node.position = this.node.getComponent(UITransform).convertToNodeSpaceAR(params.node.position).add(new Vec3(375,100,0))
            tween(params.node).to(.5, {position:expPos}).delay(0.1).call(() => {
                // params.botPanel.removeChild(params.node);
                // params.node.removeFromParent()
                params.node.active = false;
                params.pool.put(params.node)
            }).start();
        }
    }

	spineEventCallback(node:Node,trackEntry, loopName) {
        console.log(trackEntry,loopName)
		if (trackEntry.animation.name == "animation") {
            console.log("node======",node)
            node.removeFromParent()
		}
        else if(trackEntry.animation.name == "hy_chuxian")
        {
            node.removeFromParent()
        }
	}

    onOpenUIView(data){
        console.log("onOpenUIView data="+data)
    }

    guideHead(data)
    {
        console.log(data)

    }
}
