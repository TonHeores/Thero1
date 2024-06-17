import SoundMgr from "../../SoundMgr";
import { SysDefine } from "../../config/SysDefine";
// import SoundMgr from "../../SoundMgr";
import {
    _decorator,
    Button,
    Event,
    Touch,
    BlockInputEvents,
    math,
    Sprite,
    color,
  } from "cc";

const {ccclass, property} = _decorator;
@ccclass
export default class ButtonPlus extends Button {

    @property({tooltip:"音效路径", type: '', multiline: true, formerlySerializedAs: '_N$string'})
    audioUrl = '';
    @property({tooltip: "屏蔽连续点击"})
    openContinuous = true;
    @property({tooltip:"屏蔽时间, 单位:秒"})
    continuousTime = 1;

    // false表示可以点击
    continuous: boolean = false;
    // 定时器
    _continuousTimer = null;
    

    // 长按触发
    @property({tooltip: "是否开启长按事件"})
    openLongPress = false;
    // 触发时间
    @property({tooltip: "长按时间"})
    longPressTime = 1;
    longPressFlag = false;

    private longPressTimer = null;
    private oldColor = null;

    onLoad(){
        // let com = this.node.getComponent(BlockInputEvents)
        // if(com==null){
        //     this.node.addComponent(BlockInputEvents)
        // }
        if(this.target.getComponent(Sprite)){
            this.oldColor =  this.target.getComponent(Sprite).color.toHEX("#rrggbb");
        }
    }
    onEnable() {
        this.continuous = false;
        super.onEnable();
    }
    onDisable() {
        if (this._continuousTimer) {
            clearTimeout(this._continuousTimer);
            this._continuousTimer = null;
        }
        if(this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        super.onDisable();
    }

    /** 重写 */
    _onTouchBegan (event) {
        if (!this.interactable || !this.enabledInHierarchy) return;
        if(!this.audioUrl || this.audioUrl === '')
        {
            SoundMgr.inst.playEffect(SysDefine.buttongCLickEffect)
        }else{
            SoundMgr.inst.playEffect(this.audioUrl)
        }
 
        if(this.openLongPress && !this.longPressFlag) {    // 开启长按
            if(this.longPressTimer) clearTimeout(this.longPressTimer);
            this.longPressTimer = setTimeout(function() {
                // 还在触摸中 触发事件
                if(this["_pressed"]) {
                    this.node.emit('longclickStart', this);
                    this.longPressFlag = true;
                }
            }.bind(this), this.longPressTime * 1000);
        }

        this["_pressed"] = true;
        this["_updateState"]();
        // event.stopPropagation();
    }

    _onMouseMoveIn(){
        if(this.target.getComponent(Sprite)){
            this.target.getComponent(Sprite).color = color(200, 200, 200);
        }
        super._onMouseMoveIn();
    }

    _onMouseMoveOut(){
        if(this.target.getComponent(Sprite)){
            this.target.getComponent(Sprite).color = color(this.oldColor);
        }
        super._onMouseMoveOut();
    }

    _onTouchEnded(event) {
        // cc.log("_onTouchEnded")
        if (!this.interactable || !this.enabledInHierarchy) return;
        // cc.log("_onTouchEnded2")
        if(this["_pressed"] && this.longPressFlag) {
            this.node.emit('longclickEnd', this);
            this.longPressFlag = false;
        } else if (this["_pressed"] && !this.continuous) {
            this.continuous = this.openContinuous ? true : false;
            // Component.EventHandler.emitEvents(this.clickEvents, event);
            this.node.emit('click', event);
            if (this.openContinuous) {
               this._continuousTimer = setTimeout(function(){
                    this.continuous = false;
                }.bind(this), this.continuousTime * 1000);
            }
        }
        this["_pressed"] = false;
        this["_updateState"]();
        // event.stopPropagation();
    }
    _onTouchCancel (event:Event) {
        // cc.log("_onTouchCancel")
        if (!this.interactable || !this.enabledInHierarchy) return;
        let t:Touch = event["touch"]
        // let boundRect = rect(0,0,this.node.getContentSize().width,this.node.getContentSize().height)
        // // let loaclPos = this.node.convertTouchToNodeSpace(t)
        // let loaclPos = this.node.convertToNodeSpaceAR(t.getLocation())
        // cc.log(loaclPos)
        // if (boundRect.contains(loaclPos)){
        //     // cc.log("1111111111111111111111111111")
        //     return
        // }else{
        //     // cc.log("2222222222222222222222222222")
        // }
        if(this["_pressed"] && this.longPressFlag) {
            this.node.emit('longclickEnd', this);
            this.longPressFlag = false;
        }
        this["_pressed"] = false;
        this["_updateState"]();
    }
    /** 添加点击事件 之后可添加传参*/
    addClick(callback: Function, target: Object) {
        this.node.off('click');
        this.node.on('click', callback, target);
    }
    /** 添加一个长按事件 */
    addLongClick(startFunc: Function, endFunc: Function, target: Object) {
        this.node.off('longclickStart');
        this.node.off('longclickEnd');
        this.node.on('longclickStart', startFunc, target);
        this.node.on('longclickEnd', endFunc, target);
    }
}