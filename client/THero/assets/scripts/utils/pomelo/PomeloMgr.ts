
// import { GEvent } from "./GEvent";
// import { GHandler } from "./GHandler";
import { NotifyRoute } from "./NotifyRoute"
import { EventCenter, PomeloNetClient, UIManager } from "../../UIFrame/indexFrame";
import { debug, js, log } from "cc";
import { RetCode } from "./GCode";
import { EventHandler } from "../EventHandler";
import { GameRoot } from "../../manager/GameRoot";
import { ConfigHelper } from "../ConfigHelper";
import { EventName } from "../../Constant";
enum SocketState {
    Closed,             // 已关闭
    Connecting,         // 连接中
    Connected,          // 已连接
}
//网络层的统一处理
export class PomeloMgr {

    pomeloNet: PomeloNetClient = null;

    private isConnected: boolean = false;

    private notifyRoutes: object = null;

    private _token: string;
    private _opStr: string;

    //断线重连
    private bReconnect: boolean = false;
    public static instance: PomeloMgr = null;
    private eventHandlers: { [key: string]: Array<EventHandler> } = js.createMap();

    private tryTime: number = 4;                      // 重连次数 默认断线后尝试重连次数
    private connectTimer = null;
    private isManClose = false
    private tryIndex:number = 0

    constructor() {
        // super();
        let self = this;
        if (this.pomeloNet == null) {
            this.pomeloNet = new PomeloNetClient();
        }

        this.pomeloNet.listen("reconnect", function (curTime) {
            console.log("reconnect ======")
            // EventCenter.emit(EventName.Connecting, null);
        });

        this.pomeloNet.listen("reconnectAllFail", function () {
            console.log("reconnectAllFail ====== self.tryIndex="+self.tryIndex)
            // if(self.tryIndex != 0){
            //     if(self.tryIndex >= self.tryTime){
            //         EventCenter.emit(EventName.ConnectFail, null);
            //     }else{
            //         this.connectTimer = setTimeout(() => {
            //             self.pomeloNet.reconnect()
            //             self.tryIndex++
            //         }, 5000);
            //     }
            // }else{
            //     EventCenter.emit(EventName.ConnectFail, null);
            // }
            EventCenter.emit(EventName.ConnectFail, null);
        });
    }

    public static getInstance() {
        if (this.instance == null) {
            this.instance = new PomeloMgr();
        }
        return this.instance;
    }

    public setToken(tk: string) {
        this._token = tk;
    }

    public getToken() {
        return this._token
    }

    /**
     * 
     * @param sHost 
     * @param nPort 
     * @param token 
     */
    connect(isWSS: boolean, sHost: string, port) {
        console.log("sHost=" + sHost + " port=" + port)
        let self: PomeloMgr = this;
        console.log("isConnected=" + this.isConnected + " this.pomeloNet.realyHost=" ,this.pomeloNet.realyHost)

        if (!this.isConnected) {
            EventCenter.emit(EventName.Connecting, null);
            this.pomeloNet.connect(isWSS, sHost, port,
                function (reObj: object) {
                    console.log("pomelo onConnenct===========================")
                    self.isConnected = true
                    if (!self.notifyRoutes) {
                        self.notifyRoutes = {};
                        for (const key in NotifyRoute) {
                            if (!self.notifyRoutes[key]) {
                                self.notifyRoutes[key] = true;
                                self.listen(key);
                            }
                        }
                    }
                    self.tryIndex = 0
                    clearTimeout(self.connectTimer)
                    self.connectTimer = null
                    EventCenter.emit(EventName.OnConnected, null);
                },
                //onDisConnect
                function (reason: string) {
                    self.onDisConnect(reason);
                })
        } else {
            if (self.isConnected) {
                EventCenter.emit(EventName.OnConnected, null);
            }
            self.isConnected = false
        }
    }

    //网络连接不成功
    private onDisConnect(reason: string): void {
        this.isConnected = false;
        this.pomeloNet.reconnect()
        // if(!this.isManClose){
        //     if(this.tryIndex == 0 ){
        //         this.pomeloNet.reconnect()
        //         this.tryIndex++
        //     }
        // }
    }

    send(route: string, dataMap: any = null, callBack: any = null) {
        if (this.isConnected && this.pomeloNet) {
            let self: PomeloMgr = this;
            if (callBack) {
                this.pomeloNet.request(route, dataMap, function (res: object) {
                    // self.dispatchEvent(route,res);
                    if (callBack && typeof (callBack) == "function") {
                        if (debug) {
                            log("request,route:", route, ",back:", res);
                        }
                        callBack(res);
                    }
                });
            } else {
                this.pomeloNet.notify(route, dataMap)
            }
        } else {
        }
    }

    private listenCache = {};
    private listen(route: string): void {
        let self: PomeloMgr = this;
        //这个可以修复多发消息的
        if (this.listenCache[route] == null) {
            // ;
            this.listenCache[route] = true;
            this.pomeloNet.listen(route, function (res: object) {
                self.dispatchEvent(route, res)
            });
        }
    }

    private dispatchEvent(route, res) {
        console.log("net-back:", route, res)
        let handerArr = this.eventHandlers[route];
        if (handerArr != undefined) {
            for (const e of handerArr) {
                if (e.target) {
                    e.callback.call(e.target, res);
                }
                else {
                    e.callback(res);
                }
            }
        } else {
            console.log("=======!!==== PacketId: %d have no handler", route);
        }
    }

    close(){
        this.isManClose = true
        this.clear()
    }

    clear() {
        this.pomeloNet.close()
        delete this.pomeloNet;
        this.pomeloNet = null;

        this.isConnected = false;
        this.bReconnect = false;
        this.notifyRoutes = null;
    }

    /**
     * ----------------------- 事件句柄 -----------------------------
     */
    public static onEventHandler(cmd: string, callback: Function, target?: Object, once = false) {
        if (!PomeloMgr.instance.eventHandlers[cmd]) {
            PomeloMgr.instance.eventHandlers[cmd] = [];
        }
        PomeloMgr.instance.eventHandlers[cmd].push(new EventHandler(callback, target, once));
    }
    /** 监听一次，收到该事件则取消监听 */
    public static onceEventHandler(cmd: string, callback: Function, target?: Object) {
        this.onEventHandler(cmd, callback, target, true);
    }
    public static offEventHandler(cmd: string, callback: Function, target?: Object) {
        let arr = PomeloMgr.instance.eventHandlers[cmd];
        if (!arr) {
            console.log(`cmd no find ${cmd}`);
            return;
        }
        for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i] && arr[i].callback === callback && arr[i].target === target) {
                arr.splice(i, 1);
                break;
            }
        }
        if (arr.length === 0) {
            this.clearEventHandler[cmd];
        }
    }
    public static clearEventHandler(cmd: string) {
        if (!PomeloMgr.instance.eventHandlers[cmd]) {
            return;
        }
        PomeloMgr.instance.eventHandlers[cmd] = null;
        delete PomeloMgr.instance.eventHandlers[cmd];
    }

    static checkResponse(rsp): boolean {
        if (rsp != null) {
            let code = rsp["code"];
            if (rsp < 0) code = rsp;

            if (code == 0) {
                return true;
            } else {
                code = Math.abs(code);
                let errCodeCfg = ConfigHelper.getErrCodeCfg(code);
                if (errCodeCfg) {
                    UIManager.showToast(errCodeCfg["Msg"]);
                    //超时关闭等待
                    if (code == 500) {

                    }
                }
            }
        }

        return false;
    }

}