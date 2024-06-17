import { _decorator, Component, Label, Node } from 'cc';
import { bindComp, ButtonPlus, FormType, ModalOpacity, UIBase, UIListView, UIManager } from '../../../UIFrame/indexFrame';
import { MaskType } from '../../../UIFrame/UIBase';
import Constants from '../../../Constant';
import Redux from '../../../redux';
import RankModel from '../../../model/RankModel';
import State from '../../../redux/state';
import { PlayerInfo } from '../../../utils/pomelo/DataDefine';
import { Common, Ext } from '../../../utils/indexUtils';
import GameUtils from '../../../utils/GameUtils';
const { ccclass, property } = _decorator;

@ccclass('UIPowerRank')
export default class UIPowerRank extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, false);
    static prefabPath = "popup/UIPowerRank";
    @bindComp("ButtonPlus")
    public close: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public btn_Info: ButtonPlus = null;
    @bindComp("cc.Label")
    public myRank: Label = null;  
    @bindComp("cc.Label")
    public myPower: Label = null;  
    @bindComp("cc.Label")
    public myName: Label = null;  
    @bindComp("cc.Node")
    public myHead: Node = null;  
    @bindComp("UIListView")
    public rankList: UIListView = null;


    onInit() {
        this.close.addClick(this.onBtnClose,this);
        this.btn_Info.addClick(this.onBtnInfo,this);
    }

    onShow() {
        this.connectRedux()
        let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
        GameUtils.setHeadImg(accInfo.avatar ,this.myHead)
        RankModel.getTopList()
    }

    connectRedux() {
        Redux.Watch(this, Redux.ReduxName.rank, "powerRankData", (powerRankData) => {
            console.log("watch powerRankData " ,powerRankData)
            if(powerRankData.rankInfos){
                this.refreshList(powerRankData.rankInfos)
                if(powerRankData.myRank == 0){
                    this.myRank.string = "--"
                }else{
                    this.myRank.string = powerRankData.myRank + ""
                }
                this.myPower.string = Common.formatEngNumber(powerRankData.myBattlePower, 2, false) +""
            }
            let accInfo = State.getState(Redux.ReduxName.user, "accInfo");
            this.myName.string = accInfo.name+""
            // 初始化头像
        });
    }

    refreshList(powerRankData){
        let arr = []
        powerRankData.forEach(element => {
            if(element.playerSmpl){
                arr.push(element)
            }
        });
        console.log("arr===",arr)
        this.rankList.setData(arr)
    }

    onBtnClose(){
        this.closeUIForm()
    }

    onBtnInfo(){
        UIManager.showNotice(Ext.i18n.t("TipsInfo_011"),Ext.i18n.t("TipsInfo_012"))
    }
    
    start() {

    }

    update(deltaTime: number) {
        
    }
}


