import { _decorator, color, Component, instantiate, Label, Node, tween, Vec3 } from 'cc';
import { bindComp, ButtonPlus, EventCenter, FormType, ModalOpacity, UIBase, UIListView, UIManager } from '../../../UIFrame/indexFrame';
import Constants, { EventName } from '../../../Constant';
import State from '../../../redux/state';
import Redux from '../../../redux';
import { ConfigHelper } from '../../../utils/ConfigHelper';
import { Common, Ext } from '../../../utils/indexUtils';
import { AttrInfo, EquipInfo } from '../../../utils/pomelo/DataDefine';
import ConstEnum from '../../../utils/EnumeDefine';
import { MaskType } from '../../../UIFrame/UIBase';
import ChestModel from '../../../model/ChestModel';
import CocosHelper from '../../../UIFrame/CocosHelper';
import { CHECK_KEY, StringColor, StringOutline } from '../../../config/basecfg';
import GameUtils from '../../../utils/GameUtils';
const { ccclass, property } = _decorator;

@ccclass('UINewEquip')
export class UINewEquip extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, false);
    canDestory = true;
    static canRecall = true;
    static prefabPath = "popup/UINewEquip";
    @bindComp("ButtonPlus")
    public close: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public close1: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public equipBtn: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public equipBtn1: ButtonPlus = null;
    @bindComp("ButtonPlus")
    public sellBtn: ButtonPlus = null;
    @bindComp("cc.Node")
    public getEquip1: Node = null;
    @bindComp("cc.Node")
    public getEquip2: Node = null;
    @bindComp("cc.Node")
    public equip: Node = null;
    @bindComp("cc.Node")
    public equip1: Node = null;
    @bindComp("cc.Node")
    public equip2: Node = null;
    @bindComp("cc.Node")
    public fightPower: Node = null;
    @bindComp("cc.Node")
    public fightPower1: Node = null;
    @bindComp("cc.Node")
    public newNode: Node = null;
    @bindComp("ButtonPlus")
    public checkBox: ButtonPlus = null;
    @bindComp("cc.Node")
    public checkImg: Node = null;
    @bindComp("cc.Node")
    public EquipName: Node = null;
    @bindComp("cc.Node")
    public EquipName1: Node = null;
    @bindComp("cc.Node")
    public EquipName2: Node = null;
    @bindComp("UIListView")
    public attributeList: UIListView = null;
    @bindComp("UIListView")
    public attributeList1: UIListView = null;
    @bindComp("UIListView")
    public attributeList2: UIListView = null;
    @bindComp("cc.Node")
    public fightNode: Node = null;


    static equipParam;
    private equiped:boolean;
    
    onInit()
    {
        this.close.addClick(this.closePrefab, this);
        this.close1.addClick(this.closePrefab, this);
        this.sellBtn.addClick(this.sellEquip, this);
        this.checkBox.addClick(this.autoHandle, this);

        this.equipBtn.addClick(this.equipHandle, this);
        this.equipBtn1.addClick(this.equipHandle, this);
        this.checkImg.active = false;
    }

    autoHandle(){
        this.checkImg.active = !this.checkImg.active;
    }

    equipHandle()
    {
        if(!UINewEquip.equipParam)
        {
            console.log("equipParam is null");
            return
        }
        let accInfo = State.getState(Redux.ReduxName.user, "accInfo");
        let equip = ConfigHelper.getCfg("EquipCfg", UINewEquip.equipParam.newEquip.equipId)
        if(this.equiped)//该部位有装备
        {
            let temp = UINewEquip.equipParam.newEquip;
            UINewEquip.equipParam.newEquip = UINewEquip.equipParam.oldEquip;
            UINewEquip.equipParam.oldEquip = temp;
            ChestModel.wearEquip();
            // this.newNode.active = false;
            this.refreshAttrNode();
            if(this.checkImg.active)
                this.sellEquip();
        }
        else
        {
            ChestModel.wearEquip();
            UIManager.closeView(Constants.Panels.UINewEquip);
            UINewEquip.equipParam = null;
        }
        Redux.State.dispatch({ type: Redux.ReduxName.user, accInfo });
    }

    sellEquip(){
        let oldEqFp:number = Common.computeFightPower(UINewEquip.equipParam.oldEquip.attrInfos);
        let newEqFp:number = Common.computeFightPower(UINewEquip.equipParam.newEquip.attrInfos);
        if(newEqFp - oldEqFp < 0)
        {
            ChestModel.saleEquip();
            UIManager.closeView(Constants.Panels.UINewEquip);
        }
        else
        {
            if(!GameUtils.checkRemeberIsValid(CHECK_KEY.CHANGEEQUIP)){
                console.log("之前没记住")
                UIManager.closeView(Constants.Panels.UINewEquip);
                let label:string = Ext.i18n.t("UI_Equip_04_001");
                UIManager.showTip(2,"title",label,()=>{
                    console.log("confirm")
                },(isCheck)=>{
                    console.log("isCheck===="+isCheck)
                    if(isCheck){
                        GameUtils.saveCheckRemenber(CHECK_KEY.CHANGEEQUIP);
                        ChestModel.saleEquip();
                    }
                    else
                    {
                        ChestModel.saleEquip();
                    }
                },()=>{
                    UIManager.openView(Constants.Panels.UINewEquip,{oldEquip:UINewEquip.equipParam.oldEquip, newEquip:UINewEquip.equipParam.newEquip})
                })
            }else{
                console.log("之前有记住,不用弹窗")
                ChestModel.saleEquip();
                UIManager.closeView(Constants.Panels.UINewEquip);
            }
        }
    }

    closePrefab()
    {
        console.log("close prefab");
        UIManager.closeView(Constants.Panels.UINewEquip);
    }

    async onShow(param) {
        UINewEquip.equipParam = param;
        console.log(param);

        if(param.oldEquip)
            this.equiped = true;
        else
        {
            this.equiped = false;
            let info = new EquipInfo();
            info.equipId = 0;
            param.oldEquip = info;
        }
        if(this.equiped)//该部位有装备
        {
            this.getEquip1.active = false;
            this.getEquip2.active = true;
            // this.newNode.active = true;
            this.refreshAttrNode()
        }
        else
        {
            this.getEquip1.active = true;
            this.getEquip2.active = false;
            this.initEquipImg(this.equip,this.EquipName,UINewEquip.equipParam.newEquip.equipId)
            let fp = Common.computeFightPower(UINewEquip.equipParam.newEquip.attrInfos);
            this.fightPower.getComponent(Label).string = fp + "";
            let arr = this.setAttrListData(UINewEquip.equipParam)
            this.attributeList.setData(arr);
        }
    }

    setAttrListData(equipInfo,isShowTips:boolean = true,isUseNewAttr:boolean = true){
        let arr = [];
        let newEquipAtts = equipInfo.newEquip.attrInfos
        let oldEquipAtts = equipInfo.oldEquip?.attrInfos
        let curEquipAtts = isUseNewAttr ? newEquipAtts : oldEquipAtts;
        let otherEquipAtts = isUseNewAttr ? oldEquipAtts : newEquipAtts;
        
        if(!equipInfo.oldEquip)
        {
            curEquipAtts.forEach(element => {
                arr.push({attrId:element.attrId,attrVal:element.attrVal,tipsMask:1})
            });
        }
        else
        {
            curEquipAtts.forEach(element => {
                let flag = this.compareAtts(element, otherEquipAtts);
                let mask = isShowTips && flag > 0 ? flag : 0;
                arr.push({attrId:element.attrId,attrVal:element.attrVal,tipsMask:mask})
            });
        }
        return arr;
    }

    refreshAttrNode()
    {
        let oldEqFp:number = Common.computeFightPower(UINewEquip.equipParam.oldEquip.attrInfos);
        let newEqFp:number = Common.computeFightPower(UINewEquip.equipParam.newEquip.attrInfos);
        this.initEquipImg(this.equip1, this.EquipName1, UINewEquip.equipParam.oldEquip.equipId);
        this.initEquipImg(this.equip2, this.EquipName2, UINewEquip.equipParam.newEquip.equipId);
        let result =  newEqFp - oldEqFp;
        
        if(result > 0)
        {
            this.fightPower1.getComponent(Label).string = "+ " + result + "";
            this.fightPower1.getComponent(Label).color = color("#4BEB13");
            this.fightPower1.getComponent(Label).outlineColor = color("#0D5506");

        } 
        else
        {
            this.fightPower1.getComponent(Label).string = "- " + Math.abs(result) + "";
            this.fightPower1.getComponent(Label).color = color("#FF4747");
            this.fightPower1.getComponent(Label).outlineColor = color("#8B1111");
        }
        if(result != 0) this.fightNode.active = true;
        else this.fightNode.active = false;
        let arr1 = this.setAttrListData(UINewEquip.equipParam,false, false)
        let arr2 = this.setAttrListData(UINewEquip.equipParam)
        this.attributeList1.setData(arr1);
        this.attributeList2.setData(arr2);
    }

    initFightPower(node:Node, equipAttr:Array<AttrInfo>)
    {
       let fp = Common.computeFightPower(equipAttr);
       node.getComponent(Label).string = fp + "";
    }

    initEquipAttr(nameNode:Node, valueNode:Node, tipsNode:Node, parma, isShowTips:boolean = true,isUseNewAttr:boolean = true)//isShowTip是否要显示tips
    {
        let newEquipAtts = parma.newEquip.attrInfos
        let oldEquipAtts = parma.oldEquip.attrInfos
        let curEquipAtts = isUseNewAttr ? newEquipAtts : oldEquipAtts;
        let otherEquipAtts = isUseNewAttr ? oldEquipAtts : newEquipAtts;
        for(let i = 0; i < nameNode.children.length;i++)
        {
            if(curEquipAtts[i])
            {
                let flag:number;
                nameNode.children[i].active = true;
                valueNode.children[i].active = true;
                tipsNode.children[i].active = true;
                let label = Common.getAttrNameByType(curEquipAtts[i].attrId);
                nameNode.children[i].getComponent(Label).string = label;
                //如果是特殊属性加上%
                if((curEquipAtts[i].attrId >= ConstEnum.AttrType.TrumpRate && curEquipAtts[i].attrId <= ConstEnum.AttrType.RsPierceRate))
                {
                    
                    valueNode.children[i].getComponent(Label).string = curEquipAtts[i].attrVal == 0 ? curEquipAtts[i].attrVal : curEquipAtts[i].attrVal.toFixed(2) + "%";
                }
                else
                {
                    valueNode.children[i].getComponent(Label).string = curEquipAtts[i].attrVal.toFixed() + "";
                }

                if(parma.oldEquip.equipId == 0)//该部位没有装备
                {
                    tipsNode.children[i].children[0].active = true;
                    tipsNode.children[i].children[1].active = false;
                    flag = 1;
                }
                else if(parma.oldEquip.equipId != 0)
                {
                    flag = this.compareAtts(curEquipAtts[i], otherEquipAtts);
                    if(flag == 0)
                        tipsNode.children[i].active = false;
                    else if(flag == 1)
                    {
                        tipsNode.children[i].children[0].active = true;
                        tipsNode.children[i].children[1].active = false;
                    }
                    else if(flag == 2)
                    {
                        tipsNode.children[i].children[0].active = false;
                        tipsNode.children[i].children[1].active = true;
                    }
                }
                isShowTips && flag > 0 ? tipsNode.children[i].active = true : tipsNode.children[i].active = false;
            }
            else
            {
                nameNode.children[i].active = false;
                valueNode.children[i].active = false;
                tipsNode.children[i].active = false;
            }
        }
    }

    compareAtts(attrInfo, Atts){
        let ShowUpMask:number = 1;//0不显示tips 1：上升 2：下降
        Atts.forEach(ele =>{
            if(ele.attrId == attrInfo.attrId)
            {
                if(ele.attrVal == attrInfo.attrVal)
                    ShowUpMask = 0;
                else if(ele.attrVal < attrInfo.attrVal)
                    ShowUpMask = 1;
                else if(ele.attrVal > attrInfo.attrVal)
                    ShowUpMask = 2;
            }
        })
        return ShowUpMask;
    }

    initEquipImg(imgNode:Node, equipNameNode:Node, equipId:number)
    {
        if(!UINewEquip.equipParam)
        {
            console.log("equipParam is null");
            return
        }
        let equip = ConfigHelper.getCfg("EquipCfg", equipId)

        let item = imgNode;
        item.active = true;
        let icon = item.children[0];
        let imgUrl = "gameRes/"+equip.imageId;
        Common.setNodeImgSprite(imgUrl, icon,null, () => {
        })
        let quaUrl = "quality/"+equip.quality
        Common.setNodeImgSprite(quaUrl, item,null, () => {
        })

        let lebel = Ext.i18n.t(equip.itemName)
        equipNameNode.getComponent(Label).string = lebel + "";
        equipNameNode.getComponent(Label).color = color(StringColor["quality" + equip.quality]);
        equipNameNode.getComponent(Label).outlineColor = color(StringOutline["quality" + equip.quality]);
    }

    public async showAnimation() {
        if(this.formType === FormType.PopUp) {
            this.node.scale = new Vec3(0,0,0);
            await CocosHelper.runTweenSync(this.node, tween().to(0.3, {scale: new Vec3(1,1,1)}, {easing : 'backOut'}));
        }
    }

    public async hideAnimation() {
        if(this.formType === FormType.PopUp) {
            await CocosHelper.runTweenSync(this.node, tween().to(0.3, {position:new Vec3(this.node.position.x,this.node.position.y -500), scale: new Vec3(0,0,0)}, {easing : 'backIn'}));
        }
    }

    start() {

    }
}


