import { _decorator, Component, find, sys, Node, game, Enum, view, screen, Game, Canvas, director, resources, loader, TextAsset, JavaScript, System, JsonAsset } from "cc";
import Constants, { EventName, SceneName } from "../Constant";
import SeverConfig, { SERVER_OPT } from "../SeverConfig";
import { EventCenter } from "../UIFrame/EventCenter";
import UIManager from "../UIFrame/UIManager";
import Common from "../utils/common";
import NativeMgr from "../utils/NativeMgr";
import State from "../redux/state";
import Model from "../model/Model";
import Ext from "../utils/exts";
import Redux from "../redux";
import { SceneBase } from "./SceneBase";
import { LoginScene } from "../scene/LoginScene";
import { PomeloMgr } from "../utils/pomelo/PomeloMgr";
import { DEV, EDITOR } from "cc/env";
import { ConfigHelper } from "../utils/ConfigHelper";
import { MainScene } from "../scene/MainScene";
import { SOUND_RES } from "../config/basecfg";
import UserModel from "../model/UserModel";

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
    type: Enum(ONlineState),
    displayName: "是否离线",
    tooltip: "是否是单机调试模式",
  })
  onlineState = ONlineState.online;

  // @property({
  //   type: Enum(NetType),
  //   displayName: "网络模式",
  //   tooltip: "网络链接模式",
  // })
  netType = NetType.websocket;
  static Instance: GameRoot = null
  bg: Node = null;
  // private _configData: object = null;
  async onLoad() {
    console.log("GameRoot onload")
    let url=window.location.href
    console.log("url="+url)
    this.bg = this.node.getChildByName("bg");
    await this.initUI()
    this.initLang()
    this.initGame()
    this.initEventListener();
    GameRoot.Instance = this
    director.addPersistRootNode(this.node)

    if (UIManager.curScene == null) {
      this.LoadScene(SceneName.Login, LoginScene);
    }
    if (sys.isBrowser && !DEV) {
      var splash = document.getElementById('splash');
      if (splash) {
        splash.style.display = 'none';
      }
    }
  }

  initEventListener() {
    EventCenter.on(EventName.Connecting, this.onConnecting, this);
    EventCenter.on(EventName.ConnectFail, this.onConnectFail, this);
    EventCenter.on(EventName.ConnectError, this.onConnectError, this);
    EventCenter.on(EventName.OnConnected, this.onConnected, this);
    // EventCenter.on("logout", this.onLogout, this)
    EventCenter.on(EventName.LoginSucc, this.watchLogin, this)
    screen.on("window-resize", this.onGameResize.bind(this))
  }

  async initUI() {
    UIManager.getInstance()
    UIManager.setSkinPath(Constants.UI_PATH_PREFIX)
    await UIManager.getInstance().loadUIForm(Constants.Panels.UINotice, false);
    await UIManager.getInstance().loadUIForm(Constants.Panels.UIWaiting, false);
    await UIManager.getInstance().loadUIForm(Constants.Panels.UIToast, false);
    await UIManager.getInstance().loadUIForm(Constants.Panels.UITip, false);
    UIManager.setNoticeForm(Constants.Panels.UINotice);
    UIManager.setWaitingForm(Constants.Panels.UIWaiting);
    UIManager.setToastForm(Constants.Panels.UIToast);
    UIManager.setTipForm(Constants.Panels.UITip);
    this.onGameResize()
    UIManager.setButtonClickEffect(SOUND_RES.CLICK)
  }

  initLang() {
    let lang = "";
    let defaultLang = "zh_CN"
    const localLang = sys.localStorage.getItem("momoverse-lang") || defaultLang;
    if (sys.isNative) {
      let arr = ["zh_CN", "zh_TW", "kr", "es", "de", "en", "jp", "fr", "ru"];
      lang = NativeMgr.getNativeLang();

      if (localLang) {
        lang = localLang;
      } else if (arr.indexOf(lang) == -1) {
        lang = defaultLang;
      }
    } else if (sys.isBrowser) {
      console.log("isbrowser")
      // lang = navigator.language||navigator["userLanguage"];
      lang = Common.getUrlParams("lang")

      lang = lang || localLang;
    } else {
      lang = defaultLang;
    }

    if (lang === "zh_SG") {
      lang = "zh_TW"
    }
    lang = "en"
    console.log("lang=" + lang)
    Common.changeLang(lang);
  }

  initGame() {
    // game.frameRate = Constants.frameRate
    // game.frameRate = 45
    let serveOpt = NativeMgr.getServeOpt();
    if (serveOpt != "") {
      if (serveOpt == "dev") {
        SeverConfig.environment = SERVER_OPT.dev
      } else {
        SeverConfig.environment = SERVER_OPT.product
      }
    }
    if (SeverConfig.environment == SERVER_OPT.product) {
      SeverConfig.debugLogin = false
    } else {
      SeverConfig.debugLogin = true
    }
    State.init();
    this.setUpNetWork();
    this.startConnect();
    this.loadConfig("config/client_game_data");
  }

  async setUpNetWork() {
    if (this.netType == NetType.onChain) {
    } else {
      Model.init();
      if (this.onlineState == ONlineState.online) {
        PomeloMgr.getInstance();
      }
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
    let wsUrl = await SeverConfig.getServerAddr()
    console.log("wsUrl =" + wsUrl)
  }

  async connectPomelo() {
    console.log("connectPomelo")
    let wsUrl:any = await SeverConfig.getServerAddr()
    console.log("wsUrl =" ,wsUrl)
    if(SeverConfig.environment != SERVER_OPT.product){
      PomeloMgr.getInstance().connect(false, wsUrl.host, wsUrl.port);
    }else{
      PomeloMgr.getInstance().connect(true, wsUrl.host, wsUrl.port);
    }
    // PomeloNetwork.getInstance().addNet(NetEvent.NET_ONLOGIN,handler(self,self.onAuthEnd));
  }

  // @action
  onConnecting(params) {
    console.log("onConnecting")
    this.watchConecting()
  }

  onConnectFail(params) {
    console.log("onConnectFail")
    UIManager.hideWaiting()
    UIManager.showTip(1, "系统提示", "網路連接失敗，請檢查網路", this.startConnect.bind(this))
  }

  onConnectError(params) {
    console.log("onConnectError")
    console.log(params)
  }

  onLogout() {

  }

  protected watchConecting() {
    UIManager.showWaiting("连接中")
  }

  protected watchRepeatLogin() {
    UIManager.showToast(Ext.i18n.t("ErrCode_1013"))
    this.backToLogin()
  }

  private async backToLogin() {
    console.log("backToLogin============= sceneName=" + UIManager.curSceneName)
    UserModel.isInGame = false
    this.notitySceneState("backToLogin")
    await UIManager.closeAllView()
    Model.reset()
    Redux.State.resetState()
    if (SeverConfig.environment == SERVER_OPT.product) {
      //  UIManager.openView(Constants.Panels.UILogin)
    } else {
      //  UIManager.openView(Constants.Panels.UITestLogin)
    }
    this.startConnect();
  }

  // @action
  async onConnected(params) {
    console.log("onConnected")
    UIManager.hideWaiting()
    console.log("UserModel.isInGame="+UserModel.isInGame)
    //重连
    if(UserModel.isInGame){
      let token = localStorage.getItem("THeroToken")
      if(token){
        UserModel.silenceLogin()
      }
    }else{
      console.log("curScene="+UIManager.curScene)
      if (UIManager.curSceneName == SceneName.Login) {
        let token = localStorage.getItem("THeroToken")
        if(token){
          UserModel.silenceLogin()
        }
      }
    }
  }

  notitySceneState(type, data = null) {
    // EventCenter.emit("onSceneStateChange", { type, data })
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
    if(!UserModel.isInGame){
      UserModel.isInGame = true
      this.LoadScene(SceneName.Main, MainScene);
    }
  }

  //刷新场景
  refreshGame() {
    console.log("refreshGame")
    this.notitySceneState("refreshGame")
  }

  pauseGame() {
    Constants.gamePause = true
  }
  resumeGame() {
    Constants.gamePause = false
  }

  async LoadScene(sceneName, sceneScript: typeof SceneBase,) {
    console.log("onLoadScene sceneName=" + sceneName)
    await UIManager.openView(Constants.Panels.UILoadingScene, { type: 3, sceneName })
    this.bg.active = false;
    UIManager.LoadScene(sceneName, sceneScript, () => {
      EventCenter.emit(EventName.LoadScenePro, 1);
      console.log("LoadScene finish name=" + sceneName);
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

  loadConfig(url) {
    console.log("loadConfig url===============" + url)
    let self = this;
    resources.load(url, function (err, res: JsonAsset) {
      if (err) {
        console.log("logError")
        console.log(err)
        return;
      }
      console.log("loadConfig url 2===============", res)
      ConfigHelper.initConfig(res.json)
    })
  }

}
