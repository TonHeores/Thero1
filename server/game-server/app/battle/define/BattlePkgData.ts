import { ActionType, SpecActType } from "./BDataComm";


export class PkgBattleRetData{
    public winner:number=0; //1、2是troopIdx+1，0表示平局
    public rounds:Array<PkgRoundInfo>=[];
    public roundCount:number=0;
    //public troops:Array<TroopInfo>=[]; //这个不需要了，因为troops信息是客户端传进来的
}

export class PkgBattleMatchsData{
    public winner:number=0; //1、2是troopIdx+1，0表示平局
    public innings:Array<PkgBattleInfo>=[];
    //public troops:Array<TroopInfo>=[]; //这个不需要了，因为troops信息是客户端传进来的
}


//一局战斗
export class PkgBattleInfo{
    public winner:number=0; //1、2是troopIdx+1，0表示平局
    public rounds:Array<PkgRoundInfo>=[];
    public roundCount:number=0;
    //public troops:Array<TroopInfo>=[]; //这个不需要了，因为troops信息是客户端传进来的
}



//战斗轮
export class PkgRoundInfo{
    public roundNo:number = 0;
    public begin:PkgRoundBegin=new PkgRoundBegin();
    public actions:PkgActionInfo[]=[];
    public end:PkgRoundEnd=new PkgRoundEnd();
}



export class PkgRoundBegin{
}

export class PkgRoundEnd{
    public  delBufList:PkgDelBufInfo[];
}

export class PkgDelBufInfo{
    public unit:number=0;
    public delBufs:number[]=[];
}



export class PkgActionInfo{
    public actionType:ActionType=0;   //行动类型 attack、skill、buff
    public srcUnit:number=0; //源头

    public skillId:number=0; //技能id>0所释放的技能
    public effects:PkgEffectInfo[]=[];
}



// export class PkgSufferInfo{
//     public dstUnit:number=0;
//     public effects:PkgEffectInfo[]=[];
// }


export class PkgEffectInfo{
    public dstUnit:number=0;

    public type:number=0; 
    public val:number=0;
    public attr:number=0;
    public specActs:SpecActType[]=[];
    public bufIdx:number=0; //当buf被消除时，前端这个要被干掉

    public curHP:number=null;
}


// export class UnitNode{
//     public troopIdx:number=0;
//     public unitIdx:number=0;
// }





//===============================================================
//===============================================================

export class TroopInfo{
    playerUid:number=0;
    heroInfos:HeroInfo[]=[];
}

export class HeroInfo{
    public uid:number;
    public id:number;
    public lv:number;
    public attrs:number[];
    public skills:number[];
}


export class PkgBattleInitData{
    rndSeedStr:string = "";
    troopInfos:TroopInfo[] = new Array(2).fill(null).map(() => new TroopInfo());
}