
import { SysDefine } from "./config/SysDefine";
import UIModalScript from "./UIModalScript";
import UIBase, { MaskType } from "./UIBase";
import { Component,log,find, Node,tween,_decorator, BlockInputEvents, Vec3, UIOpacity } from "cc";
import CocosHelper from "./CocosHelper";
import UIManager from "./UIManager";

/**
 * 遮罩管理
 */
const {ccclass, property} = _decorator;

@ccclass
export default class ModalMgr extends Component {
    public static popUpRoot = SysDefine.SYS_UIROOT_NAME + '/' + SysDefine.SYS_POPUP_NODE;
    public static _inst: ModalMgr = null;
    public static get inst() {
        if(this._inst == null) {
            this._inst = new ModalMgr();
            ModalMgr.inst.uiModal = new Node("UIModalNode").addComponent(UIOpacity).addComponent(UIModalScript);
            ModalMgr.inst.uiModal.init();
        }
        return this._inst;
    }
    private uiModal:UIModalScript = null;

    /** 为mask添加颜色 */
    private async showModal(maskType: MaskType) {
        await this.uiModal.showModal(maskType.opacity, maskType.easingTime, maskType.isEasing);
    }

    public async checkModalWindow(uiBases: UIBase[]) {
        let uiBase = null;
        for(let i=uiBases.length-1; i>=0; i--) {
            if(uiBases[i].maskType.opacity > 0) {
                uiBase = uiBases[i];
                break;
            }
        }
        if(this.uiModal.node.parent){
            if(!uiBase){
                await CocosHelper.runTweenSync(this.uiModal.node, tween().to(0.4, {opacity : 0})) 
                this.uiModal.node.removeFromParent();
            } else {
                this.uiModal.node.removeFromParent();
            }
        }
        if(!!uiBase){
            let n = find(ModalMgr.popUpRoot)
            n.addChild(this.uiModal.node);
            let zIndex = uiBases.length-1
            this.uiModal.node.setSiblingIndex(zIndex)
            
            this.uiModal.uid = uiBase.uid;
            this.showModal(uiBase.maskType);
        }

        if(!this.uiModal.node.parent) {
            this.uiModal.node.getComponent(UIOpacity).opacity = 0;
        }
    }

    onResize(){
        if(this.uiModal){
            this.uiModal.onResize()
        }
    }
}