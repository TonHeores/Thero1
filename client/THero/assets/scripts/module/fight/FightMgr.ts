export class TroopMemberInfo{
    uid :number = 0 //
    id :number = 0 // 怪物类型ID 为0则代表自己
    HP:number
}

export class FightTroopInfo{
    teamId:number=0; //左为1 右为2
    heroInfos:TroopMemberInfo[]=[]; //队伍信息  {}
}

export default class FightMgr{
    static isTestMode = false
    // private bTree:BehaviorTree = null;
    private static instance: FightMgr = null;// 单例
    private roundArr = [];
    private roundNum = 0;
    private rewardInfos = null;
    private winner = 0
    private gameState:GameState = GameState.idle;
    private curRoundNum = 0 //当前回合数
    private  board = null;
    private curActionIdx = 0;
    private troopData = null
    private curStage = 1

    public setCurStage(stage){
        this.curStage = stage
    }

    public getCurStage(){
        return this.curStage
    }

    public resetData(troopData,fightData,rewardInfos){
        console.log("troops=========",troopData)
        // console.log("fightMgr resetData",fightData,troopData)
        // let data = JSON.parse(fightData);
        let data = fightData
        this.roundArr = data.rounds
        this.roundNum = this.roundArr.length
        this.winner = data.winner
        this.troopData = troopData
        this.rewardInfos = rewardInfos
    }

    public getRewardInfo(){
        return this.rewardInfos
    }

    public getWinner(){
        return this.winner
    }

    public getTroopData(){
        return this.troopData
    }

    public getCurState():GameState{
        return this.gameState
    }

    public getCurRoundData(){
        // cc.log("getCurRoundData curRoundNum="+this.curRoundNum)
        if(this.curRoundNum<this.roundArr.length){
            return this.roundArr[this.curRoundNum]
        }else{
            return null;
        }
    }

    public getCurActionData(){
        let curRoundData = this.getCurRoundData()
        if(this.curActionIdx < curRoundData.actions.length){//所有行动已经展示完毕
            // return curRoundData.actions[this.curActionIdx]
            return this.handleAtkData(curRoundData.actions[this.curActionIdx])
        }
        return null;
    }

	public handleAtkData(atkData){
        if(atkData.suffers!=null){
            return atkData
        }
		let { effects } = atkData;
		let sufferDic = {}
		let suffers = []
		effects.forEach(effect => {
			let dstUnit = effect.dstUnit
			if(sufferDic[dstUnit] == null){
				sufferDic[dstUnit] = []
			}
            delete effect.dstUnit
			sufferDic[dstUnit].push(effect)
		});
		Object.keys(sufferDic).forEach(key => {
			suffers.push( {...{dstUnit:key},...{effects:sufferDic[key]}})
		});
		
		atkData.suffers = suffers
		delete atkData.effects 
        return atkData
	}

    public getNextActionData(){
        let curRoundData = this.getCurRoundData()
        if(curRoundData == null){
            return null
        }
        if(this.curActionIdx+1 < curRoundData.actions.length){//所有行动已经展示完毕
            return curRoundData.actions[this.curActionIdx+1]
        }else{
            if(this.curRoundNum+1 < this.roundArr.length){
                curRoundData = this.roundArr[this.curRoundNum+1]
                return curRoundData.actions[0]
            }
        }
        return null;
    }

    public getCurActionIdx(){
        return this.curActionIdx
    }

    public getActionDataByIdx(idx){
        let curRoundData = this.getCurRoundData()
        if(curRoundData == null){
            return null
        }
        if(idx < curRoundData.actions.length){//所有行动已经展示完毕
            return curRoundData.actions[idx]
        }else{
            if(this.curRoundNum+1 < this.roundArr.length){
                curRoundData = this.roundArr[this.curRoundNum+1]
                return curRoundData.actions[0]
            }
        }
        return null;
    }

    public getActionData(actIdx){
        let curRoundData = this.getCurRoundData()
        if(actIdx < curRoundData.actions.length){//所有行动已经展示完毕
            return curRoundData.actions[actIdx]
        }  
        return null;
    }

    public static getInstance(): FightMgr {
        if(this.instance == null) {
            this.instance = new FightMgr()
        }
        return this.instance
    }

    public init(board){
        this.board = board
        this.gameState = 0
        this.changeState(GameState.opening)
    }

    //改变游戏状态
    public changeState(state:GameState){
        if(this.board==null){
            return
        }
        if(this.isPause){
            this.watingState = state
            return 
        }
        if(FightMgr.isTestMode){
            //测试
            if(this.gameState == GameState.startAction){
                this.isPause = true
            } 
        }
        if(this.gameState!= GameState.finishing){
            this.gameState = state;
        }
         if(this.gameState == GameState.opening){//开场动画
            this.curRoundNum = 0;
            this.board.enterFight()
        }else if(this.gameState == GameState.roundStarting){ //回合开始
            if(this.curRoundNum == 0 && this.getCurActionData() == null){
                this.curRoundNum = 1
            }
            this.board.startRound(this.curRoundNum)
            this.curActionIdx = 0;
        }else if(this.gameState == GameState.startAction){ //攻击阶段
            this.board.startAction()
        }else if(this.gameState == GameState.attacking){ //攻击阶段
            this.board.startAtk(this.getCurActionData())
        }else if(this.gameState == GameState.defending){ //防御阶段
            // this.board.startDef(this.getCurActionData())
        }else if(this.gameState == GameState.actionEnd){ //一次行动结束
            this.board.endAction()
            this.curActionIdx ++ ;
            let curRoundData = this.getCurRoundData()
            if(this.curActionIdx >= curRoundData.actions.length){//所有行动已经展示完毕
                this.changeState(GameState.roundEnding)
            }else{
                this.changeState(GameState.startAction)
            }
        }else if(this.gameState == GameState.roundEnding){ //回合结束阶段
            this.curRoundNum ++;
            if(this.curRoundNum >= this.roundArr.length){//所有回合数据展示完毕
                this.changeState(GameState.finishing)
            }else{
                this.changeState(GameState.roundStarting)
            }
        }else if(this.gameState == GameState.finishing){ //战斗结束
            this.board.gameFinish(this.curRoundNum)
            this.board = null;
        }
    }

    public nextAction(){
        this.gameResume()
    }

    private isPause = false
    private watingState:GameState = null
    public gamePause(){
        this.isPause = true
    }

    public gameResume(){
        this.isPause = false
        if(this.watingState != null){
            this.changeState(this.watingState)
            this.watingState = null
        }
    }
    public gameIsPause(){
        return this.isPause
    }

    public getAllActionIcon(){
        let arr = []
        let arr1 = []
        this.roundArr.forEach(rundata => {
            rundata.actions.forEach(element => {
                arr.push({pos:element.pos,skillId:element.skillId,skillLv:element.skillLv})
                arr1.push(element)
            });
        });
        // cc.log(JSON.stringify(arr1))
        return arr
    }

    // private checkIsFighting(){
    //     cc.log("fasfffsafasf")
    //     return this.gameState != GameState.finishing;
    // }

    static getPosByData(unitIdx){
        let pos = unitIdx %10;
        let troopIdx = Math.floor(unitIdx / 10) 
        if(troopIdx == 2){
            pos += 5
        }
        return pos
    }

    private static accTime = 1
	static getAccTime() {
		return this.accTime
	}

    public static fightAccList = [1,2] //加速倍速列表
    public static fightAccIdx = 0  //加速倍速Idx
    static accGame() {
        
        if(this.fightAccIdx<this.fightAccList.length-1){
            this.fightAccIdx++
        }else{
            this.fightAccIdx = 0
        }
        this.accTime = this.fightAccList[this.fightAccIdx]
	}
}

export enum GameState {
    idle,//闲置阶段 没有战斗
    opening, //游戏开始动画阶段
    roundStarting,//回合开始阶段
    startAction,//一次行动开始
    attacking,//一次行动进攻方阶段
    defending,//一次行动防守方阶段
    actionEnd,//一次行动结束阶段
    roundEnding,//回合结束阶段
    finishing,//战斗结束阶段
}

//技能释放阶段
export enum SkillType{
    ActiveSkill=1, //主动技能（每回合轮到自己出手时，普攻前）
    PassiveSkill=2, //被动技能（在战斗中根据触发条件起作用
    AttrSkill=3 //属性技能（英雄身上发动，进战斗前就已经执行完）
}

export enum SkillActType { //施放类型
    LeaderSkill=1,//指挥型
    ActionSkill, //行动型
    ChaseSkill,//追击型
    RectifySkill, //修整型
}

export enum SpecActType{ //特殊行为类型
    Normal=0,   //普通
    Trump=1,    //暴击
    Dodge=2,    //闪避
    Stun=3,     //击晕
    NoHurt=4,   //无敌
    Blood=6,    //吸血
    Cure =7,    //治疗
}

//Action 行动类型
export enum ActionType{
    None=0,
    Attack=1,       //发动普攻
    Skill=2,        //使用技能
    Buff=3,         //技能Buf生效
    Combo=4,        //连击
    Counter=5,      //反击
    Cure=7,         //治疗
}



export enum DamageType{ //伤害类型
    Normal=0,   //普通
    Trump=1,    //暴击
    Dodge=2,    //闪避
    NoHurt=3,   //免伤
}

export enum BufTriggleType{
    DoingNow=0, //马上生效!!
    //None = 0,     
    OnBattleBegin=1,//战斗开始
    OnRoundBegin=2, //每回合开始前
    OnRoundEnd=3,//回合结束后
    OnActionBegin=4,//行动开始
    OnActionEnd=5,//行动结束
    OnAttackBegin=6,
    OnAttackEnd=7,
    OnSkillBegin=8,
    OnSkillEnd=9,
    OnTrump=10,//暴击时
    OnEnemyTrump=11,
    OnDodge=12,//闪避时
    OnEnemyDodge=13,
    OnCure=14,
    BeDamage=15,//收到伤害时
    OnBufExe=16,
    BeAttackBegin=17,//受普通攻击开始
    BeAttackEnd=18,//受普通攻击结束
    BeSkillBegin=19,//受技能攻击开始
    BeSkillEnd=20,//受技能攻击结束


    EnumLength=21
    //!!!
}


export enum BufEffectType{
    Damage = 1, //伤害率
    Cure = 2, //治疗
    CleanBuf =3, //清除buff
    AddAttr = 4, //属性增益
    AddStatus = 5, // 属性状态赋值
    LaunchTo = 6,  //跳转调用Buf
    ExeAttr = 7, //实际执行buff属性
    ExeStatus = 8, //实际执行buff属性
}

//Buf状态
export enum StatusType{
    NoAction=1,
    NoAttack=2,
    NoSkill=3,
    OnCrazy=4,//疯狂状态(攻击队友)
    NoCure=5,//无法治疗

    DblAttack =6, //连击状态

    NotBeControl=7,
    NotBeAttack=8,
    NotBeSkill=9,
    NotBeHurt=10
}