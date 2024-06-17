import UIBase from "./UIBase";
import { SysDefine, FormType, MenuType } from "./config/SysDefine";
import ResMgr from "./ResMgr";
import ModalMgr from "./ModalMgr";
import AdapterMgr, { AdaptaterType } from "./AdapterMgr";
import { Component,log,find, Node,tween,_decorator, warn,js,instantiate,view, UITransform, Scene, game, director, SceneAsset, Camera } from "cc";
import CocosHelper from "./CocosHelper";
import { EventCenter } from "./EventCenter";
import SoundMgr from "./SoundMgr";
import { SceneBase } from "../manager/SceneBase";
import { EventName } from "../Constant";

const {ccclass, property} = _decorator;

@ccclass
export default class UIManager extends Component {
    private _NoMenu: Node = null;                              // 全屏显示的UI 挂载结点
    private _NoNormal: Node = null;                              // 全屏显示的UI 挂载结点
    private _NoFixed: Node = null;                               // 固定显示的UI
    public _NoPopUp: Node = null;                               // 弹出窗口
    private _NoTips: Node = null;                                // 独立窗体

    private _blockUI:Node = null;                                //遮挡层，用于遮挡所有点击

    private _StaCurrentUIForms:Array<UIBase> = [];                                      // 存储弹出的窗体 用于popup
    private _MapAllUIForms: {[key: string]: UIBase} = js.createMap();                // 所有的窗体 加载过的都保存着
    private _MapCurrentShowUIForms: {[key: string]: UIBase} = js.createMap();        // 正在显示的窗体(不包括弹窗)
    private _MapIndependentForms: {[key: string]: UIBase} = js.createMap();          // 独立窗体 独立于其他窗体, 不受其他窗体的影响
    private _LoadingForm: {[key: string]: boolean} = js.createMap();                // 正在加载的form 
    public _closingForms = []
    public _waitingForm = null
    private _uiCame:Camera = null;
    public get uiCame() {
        return this._uiCame;
    }

    public static canvasWidth = 1242;
    public static canvasHeight = 2688;
    private static canvas:Node = null;

    private _currWindowId = '';
    public get currWindowId() {
        return this._currWindowId;
    }
    private _currScreenId = '';
    public get currScreenId() {
        return this._currScreenId;
    }
    
    private _currScreenPath = '';
    public get currScreenPath() {
        return this._currScreenPath;
    }

    private static instance: UIManager = null;// 单例
    public static getInstance(): UIManager {
        if(this.instance == null) {
            this.canvas = find("Canvas");
            let scene = this.canvas.getChildByName(SysDefine.SYS_SCENE_NODE);
            if(!scene) {
                scene = new Node(SysDefine.SYS_SCENE_NODE);
                scene.parent = this.canvas;
            }
            let UIROOT = new Node(SysDefine.SYS_UIROOT_NODE);
            scene.addChild(UIROOT);
            UIManager.onResize()
            
            UIROOT.addChild(new Node(SysDefine.SYS_MENU_NODE));
            UIROOT.addChild(new Node(SysDefine.SYS_SCREEN_NODE));
            UIROOT.addChild(new Node(SysDefine.SYS_FIXEDUI_NODE));
            UIROOT.addChild(new Node(SysDefine.SYS_POPUP_NODE));
            UIROOT.addChild(new Node(SysDefine.SYS_TOPTIPS_NODE));
            let UIBLOCK = new Node(SysDefine.SYS_BlOCK_NODE);
            scene.addChild(UIBLOCK);
            UIBLOCK.active = false;
            this.instance = find(SysDefine.SYS_UIROOT_NAME).addComponent<UIManager>(this);
            this.instance._blockUI = UIBLOCK;
            ModalMgr.inst
            SoundMgr.inst
            this.instance._uiCame =  this.canvas.getComponentInChildren(Camera);
            // director.once(director.EVENT_AFTER_SCENE_LAUNCH, () => {
            //     this.instance = null;
            // });
        }
        return this.instance;
    }

    static onResize(){
        let size = view.getVisibleSize();
        UIManager.canvasWidth = size.width;
        UIManager.canvasHeight = size.height;
        ModalMgr.inst.onResize()
        console.log("size================================"+size.toString())
    }

    /** 设定皮肤路径 */
    private _block = 0;

    public static setMenusNum(menu_mount){
        const middle_mount = (menu_mount-1) / 2 ;
        Object.keys(new Array(menu_mount).fill(0)).map((item)=>{
            const child_node = new Node(`${MenuType[item]}_box`);
           console.log("canvasWidth="+this.canvasWidth+" canvasHeight="+this.canvasHeight)
            let trans = child_node.addComponent(UITransform)
            trans.width = this.canvasWidth;
            trans.height = this.canvasHeight;
            // child_node.position.x = (Number(item) - middle_mount) * this.canvasWidth;
            UIManager.getInstance()._NoMenu.addChild(child_node);
        })
    }

    private resizeMenu(){
        // const width = view.getVisibleSize().width;
        // UIManager.canvasWidth = width;
        // const middle_mount = (UIManager.menu_mount-1) / 2;
        // const posX = - ((this.nowMenu - (middle_mount)) * width);
        // this._NoMenu.x = posX;
        // this._NoMenu.children.map((item,i)=>{
        //     item.width = width;
        //     item.x = (Number(i) - middle_mount) * UIManager.canvasWidth;
        // })
    }

    public static setInputBlock(bool: boolean) {
        UIManager.instance.setInputBlock(bool)
    }

    private setInputBlock(bool: boolean){
        bool ? ++ this._block : -- this._block;
        this._blockUI.active = this._block > 0;
    }
    
    /** 设定皮肤路径 */
    public static async setSkinPath(path:string) {
        SysDefine.UI_PATH_ROOT = path;
    }
    /** 打开关闭UIBase */
    public static async openView(panel:typeof UIBase,...parmas: any): Promise<UIBase> {
        let formPath = UIManager.getPrefedPath(panel.prefabPath)
        if(UIManager.instance.checkUIFormIsLoaded(formPath)||formPath.indexOf("UIWaiting")!=-1){
            return await UIManager.getInstance().openUIForm(panel,panel.canRecall, ...parmas);
        }else{
            // await this.showWaiting("loading");
            let uiBase = await UIManager.getInstance().openUIForm(panel,panel.canRecall, ...parmas);
            // await this.hideWaiting();
            return uiBase;
        }
    }
    public static async openViewWithLoading(panel:typeof UIBase,...parmas: any): Promise<UIBase> {
        await this.showWaiting();
        let uiBase = await UIManager.openView(panel,parmas);
        await this.hideWaiting();
        return uiBase;
    }
    public static async openViewWithPending(panel:typeof UIBase,...parmas: any) {
        let isclosing = false
        let prefabPath = UIManager.getPrefedPath(panel.prefabPath)
        UIManager.instance._closingForms.forEach(element => {
            if(element == prefabPath){
                isclosing = true
            }
        });
        if(isclosing){
            UIManager.instance._waitingForm = {panel,parmas,path:prefabPath}
        }else{
            UIManager.getInstance().openUIForm(panel,panel.canRecall, ...parmas);
        }
    }
    public static async closeView(panel:typeof UIBase): Promise<boolean> {
        return await UIManager.getInstance().closeUIForm(UIManager.getPrefedPath(panel.prefabPath));
    }

    public static getPrefedPath(path: string):string {
        // console.log(SysDefine.UI_PATH_ROOT+path)
        return SysDefine.UI_PATH_ROOT+path;
    }

    onLoad () {
        // 初始化结点
        this._NoMenu = this.node.getChildByName(SysDefine.SYS_MENU_NODE);
        this._NoNormal = this.node.getChildByName(SysDefine.SYS_SCREEN_NODE);
        this._NoFixed = this.node.getChildByName(SysDefine.SYS_FIXEDUI_NODE);
        this._NoPopUp = this.node.getChildByName(SysDefine.SYS_POPUP_NODE);
        this._NoTips = this.node.getChildByName(SysDefine.SYS_TOPTIPS_NODE);

        view.setResizeCallback(()=>{
            this.resizeMenu();
        })
        
        AdapterMgr.inst.adapatByType(AdaptaterType.FullScreen, this._NoMenu);
        AdapterMgr.inst.adapatByType(AdaptaterType.FullScreen, this._NoNormal);
        AdapterMgr.inst.adapatByType(AdaptaterType.FullScreen, this._NoFixed);
        AdapterMgr.inst.adapatByType(AdaptaterType.FullScreen, this._NoPopUp);
        AdapterMgr.inst.adapatByType(AdaptaterType.FullScreen, this._NoTips);
    }
    
    start() {        
    }

    /**  */
    public getComponentByUid(uid: string) {
        return this._MapAllUIForms[uid];
    }

    /** 预加载UIForm */
    public async loadUIForms(...panels:typeof UIBase[]) {
        for(const panel of panels) {
            let formPath = UIManager.getPrefedPath(panel.prefabPath)
            if(!this.checkUIFormIsLoading(formPath)){
                let uiBase = await this.loadUIForm(panel,false);
                if(!uiBase) {
                    console.warn(`${uiBase}没有被成功加载`);
                }
            }
        }
    }
    
    /**
     * 重要方法 加载显示一个UIForm
     * @param prefabPath 
     * @param obj 初始化信息, 可以不要
     */
    public async openUIForm(panel:typeof UIBase,canRecall, ...params: any) {
        let prefabPath = UIManager.getPrefedPath(panel.prefabPath)
        // console.log("openUIForm prefabPath="+prefabPath)
        if(prefabPath === "" || prefabPath == null) return ;
        let isShowing = false
        if(this.checkUIFormIsShowing(prefabPath) || this.checkUIFormIsLoading(prefabPath)) {
            if(!canRecall){
                warn(`${prefabPath}窗体已经在显示,或者正在加载中!`);
                return null;
            }else{
                if(this.checkUIFormIsShowing(prefabPath)){
                    isShowing = true
                }
            }
        }
        let uiBase = await this.loadFormsToAllUIFormsCatch(panel);
        if(uiBase == null) {
            warn(`${prefabPath}未加载!`);
            return null;
        }
        if(isShowing){
            if(uiBase.formType === FormType.Menu){
                this.enterMenu(prefabPath, ...params)
            } else{
                uiBase.onReshow(...params)
            }
            return uiBase
        }
        //通知打开某个面板
        // let arr = uiBase.name.split("<")
        // let panelName = arr[1].replace(">","")
        let panelName = CocosHelper.getComponentName(uiBase)
        console.log("prefabPath="+prefabPath)
        // EventCenter.emit(EventName.openUIView,panelName);
        // 初始化窗体名称
        uiBase.uid = prefabPath;
        
        switch(uiBase.formType) {
            case FormType.Menu:
                await this.enterMenu(prefabPath, ...params)
            break;
            case FormType.Screen:
                await this.enterUIFormsAndHideOther(prefabPath, ...params);
            break;
            case FormType.FixedUI:
                await this.loadUIToCurrentCache(prefabPath, ...params);
            break;
            case FormType.PopUp:
                //弹窗要播放音效
                // SoundMgr.inst.playEffect(SysDefine.panelShowEffect)
                await this.pushUIFormToStack(prefabPath, ...params);
            break;
            case FormType.TopTips:                        // 独立显示
                await this.loadUIFormsToIndependent(prefabPath, ...params);
            break;
        }

        return uiBase;
    }
    /**
     * 重要方法 关闭一个UIForm
     * @param prefabPath 
     */
    public async closeUIForm(prefabPath: string) {
        if(prefabPath == "" || prefabPath == null) return ;
        // console.log("closeUIForm prefabPath="+prefabPath,this._MapAllUIForms)
        let UIBase = this._MapAllUIForms[prefabPath];
        
        if(UIBase == null) return true;
        this._closingForms.push(prefabPath)
        switch(UIBase.formType) {
            case FormType.Menu:
                await this.exitMenu(prefabPath);
            break;
            case FormType.Screen:
                await this.exitUIFormsAndDisplayOther(prefabPath);
            break;
            case FormType.FixedUI:                             // 普通模式显示
                await this.exitUIForms(prefabPath);
            break;
            case FormType.PopUp:
                // SoundMgr.inst.playEffect(SysDefine.panelClseEffect)
                await this.popUIForm(prefabPath);
            break;
            case FormType.TopTips:
                await this.exitIndependentForms(prefabPath);
            break;
        }
        
        let arr = UIBase.name.split("<")
        let panelName = arr[1].replace(">","")
        // EventCenter.emit(EventName.closeUIView,panelName);
        // 判断是否销毁该窗体
        
        if(UIBase.canRemove) {
            this.destoryForm(UIBase, prefabPath);
        }
        this._closingForms = this._closingForms.filter((item)=>{
            return item!=prefabPath
        })
        if(this._waitingForm&&this._waitingForm.path == prefabPath){
            UIManager.getInstance().openUIForm(this._waitingForm.panel,this._waitingForm.panel.canRecall, ...this._waitingForm.parmas);
            this._waitingForm = null
        }
        return true;
    }

    /**
     * 从全部的UI窗口中加载, 并挂载到结点上
     */
    private async loadFormsToAllUIFormsCatch(panel:typeof UIBase) {
        let prefabPath = UIManager.getPrefedPath(panel.prefabPath)
        let baseUIResult = this._MapAllUIForms[prefabPath];
        // 判断窗体不在mapAllUIForms中， 也不再loadingForms中
        if (baseUIResult == null && !this._LoadingForm[prefabPath]) {
            //加载指定名称的“UI窗体
            this._LoadingForm[prefabPath] = true;
            baseUIResult  = await this.loadUIForm(panel);
            this._LoadingForm[prefabPath] = false;
            delete this._LoadingForm[prefabPath];
        }
        return baseUIResult;
    }

    /**
     * 从resources中加载
     * @param prefabPath 
     */
    public async loadUIForm(panel:typeof UIBase,addToParent=true) {
        let formPath = UIManager.getPrefedPath(panel.prefabPath)
        if(this.checkUIFormIsLoaded(formPath)){
            return;
        }
        if(formPath == "" || formPath == null){
            return ;
        }
        
        let pre = await ResMgr.inst.loadForm(formPath);
        if(!pre) {
            warn(`${formPath} 资源加载失败, 请确认路径是否正确`);
            return ;
        }
        let node: Node = instantiate(pre);
        // let baseUI = node.addComponent(node.name);
        let baseUI = node.addComponent(panel);
        if(baseUI == null) {
            warn(`${formPath} 没有绑定UIBase的Component`);
            return ;
        }
        baseUI.uid = panel.prefabPath;
        baseUI.pre = pre
        node.active = false;
        if(addToParent){
            switch(baseUI.formType) {
                case FormType.Menu:
                    // UIManager.getInstance()._NoMenu.addChild(node);
                    UIManager.getInstance()._NoMenu.children[baseUI.menuType].addChild(node);
                break;
                case FormType.Screen:
                    UIManager.getInstance()._NoNormal.addChild(node);
                break;
                case FormType.FixedUI:
                    UIManager.getInstance()._NoFixed.addChild(node);
                break;
                case FormType.PopUp:
                    UIManager.getInstance()._NoPopUp.addChild(node);
                break;
                case FormType.TopTips:
                    UIManager.getInstance()._NoTips.addChild(node);
                break;
            }
        }
        this._MapAllUIForms[formPath] = baseUI;
        
        return baseUI;
    }

    /**
     * 清除栈内所有窗口
     */
    private async clearStackArray() {
        if(this._StaCurrentUIForms == null || this._StaCurrentUIForms.length <= 0) {
            return ;
        }
        for(const baseUI of this._StaCurrentUIForms) {
            await baseUI.closeUIForm();
        }
        this._StaCurrentUIForms = [];
        return ;
    }
    /**
     * 关闭栈顶窗口
     */
    public closeTopStackUIForm() {
        if(this._StaCurrentUIForms != null && this._StaCurrentUIForms.length >= 1) {
            let uiFrom = this._StaCurrentUIForms[this._StaCurrentUIForms.length-1];
            if(uiFrom.maskType.clickMaskClose) {
                uiFrom.closeUIForm();
            }   
        }
    }

    /**
     * 加载到缓存中, fixUI
     * @param prefabPath
     */
    private async loadUIToCurrentCache(prefabPath: string, ...params: any) {
        let UIBase: UIBase = null;
        let UIBaseFromAllCache: UIBase = null;

        UIBase = this._MapCurrentShowUIForms[prefabPath];
        if(UIBase != null) return ;                                     // 要加载的窗口正在显示

        UIBaseFromAllCache = this._MapAllUIForms[prefabPath];
        if(UIBaseFromAllCache != null) {
            // AdapterMgr.inst.adapatByType(UIBaseFromAllCache.fixedType, UIBaseFromAllCache.node);
            await UIBaseFromAllCache._preInit();
            this._MapCurrentShowUIForms[prefabPath] = UIBaseFromAllCache;
            
            UIBaseFromAllCache.onShow(...params);
            await this.showForm(UIBaseFromAllCache);
            UIBaseFromAllCache.onShowAnimCb(...params);
        }
    }
    /**
     * 加载到栈中
     * @param prefabPath
     */
    private async pushUIFormToStack(prefabPath: string, ...params: any) {
        let baseUI = this._MapAllUIForms[prefabPath];
        if(baseUI == null) return ;
        await baseUI._preInit();
        // 加入栈中, 同时设置其zIndex 使得后进入的窗体总是显示在上面
        this._StaCurrentUIForms.push(baseUI);
        
        baseUI.onShow(...params);
        this._currWindowId = baseUI.uid;
        ModalMgr.inst.checkModalWindow(this._StaCurrentUIForms);
        await this.showForm(baseUI);

        let zIndx = UIManager.getInstance()._NoPopUp.children.length
        // console.log("zIndex="+zIndx+" prefabPath="+prefabPath)
        baseUI.node.setSiblingIndex(zIndx)

        baseUI.onShowAnimCb(...params);
    }
    /**
     * 加载并滑动菜单栏
     */
    private async enterMenu(prefabPath : string, ...params : any){

        let UIBaseFromAll = this._MapAllUIForms[prefabPath];
        if(UIBaseFromAll == null) return;

        this._NoMenu.active = true;
        // 隐藏其他窗口 
        for(let key in this._MapCurrentShowUIForms) {
            if((this._MapCurrentShowUIForms[key].isNavigator&&this._MapCurrentShowUIForms[key].checkNatigatePath(prefabPath))||this._MapCurrentShowUIForms[key].formType === FormType.Menu ){
                if(this._MapCurrentShowUIForms[key].formType === FormType.Menu&&key!=prefabPath){
                    this._MapCurrentShowUIForms[key].onHideCb()
                }
            }else{
                await this._MapCurrentShowUIForms[key].closeUIForm();
            }
        }

        await UIBaseFromAll._preInit();

        this._MapCurrentShowUIForms[prefabPath] = UIBaseFromAll;
        
        UIBaseFromAll.onShow(...params);
        await this.showForm(UIBaseFromAll);
        UIBaseFromAll.onShowAnimCb(...params);
    }

    /**
     * 加载时, 关闭其他窗口
     */
    private async enterUIFormsAndHideOther(prefabPath: string, ...params: any) {
        let UIBase = this._MapCurrentShowUIForms[prefabPath];
        if(UIBase != null) return ;
        // 隐藏其他窗口 
        this._NoMenu.active = false;
        for(let key in this._MapCurrentShowUIForms) {
            if(this._MapCurrentShowUIForms[key]){
                await this._MapCurrentShowUIForms[key].closeUIForm();
            }
        }

        let uiForm = this._StaCurrentUIForms[this._StaCurrentUIForms.length-1]
        while(uiForm){
            if(uiForm.isNavigator&&uiForm.checkNatigatePath(prefabPath)){

            }else{
                await uiForm.closeUIForm();
            }
            uiForm = this._StaCurrentUIForms[this._StaCurrentUIForms.length-1]
        }

        let UIBaseFromAll = this._MapAllUIForms[prefabPath];
        
        if(UIBaseFromAll == null) return ;
        // AdapterMgr.inst.adapatByType(AdaptaterType.FullScreen, UIBaseFromAll.node);
        await UIBaseFromAll._preInit();

        this._MapCurrentShowUIForms[prefabPath] = UIBaseFromAll;
        
        UIBaseFromAll.onShow(...params);
        this._currScreenId = UIBaseFromAll.uid;
        this._currScreenPath = prefabPath
        await this.showForm(UIBaseFromAll);
        UIBaseFromAll.onShowAnimCb(...params);
    }

    /** 加载到独立map中 */
    private async loadUIFormsToIndependent(prefabPath: string, ...params: any) {
        let UIBase = this._MapAllUIForms[prefabPath];
        if(UIBase == null) return ;
        await UIBase._preInit();
        this._MapIndependentForms[prefabPath] = UIBase;
        
        UIBase.onShow(...params);
        await this.showForm(UIBase);
        UIBase.onShowAnimCb(...params);
    }

    /**
     * --------------------------------- 关闭窗口 --------------------------
     */
    /**
     * 关闭一个UIForm
     * @param prefabPath 
     */
    private async exitUIForms(prefabPath: string) {
        let UIBase = this._MapAllUIForms[prefabPath];
        if(UIBase == null) return ;
        UIBase.onHideCb();
        await this.hideForm(UIBase);
        UIBase.onHideAnimCb();

        this._MapCurrentShowUIForms[prefabPath] = null;
        delete this._MapCurrentShowUIForms[prefabPath];
    }
    private async popUIForm(prefabPath: string) {
        if(this._StaCurrentUIForms.length >= 1) {
            let newArr = []
            let topUIForm = null
            this._StaCurrentUIForms.forEach(element => {
                if(element.uid == prefabPath){
                    topUIForm = element
                }else{
                    newArr.push(element)
                }
            });
            this._StaCurrentUIForms = newArr
            // let topUIForm = this._StaCurrentUIForms.pop();
            topUIForm&&topUIForm.onHideCb();
            await ModalMgr.inst.checkModalWindow(this._StaCurrentUIForms);
            await this.hideForm(topUIForm);
            topUIForm&&topUIForm.onHideAnimCb();
            this._currWindowId = this._StaCurrentUIForms.length > 0 ? this._StaCurrentUIForms[this._StaCurrentUIForms.length-1].uid : '';
        }
    }
    private async exitMenu(prefabPath: string){
        if(prefabPath == "" || prefabPath == null) return ;

        let UIBase = this._MapCurrentShowUIForms[prefabPath];
        if(UIBase == null) return ;
        UIBase.onHideCb();
        await this.hideForm(UIBase);
        UIBase.onHideAnimCb();
        
        this._MapCurrentShowUIForms[prefabPath] = null;
        delete this._MapCurrentShowUIForms[prefabPath];
        
    }
    private async exitUIFormsAndDisplayOther(prefabPath: string) {
        if(prefabPath == "" || prefabPath == null) return ;

        let UIBase = this._MapCurrentShowUIForms[prefabPath];
        if(UIBase == null) return ;

        UIBase.onHideCb();
        await this.hideForm(UIBase);
        UIBase.onHideAnimCb();

        this._MapCurrentShowUIForms[prefabPath] = null;
        delete this._MapCurrentShowUIForms[prefabPath];
    }
    private async exitIndependentForms(prefabPath: string) {
        let UIBase = this._MapAllUIForms[prefabPath];
        if(UIBase == null) return ;
        UIBase.onHideCb();
        await this.hideForm(UIBase);
        UIBase.onHideAnimCb();

        this._MapIndependentForms[prefabPath] = null;
        delete this._MapIndependentForms[prefabPath];
    }

    private async showForm(baseUI: UIBase) {
        baseUI.node.active = true;
        switch(baseUI.formType) {
            case FormType.Menu:
                UIManager.getInstance()._NoMenu.children[baseUI.menuType].addChild(baseUI.node);
            break;
            case FormType.Screen:
                UIManager.getInstance()._NoNormal.addChild(baseUI.node);
            break;
            case FormType.FixedUI:
                UIManager.getInstance()._NoFixed.addChild(baseUI.node);
            break;
            case FormType.PopUp:
                UIManager.getInstance()._NoPopUp.addChild(baseUI.node);
            break;
            case FormType.TopTips:
                UIManager.getInstance()._NoTips.addChild(baseUI.node);
            break;
        }
        // if(baseUI.formType === FormType.Menu){
        //     // this._NoMenu.stopAllActions();
        //     this.nowMenu = baseUI.menuType;
        //     const posX = - (baseUI.menuType - ((UIManager.menu_mount-1)/2)) * UIManager.canvasWidth;
            // CocosHelper.runTweenSync(this._NoMenu, tween().to(0.6, {x : posX}, easeCubicActionOut()));
        // } else {
            await baseUI.showAnimation();
        // }
    }
    private async hideForm(baseUI: UIBase) {
        if(baseUI){
            await baseUI.hideAnimation();
            baseUI.node.active = false;
            baseUI.node.removeFromParent()
        }
    }
    /** 销毁 */
    private destoryForm(UIBase: UIBase, prefabPath: string) {
        if(UIBase.canDestory) {
            ResMgr.inst.destoryForm(UIBase);
        }
        // 从allmap中删除
        this._MapAllUIForms[prefabPath] = null;
        delete this._MapAllUIForms[prefabPath];
    }
    /** 窗体是否正在已经加载 */
    public checkUIFormIsLoaded(prefabPath: string) {
        let UIBases = this._MapAllUIForms[prefabPath];
        if (UIBases == null) {
            return false;
        }
        return true
    }
    /** 窗体是否正在显示 */
    public checkUIFormIsShowingByPanel(panel:typeof UIBase) {
        let prefabPath = UIManager.getPrefedPath(panel.prefabPath)
        return UIManager.getInstance().checkUIFormIsShowing(prefabPath)
    }
    /** 窗体是否正在显示 */
    public checkUIFormIsShowing(prefabPath: string) {
        let UIBases = this._MapAllUIForms[prefabPath];
        if (UIBases == null) {
            return false;
        }
        return UIBases.node.active;
    }
    /** 窗体是否正在加载 */
    public checkUIFormIsLoading(prefabPath: string) {
        let UIBase = this._LoadingForm[prefabPath];
        return !!UIBase;
    }

    static waitingForm;
    /** 设置toast类型 */
    public static setWaitingForm(waitingForm) {
        this.waitingForm = waitingForm
    }
    public static showWaiting(tip="") {
        console.log("showWaiting")
        if(!this.waitingForm) {
            warn('请先设置waiting form');
            return ;
        }
        let params = {tip:tip}
       UIManager.openView(this.waitingForm,params);
    }

    public static hideWaiting() {
       console.log("hideWaiting")
       UIManager.closeView(this.waitingForm);
    }

    static toastForm;
    /** 设置toast类型 */
    public static setToastForm(toastForm) {
        this.toastForm = toastForm
    }
    public static showToast(str) {
        UIManager.openView(this.toastForm,str);
    }

    static tipForm;
    /** 设置toast类型 */
    public static setTipForm(tipForm) {
        this.tipForm = tipForm
    }
    //type = 1 只显示一个居中的关闭按键  2 显示两个按键 cb:当显示确定按钮时的确定回调函数  btnLb btnIcon为确定按钮的特殊显示
    public static showTip(type,title,content,cb=null,checkCb=null,cancelCb=null,btnLb=null,btnIcon=null,cancelLb=null,countdown=0) {
        let showCheck = false
        if(checkCb!=null){
            showCheck = true
        }
        let params = {
            type,
            title,
            content,
            cb,
            btnLb,
            btnIcon,
            showCheck,
            checkCb,
            cancelCb,
            cancelLb,
            countdown
        }
        UIManager.openView(this.tipForm,params);
    }

    static noticeForm;
    /** 设置类型 */
    public static setNoticeForm(noticeForm) {
        this.noticeForm = noticeForm
    }

    public static showNotice(title,content){
        let data = {title:title,content:content}
        UIManager.openView(this.noticeForm,data)
    }
    public static setButtonClickEffect(effectUrl) {
        SysDefine.buttongCLickEffect = effectUrl
    }

    public static setPanelShowEffect(effectUrl) {
        SysDefine.panelShowEffect = effectUrl
    }

    public static setPanelCloseEffect(effectUrl) {
        SysDefine.panelClseEffect = effectUrl
    }

    public static setRadioBtnEffect(effectUrl) {
        SysDefine.radioBtnEffect = effectUrl
    }

    public static async closeAllView() {
        for(let key in UIManager.instance._MapAllUIForms) {
            console.log("closing panel="+key)
            if(UIManager.instance._MapAllUIForms[key]){
                await UIManager.instance._MapAllUIForms[key].closeUIForm();
            }
        }
    }

    public static curScene:Node = null
    public static curSceneName = null
    public static lodingScene = false
    public static async LoadScene(sceneName,sceneScript:typeof SceneBase,cb=null,progressCb=null) {
        if(sceneName == UIManager.curSceneName){
            console.warn("curScene is already "+sceneName)
            return
        }
        if(this.lodingScene){
            return
        }
        this.lodingScene = true
        if(UIManager.curScene){
            let sceneS = UIManager.curScene.getChildByName("Canvas").getComponent(SceneBase)
            if(sceneS){
                sceneS.onExit()
            }
        }
        // SoundMgr._inst.reset()

        director.preloadScene(sceneName,(completedCount: number, totalCount: number, item: any)=>{
            if(progressCb){
                progressCb(completedCount,totalCount);
            }
        },(error: null | Error, scene?: SceneAsset)=>{
            director.loadScene(sceneName,(error: null | Error, scene?: Scene)=>{
                console.log("haveLoaded")
                UIManager.curScene = scene
                UIManager.curSceneName = sceneName
                let sceneS = this.canvas.getComponent(SceneBase)
                sceneS && sceneS.destroy();
                sceneS = this.canvas.addComponent(sceneScript);
                if(sceneS){
                    sceneS.onEnter()
                }
                this.lodingScene = false
                if(cb){
                    cb()
                }
            })
        })
    }

    public static addNodeToTop(node:Node){
        UIManager.instance._NoTips.addChild(node)
    }
}
