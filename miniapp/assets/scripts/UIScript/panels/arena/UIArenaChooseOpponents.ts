import { _decorator, Component, instantiate, Label, Node } from 'cc';
import { bindComp, ButtonPlus, FormType, ModalOpacity, UIBase, UIListView, UIManager } from '../../../UIFrame/indexFrame';
import { MaskType } from '../../../UIFrame/UIBase';
import Constants from '../../../Constant';
import ArenaModel from '../../../model/ArenaModel';
import { PlayerInfo } from '../../../utils/pomelo/DataDefine';
import State from '../../../redux/state';
import Redux from '../../../redux';
import { Common, Ext } from '../../../utils/indexUtils';
import { ConfigHelper } from '../../../utils/ConfigHelper';
import UserModel from '../../../model/UserModel';
import { ItemType } from '../../../utils/pomelo/ConstDefine';
import ConstEnum from '../../../utils/EnumeDefine';
const { ccclass, property } = _decorator;

@ccclass('UIArenaChooseOpponents')
export class UIArenaChooseOpponents extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, true);
    static canRecall = true;
    static prefabPath = "arena/UIArenaChooseOpponents";

    @bindComp("ButtonPlus")
    public close: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public refreshBtn: ButtonPlus = null;
    @bindComp("UIListView")
    public opponentsList: UIListView = null;
    @bindComp("cc.Node")
    public item: Node = null;
    @bindComp("cc.Node")
    public rewarList: Node = null;
    @bindComp("cc.Node")
    public challengeNumber: Node = null;
    @bindComp("cc.Node")
    public Power: Node = null;

    private refreshCost:number = 100;

    onInit()
    {
        this.close.addClick(this.closeSelf,this);
        this.refreshBtn.addClick(this.refreshOpponents,this);
    }

    async onShow(param) {
        console.log(param);
        // let arr = param.oppoInfos[0];
        // param.oppoInfos[1] = arr
        this.refreshList(param)
        let accInfo = State.getState(Redux.ReduxName.user, "accInfo");
        let score = accInfo.arenaScore
        let cfg =  ConfigHelper.getCfgSet("ArenaScoreSegmentCfg");
        // let winRewards = [];
        // for(let key in cfg)
        // {
        //     if(score >=  cfg[key].scoreBegin && score <=  cfg[key].scoreEnd)
        //         winRewards = cfg[key].winRewards;
        // }
        // this.setWinRewardList(winRewards);
        Redux.Watch(this, Redux.ReduxName.user, "accInfo", (accInfo: PlayerInfo) => {
            this.challengeNumber.getComponent(Label).string = UserModel.getItemByType(ItemType.ArenaTicket) +  "/3"
        })
        this.Power.getComponent(Label).string = accInfo.battlePower;
    }

    //刷新对手列表
    refreshList(param)
    {
        Redux.Watch(this, Redux.ReduxName.arena, "oppoInfos", (oppoInfos) => {
            this.opponentsList.setData(oppoInfos)
        })
    }

    refreshOpponents()
    {
        if(UserModel.getItemByType(ConstEnum.ItemType.GoldCoin) < this.refreshCost)
        {
            let str = Ext.i18n.t("BannerTips_001").replace("{0#}",Ext.i18n.t("UI_Item_01_001"))
            UIManager.showToast(str)
            return;
        }
        ArenaModel.refreshOpponents(this,this.refreshList);
    }

    // setWinRewardList(arr){
    //     for(let key in arr)
    //     {
    //         let node = this.rewarList.children[key]
    //         if(!node)
    //         {
    //             node = instantiate(this.item);
    //             this.rewarList.addChild(node);
    //         }
    //         node.active = true;
    //         Common.setNodeImgSprite("itemRes/item" + arr[key].type, node.children[0],null, () => {});
    //         let numNode =  node.children[1];
    //         numNode.getComponent(Label).string = "" + arr[key].count;
    //     }
    // }

    closeSelf(){
        this.closeUIForm();
    }
    
    start() {

    }

    update(deltaTime: number) {
        
    }
}


