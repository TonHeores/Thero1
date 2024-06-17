import { _decorator, color, Component, instantiate, Label, Widget, Node, RichText, Tween, tween, screen, Vec3, Animation, TweenSystem } from 'cc';
import { bindComp, ButtonPlus, FormType, UIBase, UIManager } from '../../../UIFrame/indexFrame';
import State from '../../../redux/state';
import Redux from '../../../redux';
import Ext from '../../../utils/exts';
import { ConfigHelper } from '../../../utils/ConfigHelper';
import MainTaskModel from '../../../model/MainTaskModel';
import { ItemInfo, PlayerInfo } from '../../../utils/pomelo/DataDefine';
import Constants from '../../../Constant';
const { ccclass, property } = _decorator;

@ccclass('UIMainTask')
export class UIMainTask extends UIBase {
    formType = FormType.FixedUI;
    static canRecall = true;
    static prefabPath = "main/UIMainTask";

    @bindComp("cc.Node")
    public taskDesc: Node = null;
    @bindComp("cc.Node")
    public taskProgram: Node = null;
    @bindComp("cc.Node")
    public rewardNum: Node = null;   
    @bindComp("cc.Node")
    public effect: Node = null;   
    @bindComp("cc.Node")
    public taskNode: Node = null;   
    @bindComp("cc.Node")
    public desc: Node = null;   
    @bindComp("cc.Node")
    public box: Node = null;   
    @bindComp("cc.Node")
    public boxpanel: Node = null;   
    @bindComp("ButtonPlus")
    public awardBtn: ButtonPlus = null;
    private timer = -1;
    private boxNumber = 0;

    onInit() {
        this.awardBtn.addClick(this.getMainTaskReward, this)
        
    }

    refreshTask(){
        Redux.Watch(this, Redux.ReduxName.user, "accInfo", (accInfo: PlayerInfo) => {
            if(accInfo.task.mainTaskFinishedFlag)
            {
                this.effect.active = true;
                this.showAwardEffect();
            }
            else
            {
                this.effect.active = false;
                Tween.stopAllByTarget(this.effect);
            }
            this.refreshTaskLabel();
        });
    }

    showAwardEffect(){
        let actionNum = TweenSystem.instance.ActionManager.getNumberOfRunningActionsInTarget(this.effect);
        if(actionNum != 0 ) return;
        tween(this.effect).to(3, {angle: 360},{onUpdate:()=>{
            if(this.effect.angle>=360)
                this.effect.angle = 0;
        }}).repeatForever().start();
    }

    getMainTaskReward(){
        let accInfo = State.getState(Redux.ReduxName.user, "accInfo");

        // let arr = [{type:1,count:10},{type:3,count:5},{type:9,count:5}];
        // UIManager.openView(Constants.Panels.UIRewardPanel,{rewardInfos:arr});
        if(accInfo.task.mainTaskFinishedFlag)
        {
            MainTaskModel.taskReward();
            this.showBoxAni();
            // tween(this.taskNode)
            // .to(0.5,{position: new Vec3(this.taskNode.position.x - this.widthSize, this.taskNode.position.y)})
            // .to(0.5,{position: new Vec3(this.taskNode.position.x, this.taskNode.position.y)}).union().start();
        }
    }

    refreshTaskLabel(){
        let accInfo = State.getState(Redux.ReduxName.user, "accInfo");
        let playerTaskInfo = accInfo.task;
        console.log("task==========", playerTaskInfo);

        let taskInfo = ConfigHelper.getCfg("MainTaskCfg", playerTaskInfo.mainTaskId);
        //如果没有读到任务
        if(!taskInfo) 
        {
            this.taskNode.active = false;
            return;
        }
        else
        {
            this.taskNode.active = true;
        }
        if(taskInfo.taskType == 3)
        {
            let strColor = playerTaskInfo.mainTaskFinishedFlag ? "#33dc2a": "#FF392A";
            let count = playerTaskInfo.mainTaskStatCount > taskInfo.pars[0] ? taskInfo.pars[0] : playerTaskInfo.mainTaskStatCount;
            let match = ConfigHelper.getCfg("MatchInfoCfg",taskInfo.pars[0])
            this.desc.getComponent(RichText).string = `<color=${strColor}>`+"(" + count + "/" + taskInfo.pars[0] + ") "+`</color>`
             + `<color=#FFE1BF>`+Ext.i18n.t(taskInfo.taskDesc).replace("{0#}", match.chapter +"-"+ match.section)+ `</color>`;
        }
        else if(taskInfo.taskType == 5)
        {
            let strColor = playerTaskInfo.mainTaskFinishedFlag ? "#33dc2a": "#FF392A";
            let count = playerTaskInfo.mainTaskStatCount > taskInfo.pars[0] ? taskInfo.pars[0] : playerTaskInfo.mainTaskStatCount;

            let num = taskInfo.pars[1];
            let itemstr = Ext.i18n.t("UI_Item_01_0" + (num < 10 ? "0" + num: num))
            let str = Ext.i18n.t(taskInfo.taskDesc).replace("{0#}", taskInfo.pars[0]);
            let str1 = str.replace("{1#}", itemstr)
            this.desc.getComponent(RichText).string = `<color=${strColor}>`+"(" + count + "/" + taskInfo.pars[0] + ") "+`</color>`
            + `<color=#FFE1BF>`+ str1 + `</color>`;
        }
        else if(taskInfo.taskType == 6)
        {
            let strColor = playerTaskInfo.mainTaskFinishedFlag ? "#33dc2a": "#FF392A";
            let count = playerTaskInfo.mainTaskStatCount > taskInfo.pars[0] ? taskInfo.pars[0] : playerTaskInfo.mainTaskStatCount;
            let num = taskInfo.pars[1] + 3;
            let qualitystr = Ext.i18n.t("UI_TreasueBox_02_0" + (num < 10 ? "0" + num: num))
            let str = Ext.i18n.t(taskInfo.taskDesc).replace("{0#}", taskInfo.pars[0]);
            let str1 = str.replace("{1#}", qualitystr)
            this.desc.getComponent(RichText).string = `<color=${strColor}>`+"(" + count + "/" + taskInfo.pars[0] + ") "+`</color>`
            + `<color=#FFE1BF>`+str1+ `</color>`;
        }
        else
        {
            let strColor = playerTaskInfo.mainTaskFinishedFlag ? "#33dc2a": "#FF392A";
            let count = playerTaskInfo.mainTaskStatCount > taskInfo.pars[0] ? taskInfo.pars[0] : playerTaskInfo.mainTaskStatCount;
            this.desc.getComponent(RichText).string = `<color=${strColor}>`+"(" + count + "/" + taskInfo.pars[0] + ") "+`</color>`
             + `<color=#FFE1BF>`+Ext.i18n.t(taskInfo.taskDesc).replace("{0#}", taskInfo.pars[0])+ `</color>`;
        }

        let num:number;
        for(let key in taskInfo.rewardInfos)
        {
            if(taskInfo.rewardInfos[key].type == 3)
            {
                num = taskInfo.rewardInfos[key].count;
                break;
            }
        };
        this.rewardNum.getComponent(Label).string = num + "";
    }

    showBoxAni(){
        this.timer = setInterval(()=>{
           let node = instantiate(this.box);
           node.position = new Vec3(node.position.x + (Math.random()*200),node.position.y+ (Math.random()*50),node.position.z);

           const animation = node.children[0].getComponent(Animation);
           animation.on(Animation.EventType.FINISHED, (type,state)=>{
               this.onTriggered(type,state,node)
           }, this)
           node.active = true;
           this.boxpanel.addChild(node);
           this.boxNumber++
           
           if(this.boxNumber > 5)
           {
               clearInterval(this.timer);
               this.timer = -1;
               this.boxNumber = 0;
           }
       },20)
   }

   
    public onTriggered(type: Animation.EventType, state, node) {
        this.boxpanel.removeChild(node);
    }
    
    async onShow() 
    {
        this.refreshTask();
        this.initView()
    }

    async initView() {
        let frameSize = screen.windowSize;
        let ratio = frameSize.height/frameSize.width
        if(ratio<1.49){
            let widget:Widget = this.taskNode.getComponent(Widget)
            widget.top = 700
        }else if(ratio<1.6){
            let widget:Widget = this.taskNode.getComponent(Widget)
            widget.top = 760
        }else if(ratio<2){
            let widget:Widget = this.taskNode.getComponent(Widget)
            widget.top = 820
        }else{
            let widget:Widget = this.taskNode.getComponent(Widget)
            widget.top = 890
        }
    }

    start() {

    }
}


