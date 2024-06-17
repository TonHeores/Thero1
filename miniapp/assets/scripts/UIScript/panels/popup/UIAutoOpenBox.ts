import { _decorator, Component, isCCObject, Label, log, Node, sys, Vec3 } from 'cc';
import { bindComp, ButtonDropdownList, ButtonPlus, FormType, ModalOpacity, UIBase, UIManager } from '../../../UIFrame/indexFrame';
import { MaskType } from '../../../UIFrame/UIBase';
import Ext from '../../../utils/exts';
import Redux from '../../../redux';
import State from '../../../redux/state';
import { PlayerInfo } from '../../../utils/pomelo/DataDefine';
import { CHECK_KEY } from '../../../config/basecfg';
const { ccclass, property } = _decorator;

@ccclass('UIAutoOpenBox')
export class UIAutoOpenBox extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, true);
    static canRecall = true;
    static prefabPath = "popup/UIAutoOpenBox";

    @bindComp("ButtonDropdownList")
    filterQuality: ButtonDropdownList
    @bindComp("ButtonDropdownList")
    filterOne1: ButtonDropdownList
    @bindComp("ButtonDropdownList")
    filterOne2: ButtonDropdownList
    @bindComp("ButtonDropdownList")
    filterTwo1: ButtonDropdownList
    @bindComp("ButtonDropdownList")
    filterTwo2: ButtonDropdownList
    @bindComp("ButtonDropdownList")
    filterOpenNum: ButtonDropdownList
    @bindComp("ButtonPlus")
    public checkMaxed: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public checkFilter1: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public checkFilter2: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public startBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public closeBtn: ButtonPlus = null;
    @bindComp("cc.Node")
    public imgCheckMax: Node = null;
    @bindComp("cc.Node")
    public imgCheckFilter1: Node = null;
    @bindComp("cc.Node")
    public imgCheckFilter2: Node = null;

    
    private mainIdx = 0;

    filterObj = {
        quality:1,
        openNumber:1,
        needfilterArr: new Array(4).fill(0),
        challengeMaxed:true,
        checkFilter1:false,
        checkFilter2:false
    }


    private qualityData = [{name:"UI_TreasueBox_03_009",type:1},{name:"UI_TreasueBox_03_010",type:2},{name:"UI_TreasueBox_03_011",type:3},
    {name:"UI_TreasueBox_03_012",type:4},{name:"UI_TreasueBox_03_013",type:5},{name:"UI_TreasueBox_03_014",type:6},{name:"UI_TreasueBox_03_015",type:7}
    ,{name:"UI_TreasueBox_03_016",type:8},{name:"UI_TreasueBox_03_017",type:9}]
    private filterData1 = [{name:"UI_TreasueBox_03_018",type:0}, {name:"UI_Details_01_005",type:5},{name:"UI_Details_01_006",type:6},{name:"UI_Details_01_007",type:7},{name:"UI_Details_01_008",type:8},{name:"UI_Details_01_009",type:9},{name:"UI_Details_01_010",type:10}]
    private filterData2 = [{name:"UI_TreasueBox_03_018",type:0},{name:"UI_Details_01_011",type:11},{name:"UI_Details_01_012",type:12},{name:"UI_Details_01_013",type:13},{name:"UI_Details_01_014",type:14},{name:"UI_Details_01_015",type:15},{name:"UI_Details_01_016",type:16}]
    private openNumData = [{name:"UI_TreasueBox_03_019",type:1},{name:"UI_TreasueBox_03_020",type:2},{name:"UI_TreasueBox_03_021",type:3},{name:"UI_TreasueBox_03_022",type:4},{name:"UI_TreasueBox_03_023",type:5}]

    public onInit() {
        this.checkMaxed.addClick(this.checkMaxHandle, this);
        this.checkFilter1.addClick(this.checkFilterHandle,this);
        this.checkFilter2.addClick(this.checkFilterHandle,this);
        this.closeBtn.addClick(this.onCloseBtn,this);
        this.startBtn.addClick(this.Accelerate,this);
        let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
        let saveKey = CHECK_KEY.AUTOOPENBOXSETTING + "_check_"+ accInfo.uid;
        let setting =  JSON.parse(sys.localStorage.getItem(saveKey))
        if(setting)
            this.filterObj = setting;
        this.refreshPanel();
    }

    async onShow(params) {
        this.initFilter(this.filterQuality,this.qualityData,"quality",this.changeFilterData);
        this.initFilter(this.filterOne1,this.filterData1,{propertyName:"needfilterArr",index:0},this.changeFilterData);
        this.initFilter(this.filterOne2,this.filterData2,{propertyName:"needfilterArr",index:1},this.changeFilterData);
        this.initFilter(this.filterTwo1,this.filterData1,{propertyName:"needfilterArr",index:2},this.changeFilterData);
        this.initFilter(this.filterTwo2,this.filterData2,{propertyName:"needfilterArr",index:3},this.changeFilterData);
        this.initFilter(this.filterOpenNum,this.openNumData,"openNumber",this.changeFilterData);
        this.filterQuality.setSelection(this.filterObj.quality-1,false);
        this.filterOne1.setSelection(this.filterObj.needfilterArr[0]==0?this.filterObj.needfilterArr[0]:this.filterObj.needfilterArr[0]-4,false);
        this.filterOne2.setSelection(this.filterObj.needfilterArr[1]==0?this.filterObj.needfilterArr[1]:this.filterObj.needfilterArr[1]-10,false);
        this.filterTwo1.setSelection(this.filterObj.needfilterArr[2]==0?this.filterObj.needfilterArr[2]:this.filterObj.needfilterArr[2]-4,false);
        this.filterTwo2.setSelection(this.filterObj.needfilterArr[3]==0?this.filterObj.needfilterArr[3]:this.filterObj.needfilterArr[3]-10,false);
        this.filterOpenNum.setSelection(this.filterObj.openNumber-1,false);
        let callback = (node,idx)=>{
            if(node.name == "titleBtn"){
                node.children[1].scale = new Vec3(1,node.children[1].scale.y *-1)
            }
        }
        this.filterQuality.addItemRenderHandler(callback,this);
        this.filterOne1.addItemRenderHandler(callback,this);
        this.filterOne2.addItemRenderHandler(callback,this);
        this.filterTwo1.addItemRenderHandler(callback,this);
        this.filterTwo2.addItemRenderHandler(callback,this);
        this.filterOpenNum.addItemRenderHandler(callback,this);
    }

    refreshPanel(){
        this.imgCheckMax.active = this.filterObj.challengeMaxed;
        this.imgCheckFilter1.active = this.filterObj.checkFilter1;
        this.imgCheckFilter2.active = this.filterObj.checkFilter2;
        this.imgCheckMax.active = this.filterObj.challengeMaxed;
    }

    Accelerate(){
        let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
        if(accInfo.curEquip != null) 
        {
            UIManager.showToast(Ext.i18n.t("BannerTips_004"));
            return;
        }
        if(accInfo.items[3] <= 0)
        {
            let tipstr = Ext.i18n.t("BannerTips_001").replace("{0#}",Ext.i18n.t("UI_Item_01_003"));
            UIManager.showToast(tipstr);
            return;
        }
        this.imgCheckMax.active ? this.filterObj.challengeMaxed = true : this.filterObj.challengeMaxed = false;
        if(!this.imgCheckFilter1.active)
        {
            this.filterObj.needfilterArr[0] = -1;
            this.filterObj.needfilterArr[1] = -1;
        }
        if(!this.imgCheckFilter2.active)
        {
            this.filterObj.needfilterArr[2] = -1;
            this.filterObj.needfilterArr[3] = -1;
        }
        
        Redux.State.dispatch({ type: Redux.ReduxName.autoOpenBox, openBoxSetting:this.filterObj });
        let openBoxInfo = State.getState(Redux.ReduxName.autoOpenBox, "openBoxInfo");
        openBoxInfo.isStartAutoOpen = true;
        Redux.State.dispatch({ type: Redux.ReduxName.autoOpenBox, openBoxInfo:openBoxInfo });
        this.closeUIForm();
    }

    checkFilterHandle(evt){
        if(evt.target.name == "checkFilter1")
        {
            this.imgCheckFilter1.active = !this.imgCheckFilter1.active;
            this.filterObj.checkFilter1 = this.imgCheckFilter1.active;
        }
        else if(evt.target.name == "checkFilter2")
        {
            this.imgCheckFilter2.active = !this.imgCheckFilter2.active;
            this.filterObj.checkFilter2 = this.imgCheckFilter2.active;
        }
        this.saveSetting();
    }

    checkMaxHandle(){
        this.imgCheckMax.active = !this.imgCheckMax.active;
        this.filterObj.challengeMaxed = !this.filterObj.challengeMaxed;
    }

    initFilter(filterNode:ButtonDropdownList, filterData, propertiParam, ChangedEventHandler){
        filterNode.initDropdownList();
        let self = this;
        filterNode.addSelectionChangedEventHandler((selectionData) => {
            this.mainIdx = selectionData.key;
            
            ChangedEventHandler.bind(self,filterData,propertiParam,selectionData.key)()
        }, this);

        if (filterData.length > 0) {
            let dataList = []
            let idx = 0
            let curIdx = 0
            filterData.forEach(element => {
                let lb = Ext.i18n.t(element.name);
                dataList.push({ label:  lb, key: idx })
                idx++
            });

            filterNode.setOptionDataList(dataList, '' + curIdx);
        }

    }

    changeFilterData(filterInfo, propertiParam,idx:number){
        if(filterInfo == this.openNumData && idx != 0)
        {
            UIManager.showToast(Ext.i18n.t("BannerTips_005"));
            this.filterOpenNum.setSelection(0,false)
            return;
        }
        
        if(propertiParam instanceof Object)
        {
            this.filterObj[propertiParam.propertyName][propertiParam.index] = filterInfo[idx].type;
        }
        else
            this.filterObj[propertiParam] = filterInfo[idx].type;
        this.saveSetting();
        console.log(this.filterObj);
        
    }

    saveSetting(){
        let accInfo: PlayerInfo = State.getState(Redux.ReduxName.user, "accInfo");
        let saveKey = CHECK_KEY.AUTOOPENBOXSETTING + "_check_"+ accInfo.uid;
        sys.localStorage.setItem(saveKey,JSON.stringify(this.filterObj));
    }

    changeArrow(node,idx){
        if(node.name == "titleBtn"){
            if(this.filterTwo2.foldFlg){
                node.children[1].scale = new Vec3(1,node.children[1].scale.y *-1)
            }
            else
            {
                node.children[1].scale = new Vec3(1,-1 *node.children[1].scale.y )
            }
        }
    }

    onCloseBtn(evt) {
        this.closeUIForm()
    }

}


