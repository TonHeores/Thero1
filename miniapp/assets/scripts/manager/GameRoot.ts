import { _decorator, Component, sys, Node, game, Enum, view, screen, Game, Canvas, director, resources, loader, TextAsset, JavaScript, System, JsonAsset, debug, profiler, sp } from "cc";
import Constants, { EventName, SERVER_Evn, SceneName } from "../Constant";
import { EventCenter } from "../UIFrame/EventCenter";
import UIManager from "../UIFrame/UIManager";
import Common from "../utils/common";
import NativeMgr from "../utils/NativeMgr";
import State from "../redux/state";
import Model from "../model/Model";
import Redux from "../redux";
import { SceneBase } from "./SceneBase";
import { LoginScene } from "../scene/LoginScene";
import { PomeloMgr } from "../utils/pomelo/PomeloMgr";
import { DEV, EDITOR } from "cc/env";
import { MainScene } from "../scene/MainScene";
import { SOUND_RES } from "../config/basecfg";
import PlatformMgr from "../platform/PlatformMgr";
import Ext from "../utils/exts";

export enum SERVER_OPT {
  //0 开发服 1 测试服  2 线上服
  dev = 0,
  test = 1,
  product = 2,
}
const { ccclass, property } = _decorator;
export enum ONlineState {
  online,
  offline,
}
export enum NetType {
  onChain,
  websocket,
}
@ccclass("GameRoot")
export class GameRoot extends Component {

  @property({
    type: Enum(SERVER_OPT),
    displayName: "服务器环境",
    tooltip: "服务器类型",
  })
  environment = SERVER_OPT.product;

  onlineState = ONlineState.online;
  netType = NetType.websocket;
  static Instance: GameRoot = null
  public static isInGame = false
  public static ISDelAccount = false
  bg: Node = null;
  loadingAni: Node = null;
  async onLoad() {
    console.log("GameRoot onload")
    GameRoot.Instance = this
    Constants.Evn = this.environment as any
    this.checkEvn()
    profiler.hideStats();
    this.initBg()
    await this.initUI()
    this.initPlatForm()
    this.initEventListener();
    director.addPersistRootNode(this.node)
    UIManager.openView(Constants.Panels.UILoading)
  }

  initEventListener() {
    EventCenter.on(EventName.Connecting, this.onConnecting, this);
    EventCenter.on(EventName.ConnectFail, this.onConnectFail, this);
    EventCenter.on(EventName.ConnectError, this.onConnectError, this);
    EventCenter.on(EventName.OnConnected, this.onConnected, this);
    EventCenter.on(EventName.LoginSucc, this.watchLogin, this)
    screen.on("window-resize", this.onGameResize.bind(this))
  }

  async initUI() {
    UIManager.getInstance()
    UIManager.setSkinPath(Constants.UI_PATH_PREFIX)
    UIManager.setNoticeForm(Constants.Panels.UINotice);
    UIManager.setWaitingForm(Constants.Panels.UIWaiting);
    UIManager.setToastForm(Constants.Panels.UIToast);
    UIManager.setTipForm(Constants.Panels.UITip);
    this.onGameResize()
    UIManager.setButtonClickEffect(SOUND_RES.CLICK)
    await UIManager.getInstance().loadUIForm(Constants.Panels.UIWaiting, false);
    await UIManager.getInstance().loadUIForm(Constants.Panels.UIToast, false);
    await UIManager.getInstance().loadUIForm(Constants.Panels.UITip, false);
    UIManager.getInstance().loadUIForm(Constants.Panels.UINotice, false);
  }

  initPlatForm() {
    let self = this
    PlatformMgr.getInstance().initPlatform(() => {
      self.initLang()
      self.initGame()
    })
    console.log("platform=" + sys.platform)
    console.log("isBrowser=" + sys.isBrowser + " Dev=" + DEV)
    if (sys.isBrowser && !DEV) {
      var splash = document.getElementById('splash');
      if (splash) {
        splash.style.display = 'none';
      }
    }
  }

  initLang() {
    let lang = "";
    let defaultLang = "en"
    const localLang = sys.localStorage.getItem(Constants.langKey) || defaultLang;
    console.log("localLang========" + localLang)
    if (sys.isNative) {
      let arr = ["zh_TW", "en", "ru"];
      lang = NativeMgr.getNativeLang();

      if (localLang) {
        lang = localLang;
      } else if (arr.indexOf(lang) == -1) {
        lang = defaultLang;
      }
    } else {
      lang = localLang;
    }
    console.log("lang=" + lang)
    Common.changeLang(lang);
  }

  initBg(){
    this.bg = this.node.getChildByName("bg");
    this.loadingAni = this.bg.getChildByName("loadingAni")
    let loadingImg = this.bg.getChildByName("loadingImg")
    Common.setNodeSpine("loading/loading",this.loadingAni,()=>{
      let spine = this.loadingAni.getComponent(sp.Skeleton)
			spine.setAnimation(0, "loading", true); 
      Common.unloadSprite(loadingImg)
      loadingImg.removeFromParent();
    })
  }

  initGame() {
    State.init();
    this.setUpNetWork();
    this.startConnect();
  }

  async setUpNetWork() {
    if (this.netType == NetType.onChain) {
    } else {
      if (this.onlineState == ONlineState.online) {
        PomeloMgr.getInstance();
      }
      Model.init();
    }
  }

  startConnect() {
    if (this.onlineState == ONlineState.online) {
      if (this.netType == NetType.onChain) {
        this.connectChain();
      } else {
        this.connectPomelo();
      }
    }
  }

  async connectChain() {
    console.log("connectChain")
  }

  async connectWs() {
    console.log("connectWs")
  }

  async connectPomelo() {
    console.log("connectPomelo")
    let info = PlatformMgr.getCurPlatForm().getServerAddr();
    console.log("info==========",info)
    let prefix = info.isWss ? "wss://" : "ws://"
    
		// url = "wss://ths.2dao3.link:3050"
		// url = "ws://13.232.192.87:3051"
    Common.isWebSocketSupported(prefix + info.host + ":" + info.port)
    PomeloMgr.getInstance().connect(info.isWss, info.host, info.port);
  }

  // @action
  onConnecting(params) {
    console.log("onConnecting")
    this.watchConecting()
  }

  onConnectFail(params) {
    console.log("onConnectFail")
    UIManager.hideWaiting()
    UIManager.showTip(1, Ext.i18n.t("TipsInfo_015"), Ext.i18n.t("TipsInfo_014"), this.startConnect.bind(this))
    //網路連接失敗，請檢查網路
  }

  onConnectError(params) {
    console.log("onConnectError")
    console.log(params)
  }

  onLogout() {

  }

  protected watchConecting() {
    UIManager.showWaiting(Ext.i18n.t("TipsInfo_013"))
  }

  // protected watchRepeatLogin() {
  //   // UIManager.showToast(Ext.i18n.t("ErrCode_1013"))
  //   // this.backToLogin()
  // }

  private async backToLogin() {
    console.log("backToLogin============= sceneName=" + UIManager.curSceneName)
    GameRoot.isInGame = false
    await UIManager.closeAllView()
    Model.reset()
    Redux.State.resetState()
    this.LoadScene(SceneName.Login, LoginScene, async () => {
      if(GameRoot.ISDelAccount){
        GameRoot.ISDelAccount = false
        await Common.sleep(1000)
        this.startConnect()
      }
    });
  }

  // @action
  async onConnected(params) {
    console.log("onConnected")
    UIManager.hideWaiting()
    console.log("isInGame=" + GameRoot.isInGame)
    PlatformMgr.getCurPlatForm().login()
  }

  onGameResize() {
    console.log("onGameResize")
    Constants.visibleSize = view.getVisibleSize()
    Constants.canvasSize = screen.windowSize
    UIManager.onResize()
    EventCenter.emit(EventName.OnGameResize)
  }

  //登录成功
  watchLogin() {
    console.log("watchLogin")
    if (!GameRoot.isInGame) {
      GameRoot.isInGame = true
      this.LoadScene(SceneName.Main, MainScene);
    }
    PlatformMgr.getCurPlatForm().authEnd()
  }

  //刷新场景
  refreshGame() {
    console.log("refreshGame")
  }

  pauseGame() {
    Constants.gamePause = true
  }
  resumeGame() {
    Constants.gamePause = false
  }

  async LoadScene(sceneName, sceneScript: typeof SceneBase, cb = null) {
    console.log("onLoadScene sceneName=" + sceneName)
    // await UIManager.openView(Constants.Panels.UILoadingScene, { type: 3, sceneName })
    this.hideBg()
    UIManager.LoadScene(sceneName, sceneScript, () => {
      EventCenter.emit(EventName.LoadScenePro, 1);
      console.log("LoadScene finish name=" + sceneName);
      cb && cb()
    }, (completedCount, totalCount) => {
      // console.log("LoadScene pro completedCount=" + completedCount+" totalCount="+totalCount);
      EventCenter.emit(EventName.LoadScenePro, completedCount / totalCount);
    })
  }

  public curNetType(): NetType {
    return this.netType
  }

  appendJSFile(url, cb) {
    resources.load(url, function (err, res: TextAsset) {
      if (err) {
        console.log("logError")
        console.log(err)
        return;
      }
      console.log("res=", res)
      eval(res.text)
      console.log(window)
      cb();
    })
  }

  showBg() {
    this.bg.active = true
  }

  hideBg() {
    this.bg.active = false
  }

  public logOut(type) {  //type 三种状态 1为删号 2为切换服务器 3为被挤号
    console.log("logOut type=" + type)
    PomeloMgr.instance.close()
    switch (type) {
      case 1:
        GameRoot.ISDelAccount = true
        break;
      case 2:
        break;
      case 3:
        break;
    }
    this.backToLogin()
  }

  checkEvn(){
    if(Constants.Evn == SERVER_Evn.product && !DEV){
      // console.log = ()=>{}
    }
  }
}
