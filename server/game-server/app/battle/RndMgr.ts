export class RndMgr{
    public static ins: RndMgr = new RndMgr();
    public _rndSeedStr:string="";
    public _loopNo:number=0;


    public init(rndSeedStr:string){
        if(rndSeedStr!=""){
            for(let i=0;i<100;i++){
                this._rndSeedStr += rndSeedStr;
            }
        }
    }


    public random():number{

        if(this._rndSeedStr==""){
            return Math.random();
        }
        else{
            //先写死
            //后面找haoming要随机算法
            //return Math.random();

            //取4位hex，n<65536
            let m = this._rndSeedStr.length-4;
            if(m<=4)return 0; //错了

            let p = this._loopNo % m;
            this._loopNo++;

            let hexStr = this._rndSeedStr.substring(p,p+4);
            let n = parseInt(hexStr,16)%10000;
            let d = n/10000;

        //   console.log("RND:%f, LOOP:%d,",d,this._loopNo )
            return d;
        }
    }



    public static rndNum(n1:number=0,n2:number=0):number{
        let n = 0;
        
        let rnd = RndMgr.ins.random();

        if(n2>0){
            n = n1 + Math.floor(rnd* (n2 - n1)+0.5);
        }else if(n1>0){
            n = Math.floor( rnd * n1 +0.5);
        }else{
            n = rnd;
        }

        return n;
    }

}