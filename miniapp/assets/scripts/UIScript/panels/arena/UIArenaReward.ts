import { _decorator, Component, instantiate, Label, Node, RichText, Size, UITransform, Vec3, Widget } from 'cc';
import { bindComp, ButtonPlus, FormType, ModalOpacity, UIBase, UIListView, UIManager } from '../../../UIFrame/indexFrame';
import { MaskType } from '../../../UIFrame/UIBase';
import { ConfigHelper } from '../../../utils/ConfigHelper';
import Constants from '../../../Constant';
import Ext from '../../../utils/exts';
import State from '../../../redux/state';
import Redux from '../../../redux';
import { Common } from '../../../utils/indexUtils';
const { ccclass, property } = _decorator;

@ccclass('UIArenaReward')
export class UIArenaReward extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, true);
    static canRecall = true;
    static prefabPath = "arena/UIArenaReward";

    @bindComp("UIListView")
    public rewardList: UIListView = null;
    @bindComp("ButtonPlus")
    public close: ButtonPlus = null;
    @bindComp("cc.Node")
    public weekcountdown: Node = null;
    @bindComp("cc.Node")
    public dailycountdown: Node = null;
    @bindComp("cc.Node")
    public item: Node = null;
    @bindComp("cc.Node")
    public myRank: Node = null;
    @bindComp("cc.Node")
    public list: Node = null;
    @bindComp("cc.Node")
    public title: Node = null;
    @bindComp("cc.Node")
    public weektimeNode: Node = null;
    @bindComp("cc.Node")
    public dailytimeNode: Node = null;

    private dailyRewardHour:number = 22;
    private dailyRewardMin:number = 0;
    private weekDayNum:number = 7;
    private dailyTimer:number = -1
    private weeklyTimer:number = -1
    
    public onInit(): void {
        this.close.addClick(this.closeSelf,this)
    }
    
    async onShow(param)
    {
        let rankCfg = ConfigHelper.getCfgSet("ArenaRankCfg");
        let arr = [];//排名奖励

        for(let key in rankCfg)
        {
            arr.push({type:param.rewardType, info: rankCfg[key]});
        }
        this.rewardList.setData(arr);

        if(param.rewardType == "daily")
        {
            this.weektimeNode.active = false
            this.dailytimeNode.active = true         
            this.title.getComponent(Label).string = Ext.i18n.t("UI_Arena_01_008");
            this.dailyCountDown();
        }
        else
        {
            this.weektimeNode.active = true
            this.dailytimeNode.active = false    
            this.title.getComponent(Label).string = Ext.i18n.t("UI_Arena_01_007");
            this.weeklyCountDown();
        }
    }

    setMyRankRewardInfo(arr){
        for(let key in arr)
        {
            let node = this.list.children[key]
            if(!node)
            {
                node = instantiate(this.item);
                this.list.addChild(node);
            }
            node.active = true;
            Common.setNodeImgSprite("itemRes/item" + arr[key].type, node.children[0],null, () => {});
            let numNode =  node.children[1];
            numNode.getComponent(Label).string = "x" + arr[key].count;
        }
    }

    weeklyCountDown(){
        let now = new Date();
        let addDay = 0;
        
        if(now.getUTCDay() != 0 || now.getUTCHours() > 22)
            addDay =  this.weekDayNum - now.getDay();
        let utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()+addDay, this.dailyRewardHour, this.dailyRewardMin)
        let alarm =  new Date(now.getFullYear(), now.getMonth(), now.getDate() + addDay, this.dailyRewardHour, this.dailyRewardMin).valueOf();
        let timeDiff = utcNow.valueOf() - now.valueOf();
        this.weekcountdown.getComponent(RichText).string = `<b><color=#B05C1C>`+"<color=#23B01C>"+ 0 + "d:" + 0 + ":" + 0+ ":" + 0+"</color>"+`</color></b>`
        this.weeklyTimer = setInterval(()=>{
            timeDiff -= 1000;
            if(timeDiff<=0)
            {
                now = new Date();
                addDay = 0;
                if(now.getUTCDate() != 0 || now.getUTCHours() > 22)
                    addDay =  this.weekDayNum - now.getUTCDay();
                utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()+addDay, this.dailyRewardHour, this.dailyRewardMin)
                timeDiff = utcNow.valueOf() - now.valueOf();
                this.weekcountdown.getComponent(RichText).string = `<b><color=#B05C1C>`+"<color=#23B01C>"+ 0 + "d:" + 0 + ":" + 0+ ":" + 0+"</color>"+`</color></b>`
            }
            var hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            var minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            this.weekcountdown.getComponent(RichText).string = `<b><color=#B05C1C>`+"<color=#23B01C>"+ days + "d:" + hours + ":" + minutes+ ":" + seconds+"</color>"+`</color></b>`
        },1000)
    }

    dailyCountDown(){
        let now = new Date();
        let utcDay = now.getUTCDate();
        let utcHour = now.getUTCHours();
        let utcMin = now.getUTCMinutes();
        if(utcHour >= 22 && utcMin >= 0)
        {
            utcDay += 1;
        }

        let utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), utcDay, this.dailyRewardHour, this.dailyRewardMin)
        // let alarm =  new Date(now.getFullYear(), now.getMonth(), now.getDate(), this.dailyRewardHour, this.dailyRewardMin).valueOf();
        let timeDiff =  utcNow.valueOf() - now.valueOf();
        this.dailycountdown.getComponent(RichText).string =  `<b><color=#B05C1C>`+ "<color=#23B01C>"+0 + ":" + 0+ ":" + 0+"</color>"+`</color></b>`
        this.dailyTimer = setInterval(()=>{
            timeDiff -= 1000;
            if(timeDiff<=0)
            {
                now = new Date();
                utcDay = now.getUTCDate();
                utcHour = now.getUTCHours();
                utcMin = now.getUTCMinutes();
                if(utcHour >= 22 && utcMin >= 0)
                {
                    utcDay += 1;
                }

                utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), utcDay, this.dailyRewardHour, this.dailyRewardMin)
                timeDiff =  utcNow.valueOf() - now.valueOf();
                this.dailycountdown.getComponent(RichText).string =  `<b><color=#B05C1C>`+ "<color=#23B01C>"+0 + ":" + 0+ ":" + 0+"</color>"+`</color></b>`
            }
            var hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            this.dailycountdown.getComponent(RichText).string =  `<b><color=#B05C1C>`+ "<color=#23B01C>"+hours + ":" + minutes+ ":" + seconds+"</color>"+`</color></b>`
        },1000)
    }

    closeSelf(){
        this.closeUIForm();
    }

    protected onDisable(): void {
        clearInterval(this.dailyTimer);
        clearInterval(this.weeklyTimer);
    }

    
    start() {

    }
}


