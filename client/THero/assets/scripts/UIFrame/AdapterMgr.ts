import { SysDefine } from './config/SysDefine';
import {
    _decorator,view,Size,log,Widget,Node,sys,find, UITransform,screen
  } from "cc";
/**
 * @Describe: 适配组件, 主要适配背景大小,窗体的位置
 */

const {ccclass, property} = _decorator;

@ccclass
export default class AdapterMgr {
    public static safeTop: number = 55;
    public static safeBot: number = 40;    
    private static _instance: AdapterMgr = null;                     // 单例
    private  _heightDelY = 0
    public static get inst() {
        if(this._instance == null) {
            this._instance = new AdapterMgr();       
            this._instance.reCalculateSize();
            this._instance.visibleSize = view.getVisibleSize();
           console.log(`visiable size: ${this._instance.visibleSize}`);
        }
        return this._instance;
    }
    
    /** 屏幕尺寸 */
    public visibleSize: Size;

    private reCalculateSize(){
        let frameSize = screen.windowSize;
        let designSize = view.getDesignResolutionSize();
       console.log(frameSize)
       console.log(designSize)
        this._heightDelY = (designSize.height /((designSize.width/frameSize.width) - frameSize.height))/2
       console.log("dexY="+this._heightDelY)
    }

    //还未适配iphonex
    private getBotDely(widget:Widget):number{
        let frameSize = view.getFrameSize();
        let safeDel = 0
        // //全面屏要留出下面34的安全区域
        // if(frameSize.height/frameSize.width>2){
        //     safeDel = AdapterMgr.safeBot
        // }
        return this._heightDelY+safeDel;
    }

    private getTopDely(widget:Widget):number{
        let frameSize = view.getFrameSize();
        let safeDel = 0
        //全面屏要留出下面34的安全区域
        if(frameSize.height/frameSize.width>1.8){
            safeDel = AdapterMgr.safeTop
        }
        return safeDel;
    }

    /**
     * 适配靠边的UI
     * @param type 
     * @param node 
     * @param distance 
     */
    public adapatByType(type: AdaptaterType, node: Node, distance?: number, target = null) {
        let widget = node.getComponent(Widget);
        if(!widget) {
            widget = node.addComponent(Widget);
        }
        switch(type) {
            case AdaptaterType.Top:
                if(sys.platform === sys.Platform.WECHAT_GAME) {     // 微信小游戏适配刘海屏
                    let menuInfo = window["wx"].getMenuButtonBoundingClientRect();
                    let systemInfo = window["wx"].getSystemInfoSync();
                    distance = find("Canvas").getComponent(UITransform).height * (menuInfo.top / systemInfo.screenHeight);
                }
                widget.top = distance ? distance : this.getTopDely(widget);
                console
                widget.isAbsoluteTop = true;
                widget.isAlignTop = true;
            break;
            case AdaptaterType.Bottom:
                widget.isAlignBottom = true;
                widget.bottom = distance ? distance : this.getBotDely(widget);
                widget.isAbsoluteBottom = true;
            break;
            case AdaptaterType.Left:
                widget.left = distance ? distance : 0;
                widget.isAbsoluteLeft = true;
                widget.isAlignLeft = true;
            break;
            case AdaptaterType.Right:
                widget.right = distance ? distance : 0;
                widget.isAbsoluteRight = true;
                widget.isAlignRight = true;
            break;
            case AdaptaterType.FullScreen:
                widget.right = 0;
                widget.left = 0;
                widget.top = 0;
                widget.bottom = 0;
                widget.isAlignLeft = true;
                widget.isAlignRight = true;
                widget.isAlignBottom = true;
                widget.isAlignTop = true;
            break;
        }
        widget.target = target || find("Canvas");
        widget.updateAlignment();
    }
    /** 移除 */
    removeAdaptater(node: Node) {
        if(node.getComponent(Widget)) {
            node.removeComponent(Widget);
        }
    }
}
/**  */
export enum AdaptaterType {
    Center = 0,
    Top = 1,
    Bottom = 2,
    Left = 3,
    Right = 4,
    FullScreen = 5,
}
