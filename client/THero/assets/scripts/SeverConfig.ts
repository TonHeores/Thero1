
import { sys, log } from "cc";
import { EventCenter } from "./UIFrame/EventCenter";
import HTTPNet from "./utils/httpNet";

export enum SERVER_OPT {
  //0 开发服 1 测试服  2 线上服
  dev = 0,
  test = 1,
  product = 2,
}

class SeverConfig {

  // 开发环境
  public static environment = SERVER_OPT.dev;
  public static debugLogin = false;

  //开发服
  public static deployment = {
    ws: "192.168.150.3",
    port:"3050",
    // ws: "13.232.192.87",
    // port:"3050",
    // web: "http://192.168.5.211:9090", //某些http请求的API前缀地址
    // serverListUrl: "http://servlist.mobox.io.s3-website-ap-southeast-1.amazonaws.com/servlist.json",
    versionUrl: "http://192.168.5.222/version.txt",
  };

  //内部测试服
  public static beta = {
    ws: "13.232.192.87",
    port:"3050",
    // web: "http://134.175.63.224:9090",
    // serverListUrl: "http://servlist.mobox.io.s3-website-ap-southeast-1.amazonaws.com/servlist.json",
    versionUrl: "http://192.168.5.222/version.txt",
  };

  // 发布环境
  public static release = {
    ws: (sys.isNative || globalThis.isMoboxApp) ? "ws://momoverse-gate-ws.soulchainz.io" : "wss://momoverse-gate.mobox.io",
    port:"3951",
    web: "https://accountapi.mobox.io",
    // serverListUrl: "https://www.mobox.io/settings/servlist.json",
    versionUrl: "https://webapp.momoland.io/BlockWarUpdate/version.txt",
  }

  public static async getServerAddr() {
    return new Promise(async resolve => {
      if (SeverConfig.environment == 0) {
        let url = {host:SeverConfig.deployment.ws,port:SeverConfig.deployment.port}
        resolve(url)
      } else if (SeverConfig.environment == 1) {
        let url = {host:SeverConfig.beta.ws,port:SeverConfig.beta.port}
        resolve(url)
      } else {
        let url = {host:SeverConfig.release.ws,port:SeverConfig.release.port}
        resolve(url)
        // if (sys.isNative) {
        //   let url = {host:SeverConfig.release.ws,port:SeverConfig.release.port}
        //   resolve(url)
        // } else {
        //   // log("wsurl="+Setting.release.ws)
        //   // resolve(SeverConfig.release.ws)
        //   if (globalThis.isMoboxApp) {
        //     // resolve(SeverConfig.release.ws)
        //   } else {
        //     // let serverList = await this.getServerList() as any;
        //     // console.log("serverList=================")
        //     // console.log(serverList)
        //     // let arr = sys.isNative ? serverList.wsList : serverList.wsList;
        //     // let httpPre = sys.isNative ? "http://" : "https://";
        //     // let hasGoConnect = false;
        //     // arr.map(item => {
        //     //   let url = httpPre + item.split("//")[1] + "/get_server_delay/ping.json";
        //     //   console.log("url=" + url)
        //     //   HTTPNet.get(url, async ret => {
        //     //     if (hasGoConnect) return;
        //     //     hasGoConnect = true;
        //     //     console.log("fastUrl", item);
        //     //     resolve(item);
        //     //   })
        //     // })
        //   }
        // }
      }
    })
  }

  public static getServerConf() {
    if (SeverConfig.environment == 0) return SeverConfig.deployment
    else if (SeverConfig.environment == 1) return SeverConfig.beta
    return SeverConfig.release
  }

  public static getServerList() {
    let self = this
    return new Promise(resolve => {

      let ret = {
        wsList: [
          "wss://momoverse-gate.mobox.io",
          "wss://momoverse-gate-sg.mobox.io",
          "wss://momoverse-gate-sg1.mobox.io",
          "wss://momoverse-gate-hk.mobox.io",
          "wss://momoverse-gate-na.mobox.io"
        ]
      }
      resolve(ret)
    })
  }
}

if (SeverConfig.environment == 2) {
  // console.log = ()=>{}
}

export default SeverConfig;