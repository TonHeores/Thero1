import Constants, { SceneName } from "../../../Constant";
import { _decorator, EditBox, sys, Node, Label, native, UITransform, Vec2, Vec3, tween, } from "cc";
import { UIManager, FormType, UIBase, ButtonPlus, bindComp, EventCenter, AdapterMgr, AdaptaterType, ModalOpacity } from "../../../UIFrame/indexFrame";
import FightMgr, { ActionType, GameState } from "../../../module/fight/FightMgr";
import PetFightItem from "./Item/PetFightItem";
import CocosHelper from "../../../UIFrame/CocosHelper";
import { MaskType } from "../../../UIFrame/UIBase";
import Ext from "../../../utils/exts";
import SoundMgr from "../../../UIFrame/SoundMgr";
import { SOUND_RES } from "../../../config/basecfg";
import { Common } from "../../../utils/indexUtils";
const { ccclass } = _decorator;
@ccclass
export default class UIFight extends UIBase {
    formType = FormType.PopUp;
    static prefabPath = "fight/UIFight";
    maskType = new MaskType(ModalOpacity.OpacityHigh, false);
    @bindComp("ButtonPlus")
    public fightNode: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public btn_speed: ButtonPlus = null;
    @bindComp("cc.Node")
    public leftGrp: Node = null;
    @bindComp("cc.Node")
    public rightGrp: Node = null;
    @bindComp("cc.Node")
    public fightGrp: Node = null;
    @bindComp("cc.Node")
    public tip: Node = null;
    @bindComp("cc.Label")
    public roundNum: Label = null;
    @bindComp("cc.Label")
    public skipLb: Label = null;
    @bindComp("cc.Label")
    public speedlb: Label = null;
    stateTimer = null
    loadPetNum = 0
    haveLoadPetNum = 0
    isJump = false

    petDic = {}
    onLoad() {
        AdapterMgr.inst.adapatByType(AdaptaterType.FullScreen, this.node);
        this.listenEvent();
    }
    listenEvent() {
        this.fightNode.addClick(() => {
            if(!this.tip.active){
                return
            }
            // if(FightMgr.getInstance().gameIsPause()){
            //     FightMgr.getInstance().gameResume()
            //     this.skipLb.string = "暂停"
            // }else{
            //     FightMgr.getInstance().gamePause()
            //     this.skipLb.string = "启动"
            // }
            this.isJump = true
            FightMgr.getInstance().changeState(GameState.finishing)
        }, this);
        this.btn_speed.addClick(() => {
            if(FightMgr.isTestMode){
                FightMgr.getInstance().nextAction()
            }else{
                FightMgr.accGame()
                this.speedlb.string = "X" + FightMgr.fightAccList[FightMgr.fightAccIdx]
                for (let key in this.petDic) {
                    let item: PetFightItem = this.petDic[key]
                    item.updateAcc()
                }
            }
        }, this);
    }

    onBtnClose() {

    }

    async onShow() {
        this.isJump = false
        SoundMgr.inst.playMusic(SOUND_RES.Fight)
        // this.skipLb.string = "暂停"
        this.tip.active = false
        this.roundNum.string = Ext.i18n.t("UI_Adventure_03_001").replace("{0#}",0)
        this.speedlb.string = "X" + FightMgr.fightAccList[FightMgr.fightAccIdx]
        this.initView()
    }

    private getNodeArr(grp, len) {
        let nodeArr = []
        nodeArr = [grp.children[0]]
        // if(len == 1){
        //     nodeArr = [grp.children[1]]
        // }else if(len == 2){
        //     nodeArr = [grp.children[0],grp.children[2]]
        // }else if(len == 3){
        //     nodeArr = [grp.children[0],grp.children[2],grp.children[4]]
        // }else if(len == 4){
        //     nodeArr = [grp.children[0],grp.children[2],grp.children[3],grp.children[5]]
        // }else if(len == 5){
        //     nodeArr = [grp.children[0],grp.children[2],grp.children[3],grp.children[4],grp.children[5]]
        // }else if(len == 6){
        //     nodeArr = [grp.children[6],grp.children[1],grp.children[7],grp.children[3],grp.children[4],grp.children[5]]
        // }
        return nodeArr
    }

    async initView() {

        //先把双方置于屏幕之外
        let width = this.leftGrp.getComponent(UITransform).width;
        let FightGrpwidth = this.fightGrp.getComponent(UITransform).width;
        this.leftGrp.position = new Vec3(-(width / 2 + FightGrpwidth / 2), 0, 0)
        this.rightGrp.position = new Vec3(width / 2 + FightGrpwidth / 2, 0, 0)

        let troopData = FightMgr.getInstance().getTroopData();
        console.log("troopData=====",troopData)
        let leftTroop = troopData[0].heroInfos
        let rightTroop = troopData[1].heroInfos
        this.loadPetNum = leftTroop.length + rightTroop.length

        let skillArr = []
        for (let i = 0; i < leftTroop.length; i++) {
            let data = leftTroop[i];
            if (data.skills) {
                data.skills.forEach(element => {
                    let skillId = Math.floor(element / 100)
                    if (skillArr.indexOf(skillId) == -1) {
                        skillArr.push(skillId)
                    }
                });
            }
        }
        for (let i = 0; i < rightTroop.length; i++) {
            let data = rightTroop[i];
            if (data.skills) {
                data.skills.forEach(element => {
                    let skillId = Math.floor(element / 100)
                    if (skillArr.indexOf(skillId) == -1) {
                        skillArr.push(skillId)
                    }
                });

            }
        }

        console.log("leftTroop=======", leftTroop)
        console.log("rightTroop=======", rightTroop)

        let leftNodeArr = this.getNodeArr(this.leftGrp, leftTroop.length)
        for (let i = 0; i < leftTroop.length; i++) {
            let data = leftTroop[i];
            let pos = i
            let item: PetFightItem = await PetFightItem.creatItem(PetFightItem.itemTypeLeft)
            item.initData(data, this.onMomoDie.bind(this), this.loadFinishCb.bind(this))
            item.loadSkillAnis(skillArr)
            leftNodeArr[pos].addChild(item.node)
            this.petDic[pos + 1] = item

            // let headNode = this.leftInfoBox.children[i]
            // let img = headNode.getChildByName("icon")
            // Common.setNodeImgSprite(`pethead/${data.id}`, img);
            // let img2 = headNode.getChildByName("img")
            // let cfg = ConfigHelper.getCfg("PetCfg", data.id);
            // Common.setNodeImgSprite(`attribute/${cfg.petType}`, img2);
        }

        let rightNodeArr = this.getNodeArr(this.rightGrp, rightTroop.length)
        for (let i = 0; i < rightTroop.length; i++) {
            let data = rightTroop[i];
            let pos = i
            let item: PetFightItem = await PetFightItem.creatItem(PetFightItem.ItemTypeRight)
            item.initData(data, this.onMomoDie.bind(this), this.loadFinishCb.bind(this))
            item.loadSkillAnis(skillArr)
            rightNodeArr[pos].addChild(item.node)
            this.petDic[pos + 6] = item

            // let headNode = this.rightInfoBox.children[i]
            // let img = headNode.getChildByName("icon")
            // Common.setNodeImgSprite(`pethead/${data.id}`, img);
            // let img2 = headNode.getChildByName("img")
            // let cfg = ConfigHelper.getCfg("PetCfg", data.id);
            // Common.setNodeImgSprite(`attribute/${cfg.petType}`, img2);
        }
    }

    private onMomoDie(data) {

    }

    loadFinishCb() {
        this.haveLoadPetNum++
        if (this.loadPetNum == this.haveLoadPetNum) {
            FightMgr.getInstance().init(this)
        }
    }

    private setMomoToRun() {
        for (let key in this.petDic) {
            let item: PetFightItem = this.petDic[key]
            item.setRun()
        }
    }

    private setMomoToIdel() {
        for (let key in this.petDic) {
            let item: PetFightItem = this.petDic[key]
            item.setIdell(true)
        }
    }

    private setMomoToFightNode() {
        for (let key in this.petDic) {
            let item: PetFightItem = this.petDic[key]
            let wPos = item.node.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(0, 0, 0))
            item.node.parent = this.fightGrp
            let newPos = this.fightGrp.getComponent(UITransform).convertToNodeSpaceAR(wPos)
            item.node.position = new Vec3(newPos.x, newPos.y, 0)
            item.initOripos()
        }
    }

    //进入游戏逻辑
    public async enterFight() {
        this.setMomoToRun()
        let leftT = tween().to(1 / FightMgr.getAccTime(), { position: new Vec3(-185, 0, 0) }, { easing: 'quadOut' })
        let rightT = tween().to(1 / FightMgr.getAccTime(), { position: new Vec3(185, 0, 0) }, { easing: 'quadOut' }).call(() => {
            this.setMomoToFightNode()
            this.setMomoToIdel()
            FightMgr.getInstance().changeState(GameState.roundStarting)
        })
        CocosHelper.runTweenSync(this.leftGrp, leftT);
        CocosHelper.runTweenSync(this.rightGrp, rightT);
    }

    //开始新回合
    public startRound(curRoundNum) {
        // console.log("startRound curRoundNum=" + curRoundNum)
        //改变回合数
        // if(curRoundNum == 0){
        //     curRoundNum = 1
        // }
        Object.values(this.petDic).forEach(element => {
            let item = element as PetFightItem
            item.startRun()
        });
        
        this.roundNum.string = Ext.i18n.t("UI_Adventure_03_001").replace("{0#}",curRoundNum)
        if(curRoundNum >= 3){
            this.tip.active = true
        }
        this.stateTimer = setTimeout(() => {
            FightMgr.getInstance().changeState(GameState.startAction)
        }, Math.ceil(500 / FightMgr.getAccTime()));
    }

    //开始一次新的action
    public startAction() {
        // console.log("startAction")
        //上方的顺序条移动 判断当前action是否是主动攻击

        this.stateTimer = setTimeout(() => {
            FightMgr.getInstance().changeState(GameState.attacking)
        }, Math.ceil(200 / FightMgr.getAccTime()));
    }

    private isAttacking = false
    private isDefending = false
    public startAtk(atkData) {
        console.log("startAtk")
        console.log(JSON.stringify(atkData))
        let isOver = this.checkActionIsOver()
        // atkData = JSON.parse('{"actionType":2,"srcUnit":11,"skillId":41001,"suffers":[{"dstUnit":"22","effects":[{"type":1,"val":161.5,"attr":0,"specAct":0,"bufIdx":0,"curHP":560}]},{"dstUnit":"23","effects":[{"type":1,"val":549.1,"attr":0,"specAct":0,"bufIdx":0,"curHP":280},{"type":4,"val":-22,"attr":2,"specAct":0,"bufIdx":6,"curHP":280}]},{"dstUnit":"24","effects":[{"type":1,"val":248.2,"attr":0,"specAct":0,"bufIdx":0,"curHP":364},{"type":4,"val":-22,"attr":2,"specAct":0,"bufIdx":6,"curHP":364}]},{"dstUnit":"25","effects":[{"type":1,"val":358.7,"attr":0,"specAct":0,"bufIdx":0,"curHP":92},{"type":4,"val":-22,"attr":2,"specAct":0,"bufIdx":5,"curHP":92}]}]}')
        //主要处理攻击特效
        this.isAttacking = true
        let pos = FightMgr.getPosByData(atkData.srcUnit)
        let item: PetFightItem = this.petDic[pos]
        item.attack(atkData, this.petDic, isOver, () => {
            this.isAttacking = false
            // console.log("ack over===========")
            FightMgr.getInstance().changeState(GameState.actionEnd)
        })
    }

    private checkActionIsOver(){
        //判断下一个行为是否是连击或者反击 如果是，则攻击后不返回
        let nextData = FightMgr.getInstance().getNextActionData()
        let isOver = false
        if(nextData != null){
            if (nextData.actionType == ActionType.Attack || nextData.actionType == ActionType.Skill) {
                isOver = true
            }
        }
        return isOver;
    }

    public endAction() {
        // console.log("endAction======")
    }

    //战斗结束
    async gameFinish() {
        // console.log("gameFinish======")
        if(!this.isJump){
            await Common.sleep(Math.ceil(1500))
        }
        // //弹出结算面板
        UIManager.openView(Constants.Panels.UIFightResult)
    }

    onHide() {
        console.log('onHide');
    }
    onDestroy() {
        console.log('destory');
        SoundMgr.inst.playMusic(SOUND_RES.MAIN)
        // 这里可以执行你的销毁操作, 在该窗体执行destory时, 会先调用onDestory方法
    }
    async onClickLogin() {
        this.closeUIForm();
    }
}