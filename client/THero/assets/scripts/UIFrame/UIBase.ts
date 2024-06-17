import CocosHelper from "./CocosHelper";
import UIManager from "./UIManager";
import { FormType, MenuType, ModalOpacity, SysDefine } from "./config/SysDefine";
import { AdaptaterType } from "./AdapterMgr";
import Binder from "./Binder";
import { Component,log,sys, Node,tween,_decorator, BlockInputEvents, Vec3 } from "cc";
import { Common } from "../utils/indexUtils";
import Redux from "../redux";
const {ccclass, property} = _decorator;

export class MaskType {
    public opacity: ModalOpacity = ModalOpacity.OpacityHalf;
    public clickMaskClose = false;      // 点击阴影关闭
    public isEasing = true;             // 缓动实现
    public easingTime = 0.2;            // 缓动时间

    constructor(opacity = ModalOpacity.None, ClickMaskClose=false, IsEasing=true, EasingTime=0.2) {
        this.opacity = opacity;
        this.clickMaskClose = ClickMaskClose;
        this.isEasing = IsEasing;
        this.easingTime = EasingTime;
    }
}

@ccclass
export default class UIBase extends Component {

    /** 窗体id,该窗体的唯一标示(请不要对这个值进行赋值操作, 内部已经实现了对应的赋值) */
    public uid: string;
    /** 窗体预设 */
    public pre = null
    /** 窗体类型 */
    public formType: FormType = 0;
    /** 窗体定位类型 针对fixedUI类型*/
    public fixedType: AdaptaterType = 0;
    /** 菜单类型 */
    public menuType: MenuType = 0;
    /** 阴影类型, 只对PopUp类型窗体启用 */
    public maskType = new MaskType();
    /** 关闭窗口后销毁, 会将其依赖的资源一并销毁, 采用了引用计数的管理, 不用担心会影响其他窗体 */
    public canRemove = true;
    public canDestory = true;
    public removeRedux = true;
    /** 是否是底部菜单 */
    public isNavigator = false;
    /** 是否是底部菜单 */
    public navigatorPanels:typeof UIBase[] = [];
    /** 自动绑定结点 */
    public autoBind = true;
    /** 回调 */
    protected _cb: (confirm: any) => void;
    /** 是否已经调用过preinit方法 */ 
    private _inited = false;
    private lang = "en"

    /** 资源路径，如果没写的话就是类名 */
    public static _prefabPath = "";
    public static set prefabPath(path: string) {
        this._prefabPath = path;
    }
    public static get prefabPath() {
        if(!this._prefabPath || this._prefabPath.length <= 0) {
            this._prefabPath = SysDefine.UI_PATH_ROOT + CocosHelper.getComponentName(this);
           console.log("component name:", CocosHelper.getComponentName(this))
        }
        return this._prefabPath;
    }

    private static _canRecall = false;
    public static set canRecall(canRecall: boolean) {
        this._canRecall = canRecall;
    }
    public static get canRecall() {
        return this._canRecall;
    }

    public view: Component;

    /** 预先初始化 */
    public async _preInit() {
        if(this._inited) return ;
        this._inited = true;
        if(this.autoBind) {
            Binder.bindComponent(this);
        }
        // 加载这个UI依赖的其他资源，其他资源可以也是UI
        await this.load();

        this.onInit();
        this.lang = sys.localStorage.getItem("momoverse-lang");
    }

    /** 可以在这里进行一些资源的加载, 具体实现可以看test下的代码 */
    public async load() {}

    public onInit() {}

    public onShow(...obj: any) {}

    public onShowAnimCb(...obj: any) {}

    public onHideAnimCb() {}

    public onHide() {}
    public onHideCb() {
        this.onHide()
        if(this.removeRedux){
            Redux.disConnect(this)
        }
    }
    
    public onReshow(...obj: any) {}
    
    /** 通过闭包，保留resolve.在合适的时间调用cb方法 */
    public waitPromise(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._cb = (confirm: any) => {
                resolve(confirm);
            }
        });
    }

    /**
     * 
     * @param uiFormName 窗体名称
     * @param obj 参数
     */
    // public async showUIForm(uiFormName: string, ...obj: any): Promise<UIBase> {
    //    return await UIManager.getInstance().openUIForm(uiFormName, obj);
    // }
    public async closeUIForm(): Promise<boolean> {
       return await UIManager.getInstance().closeUIForm(this.uid);
    }

    /**
     * 弹窗动画
     */
    public async showAnimation() {
        if(this.formType === FormType.PopUp) {
            this.node.scale = new Vec3(0,0,0);
            await CocosHelper.runTweenSync(this.node, tween().to(0.3, {scale: new Vec3(1,1,1)}, {easing : 'backOut'}));
        }
    }

    public async hideAnimation() {
        if(this.formType === FormType.PopUp) {
            // this.node.scale = 0;
            await CocosHelper.runTweenSync(this.node, tween().to(0.3, {scale: new Vec3(0,0,0)}, {easing : 'backIn'}));
        }
    }
    public async showMenuAnim(isLeft = false) {
        // this.node.stopAllActions();
        // this.node.opacity = 0;
        // this.node.scale = 1;
        // this.node.x = isLeft ? -150 : 150;

        // await CocosHelper.runTweenSync(this.node, tween().to(0.4, {opacity: 255, x : 0}, easeQuadraticActionOut()));
    }
    public async hideMenuAnim(isLeft = false) {
        // this.node.stopAllActions();
        // const posx = isLeft ? 150 : -150;

        // await CocosHelper.runTweenSync(this.node, tween().to(0.2, {opacity: 0, x : posx}, easeQuadraticActionIn()));
    }

    /** 设置是否挡住触摸事件 */
    private _blocker: BlockInputEvents = null;
    public setBlockInput(block: boolean) {
        // if(!this._blocker)  {
        //     let node = new Node('block_input_events');
        //     this._blocker = node.addComponent(BlockInputEvents);
        //     this._blocker.node.setContentSize(AdapterMgr.inst.visibleSize);
        //     this.node.addChild(this._blocker.node, macro.MAX_ZINDEX);
        // }
        // this._blocker.node.active = block;
    }

    public checkNatigatePath(prefabPath):boolean{
        for(let i=0;i<this.navigatorPanels.length;i++){
            let pType = this.navigatorPanels[i];
            if(UIManager.getPrefedPath(pType.prefabPath) == prefabPath){
                return true;
            }
        }
        return false
    }
}
