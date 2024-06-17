//工具类
export class BUtils {
    static getNowTime() {
        return Math.floor(Date.now() / 1000);
    }
    //随机判断概率（N%）  rate是100的数值
    static hitRate(rate, maxRate = 100) {
        if (rate >= 100)
            return true;
        //return true; //test
        var n = Math.floor(Math.random() * maxRate);
        if (n <= rate)
            return true;
        return false;
    }
    static copyObj(dstObj, srcObj) {
        const keys = Object.keys(srcObj);
        keys.forEach((key) => {
            dstObj[key] = srcObj[key];
        });
        //dstObj = JSON.parse(JSON.stringify(srcObj));
    }
    //生成随机顺序
    static genRndOrderList(idxMax, idxMin = 1) {
        class Item {
            constructor() {
                this.idx = 0;
                this.weight = 0;
            }
        }
        let arr1 = [];
        for (let i = idxMax; i <= idxMin; i++) {
            let item = new Item();
            item.idx = i;
            item.weight = Math.random() * 10000;
            arr1.push(item);
        }
        arr1.sort(function (a, b) {
            if (a != null && b != null) {
                return (a.weight - b.weight);
            }
            return 0;
        });
        let arr2 = [];
        for (let i = 0; i < arr1.length; i++) {
            arr2.push(arr1[i].idx);
        }
        return arr2;
    }
    static trace(...args) {
        console.log(args);
    }
    static battleLog(...args) {
        // if(_isDebugTrace==false)return;
        // var len = arguments.length;
        // if(len <= 0) {
        //     return;
        // }
        // //第一个参数默认是UID
        // var uid=arguments[0];
        // var stack = getStack();
        // var traceArr=["u[",uid,"]" ,getFileName(stack), '@' , getLineNumber(stack) , ':']
        // for(var i = 1; i < len; ++i) {
        //     if(typeof(arguments[i])=="object"){
        //         traceArr.push(JSON.stringify(arguments[i]), ' ')
        //     }else{
        //         traceArr.push(arguments[i] , ' ')
        //     }
        // }
        // warLogger.info(traceArr.join(""));
    }
    //判断有没有概率
    static checkTouchRate(args) {
        //test
        return true;
        //
        // if(args["rate"]!=null){
        //     let r = args["rate"]/100;
        //     let v = Math.random();
        //     if(v<r){
        //         //命中概率
        //         return true;
        //     }else{
        //         //没命中
        //         return false;
        //     }
        // }else{
        //     //没配概率就是 100%
        //     return true;
        // }
    }
}
