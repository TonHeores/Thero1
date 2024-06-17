import { loader, sys } from "cc";

const TIME_OUT:number=5000;
class HttpUtils{
    static retryTime:number=0;
    static timeOutHandle:number=0;
    static httpGet(url:string, callback:Function):void{
        let xhr =  new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            // ;
            if(xhr.readyState === 4) {
                if (xhr.status === 200 && (xhr.status >= 200 && xhr.status < 300)) {
                    var respone = xhr.responseText;
                    if(callback){
                        callback(respone);
                        callback=null;
                        clearTimeout(HttpUtils.timeOutHandle);
                    }
                }
                else {
                    // callback(-1);
                    // callback=null;
                    //1秒后继续搞
                    if(xhr.status==0){
                        if(HttpUtils.retryTime<3){
                            setTimeout(function(){
                                HttpUtils.retryTime++;
                                clearTimeout(HttpUtils.timeOutHandle);
                                HttpUtils.httpGet(url,callback);
                            },1000);
                        }else{
                            HttpUtils.retryTime=0;
                            if(callback != null){
                                callback(-1);
                                callback=null;
                            }
                        }
                        
                    }
                }
            }
        };
        xhr.open("GET", url, true);
        if (sys.isNative) {
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
        }
        // xhr.setRequestHeader("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
        HttpUtils.timeOutHandle=setTimeout(function(){
            if(callback != null){
                callback(-1);
                callback=null;
            }
        },TIME_OUT);
        // note: In Internet Explorer, the timeout property may be set only after calling the open()
        // method and before calling the send() method.
        xhr.timeout = TIME_OUT;// 5 seconds for timeout

        xhr.send();
    }

    static httpPost(url:string, params:any, callback:Function) :void{
        let xhr =  new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            ;
            if (xhr.readyState === 4 ) {
                if (xhr.status === 200 && (xhr.status >= 200 && xhr.status < 300)) {
                    var respone = xhr.responseText;
                    if(callback){
                        callback(respone);
                    }
                }else{
                    if(callback){
                        callback(-1);
                    }
                }
            }
        };
        xhr.open("POST", url, true);
        if (sys.isNative) {
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
        }

        // note: In Internet Explorer, the timeout property may be set only after calling the open()
        // method and before calling the send() method.
        xhr.timeout = TIME_OUT;// 5 seconds for timeout

        xhr.send(params);
    }


    static urlParse():object{
            let  params:object = {};
            if(window.location == null){
                return params;
            }
            var name,value; 
            var str=window.location.href; //取得整个地址栏
            var num=str.indexOf("?") 
            str=str.substr(num+1); //取得所有参数   stringvar.substr(start [, length ]
        
            var arr=str.split("&"); //各个参数放到数组里
            for(var i=0;i < arr.length;i++){ 
                num=arr[i].indexOf("="); 
                if(num>0){ 
                    name=arr[i].substring(0,num);
                    value=arr[i].substr(num+1);
                    params[name]=value;
                } 
            }
            return params;
    }
}

let __HttpUtils__=HttpUtils

export {__HttpUtils__}