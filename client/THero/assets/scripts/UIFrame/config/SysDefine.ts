/**菜单类型 */
export enum MenuType {
    /**菜单1 */
    City = 0,
    /** 屏幕 */
    Hero = 1,
    /** 屏幕 */
    Fight = 2,
    /** 屏幕 */
    Arena = 3,
    /** 固定窗口 */
    Camp = 4,
}

/**窗体类型 */
export enum FormType {
    /**主菜单 */
    Menu,
    /** 屏幕 */
    Screen,
    /** 固定窗口 */
    FixedUI,
    /** 弹出窗口 */
    PopUp,
    /** 独立窗口 */
    TopTips,
}
/**透明度类型 */
export enum ModalOpacity {
    /** 没有mask, 可以穿透 */
    None,
    /** 完全透明，不能穿透 */
    OpacityZero,
    /** 高透明度，不能穿透 */
    OpacityLow,
    /** 半透明，不能穿透 */
    OpacityHalf,
    /** 低透明度, 不能穿透 */
    OpacityHigh,
    /** 完全不透明 */
    OpacityFull,
}
/** UI的状态 */
export enum UIState {
    None = 0,
    Loading = 1,
    Showing = 2,
    Hiding = 3
}

/** 常量 */
export class SysDefine {
    /* 路径常量 */
    public static SYS_PATH_CANVAS = "Canvas";
    public static SYS_PATH_UIFORMS_CONFIG_INFO = "UIFormsConfigInfo";
    public static SYS_PATH_CONFIG_INFO = "SysConfigInfo";
    /* 标签常量 */
    public static SYS_UIROOT_NAME = "Canvas/Scene/UIROOT";
    public static SYS_UIMODAL_NAME = "Canvas/Scene/UIROOT/UIModalManager";
    public static SYS_UIAdapter_NAME = "Canvas/Scene/UIROOT/UIAdapterManager";
    /* 节点常量 */
    public static SYS_SCENE_NODE = "Scene"
    public static SYS_UIROOT_NODE = "UIROOT";
    public static SYS_MENU_NODE = "Menu";
    public static SYS_SCREEN_NODE = "Screen";
    public static SYS_FIXEDUI_NODE = "FixedUI";
    public static SYS_POPUP_NODE = "PopUp";  
    public static SYS_TOPTIPS_NODE = "TopTips";
    public static SYS_BlOCK_NODE = "UIBLOCK";

    
    public static UI_PATH_ROOT = '';

    public static buttongCLickEffect = '';
    public static panelShowEffect = '';
    public static panelClseEffect = '';
    public static radioBtnEffect = '';
}