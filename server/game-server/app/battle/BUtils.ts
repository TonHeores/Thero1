import * as fs from 'fs';
import { RndMgr } from './RndMgr';
import { AttrType } from './define/BDataComm';


//工具类
export class BUtils{
  

    public static fileReadObj(filepath:string):object{
        let str = BUtils.fileReadStr(filepath);
        if(str=="")return null;
        let obj = JSON.parse(str);
        return obj;
    }
    public static fileWriteObj(filepath:string,obj:object):void{
        if(obj==null)return;
        let str = JSON.stringify(obj);
        if(str=="")return;
        return BUtils.fileWriteStr(filepath,str);
    }

    
    public static fileReadStr(filepath:string):string{
        let str = fs.readFileSync(filepath, 'utf8');
        return str;
    }
    

    public static fileWriteStr(filepath:string,str:string){
        fs.writeFile(filepath,str,function(err){
            if(err){
                //
            }
        });
    }



    public static getNowTime():number{
        return Math.floor(Date.now()/1000);
    }
  

  
    //随机判断概率（N%）  rate是100的数值
    public static hitRate (rate:number,maxRate:number=100):boolean {
  
        if(rate>=100)return true;
  
        //return true; //test
        var n = Math.floor(RndMgr.rndNum(maxRate));
        if(n<=rate)return true;
        return false;
    }
  
  
    public static rndNum(n1:number,n2:number):number{
       return RndMgr.rndNum(n1,n2);
    }
  
    
    
    public static copyObj(dstObj:any,srcObj:any):void{
        
        if(srcObj==null || dstObj ==null)return;

        const keys = Object.keys(srcObj) as Array<keyof typeof srcObj>;
            keys.forEach((key) => {
                dstObj[key]=srcObj[key];
            });
            //dstObj = JSON.parse(JSON.stringify(srcObj));
    }
  


  
    //生成随机顺序
    public static genRndOrderList(n1:number=1,n2:number=0):Array<number>{
        class Item{
            idx:number=0;
            weight:number=0;
        }
        
        let nb=0;
        let ne=0;
        if(n2==0){
            nb=0;
            ne=n1-1;
        }else{
            nb = n1;
            ne = n2;
        }

        let arr1:Array<Item> = [];
        for(let i=nb;i<=ne;i++){
            let item:Item = new Item();
            item.idx = i;
            item.weight = RndMgr.rndNum(10000);
            arr1.push(item);
        }

        arr1.sort(function(a:Item,b:Item){
            if(a!=null && b!=null){
                return (a.weight - b.weight);
            }
            return 0;
        });

        let arr2:Array<number>=[];
        for(let i=0;i<arr1.length;i++){
            arr2.push(arr1[i].idx);
        }

        return arr2;
    }


    public static toInt(n:number){
        return Math.floor(n+0.5);
    }

    
    public static error(...args){
        console.log(args);
    }



    public static trace(...args){
        console.log(args);
    }

    public static battleLog(...args){
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




    public static heroInfoToAttrs(heroInfo:Object):number[]{
     
        let heroAttrs:number[]=[];
        
        heroAttrs[AttrType.Attack] = heroInfo["attack"];
        heroAttrs[AttrType.AttackS] = heroInfo["attackS"];
        heroAttrs[AttrType.Defense] = heroInfo["defense"];
        heroAttrs[AttrType.DefenseS] = heroInfo["defenseS"];
        heroAttrs[AttrType.Speed] = heroInfo["speed"];

        heroAttrs[AttrType.Threat] = heroInfo["threat"];
        heroAttrs[AttrType.HP] = heroInfo["HP"];
        heroAttrs[AttrType.LuckRate] = heroInfo["luckRate"];
        
        heroAttrs[AttrType.TrumpRate] = heroInfo["trumpRate"];
        heroAttrs[AttrType.DodgeRate] = heroInfo["dodgeRate"];
        heroAttrs[AttrType.ComboRate] = heroInfo["comboRate"];
        heroAttrs[AttrType.CounterRate] = heroInfo["counterRate"];
        heroAttrs[AttrType.BloodRate] = heroInfo["bloodRate"];
        heroAttrs[AttrType.StunRate] = heroInfo["stunRate"];

        heroAttrs[AttrType.RsTrumpRate] = heroInfo["rsTrumpRate"];
        heroAttrs[AttrType.RsDodgeRate] = heroInfo["rsDodgeRate"];
        heroAttrs[AttrType.RsComboRate] = heroInfo["rsComboRate"];
        heroAttrs[AttrType.RsCounterRate] = heroInfo["rsCounterRate"];
        heroAttrs[AttrType.RsBloodRate] = heroInfo["rsBloodRate"];
        heroAttrs[AttrType.RsStunRate] = heroInfo["rsStunRate"];

        heroAttrs[AttrType.TrumpDmgRate] = heroInfo["trumpDmgRate"];
        heroAttrs[AttrType.RsTrumpDmgRate] = heroInfo["rsTrumpDmgRate"];
        
        heroAttrs[AttrType.CureRate] = heroInfo["cureRate"];
        
        heroAttrs[AttrType.DmgExtRate] = heroInfo["dmgExtRate"];
        heroAttrs[AttrType.RsDmgExtRate] = heroInfo["rsDmgExtRate"];
        heroAttrs[AttrType.CurHP] = heroInfo["curHP"];

        //如果curHP没赋值就赋值
        if(heroAttrs[AttrType.CurHP]==null){
            heroAttrs[AttrType.CurHP] = heroAttrs[AttrType.HP];
        }

        return heroAttrs;
    }


}
