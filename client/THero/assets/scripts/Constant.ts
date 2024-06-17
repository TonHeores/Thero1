/** 常量 */
import  * as ss  from './UIScript/indexPrefab';
export default class Constants {
    public static UI_PATH_PREFIX = 'prefab/ui/';
    public static Panels = ss
    public static visibleSize = null;
    public static canvasSize = null;
    public static gamePause = false //是否已经暂停游戏
    public static GameIsReady = false //是否已经暂停游戏
    public static frameRate = 30;//帧率 
    //战斗
    public static gamePetAniType = 2;//0为单张图片  1 为序列帧 2 为spine

    public static keyScheme = "gopKey"
    public static MainPanel = [ 
        // ss.UIDailyTasks,
    ]

    //版本号
    public static version = "1.0.0"
    public static build = "1"
}

export enum SceneName {
    Login = "login",
    Main = "main",
}

export enum EventName {
    Connecting = "Connecting",
    ConnectFail = "ConnectFail",
    ConnectError = "ConnectError",
    OnConnected = "OnConnected",

    OnGameResize = "OnGameResize",
    OnPanelLoaded = "OnPanelLoaded",
    ChangeLang = "ChangeLang", //更改语言
    LoadScenePro = "LoadScenePro",
    
    LoginSucc = "LoginSucc",
    LoginFail = "LoginFail",
    SellEquip = "SellEquip",
    StartFight = "StartFight", //开始战斗
    EditNameSucc = "EditNameSucc", 
}

/**道具类型 */
export enum ItemShowType  {
    TypeAll,          //道具(包括所有)
    TypePet,          //幻兽
    TypeFood,         //食物
    TypeSkill,        //技能书
    TypeImportant,    //重要物品
}

/**道具使用类型 */
export enum ItemUseType {
    UseNull,       //不可使用
    UseMulti,      //可批量使用
    UseSingle,     //仅可单个使用
}

/**科技类型 */
export enum TechnologyType {
    NormalType = 1,
    SpecialType = 2
}

/**建筑类型 */
export enum BuildType {
    BuildTypeAll,       //所有类型
    BuildBase,          //基础建筑
    BuildMaterail,      //原料建筑
    BuildWorking,       //加工建筑
    BuildEfficient,     //效能提升建筑
    BuildEnvironment,   //环境建筑
    BuildMatched,       //配套建筑
}