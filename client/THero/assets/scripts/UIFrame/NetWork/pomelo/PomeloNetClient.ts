import { debug, log } from "cc";
import pomelo from "./pomelo.js";

export default class PomeloNetClient 
{
    
    constructor(){
        
    }
    realyHost:string
    realyPort;
    connect(isWSS:boolean,sHost:string,port,onConnect:Function=null,onDisConnect:Function=null):void{
        // pomelo.disconnect();

        let self:PomeloNetClient=this;
        //直接连接connnector
        self.realyHost=sHost;
        self.realyPort=port;
        pomelo.init({
            host : self.realyHost,
            port : self.realyPort,
            reconnect : true,
            maxReconnectAttempts:5,
            isWSS:isWSS
        }, function (data1) {
            if(onConnect){
                onConnect(data1);
            }
            
            //网管连接成功之后的逻辑
            pomelo.on('disconnect', function(event) {
                if(onDisConnect){
                    onDisConnect(event.reason);
                }
            });

            //心跳超时
            pomelo.on('heartbeat timeout',function(){

            });

            pomelo.on("io-error",function(){
                // if(onDisConnect){
                //     onDisConnect();
                // }
            })
        });
    }

    reconnect(){
        pomelo.reconnect()
    }

    close(){
        pomelo.disconnect();
    }

    //发送请求，需要应答
    public request(route:string,dataMap:any,cb:Function){
        if(debug){
            log("request,route:",route,",dataMap:",JSON.stringify(dataMap));
        }
        
        pomelo.request(route,dataMap || {},cb);
    }
    //发送请求，不需要应答
    public notify(route:string,dataMap:any){
        if(debug){
            log("request,route:",route,",dataMap:",dataMap);
        }
        pomelo.notify(route,dataMap || {});
    }

    public listen(route:string,cb:Function){
        pomelo.on(route, cb);
    }
    

}