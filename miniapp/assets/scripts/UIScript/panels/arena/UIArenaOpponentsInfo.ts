import { _decorator, Component, Label, Node, sp, Sprite, UITransform, Vec3 } from 'cc';
import { bindComp, ButtonPlus, FormType, ModalOpacity, UIBase, UIManager } from '../../../UIFrame/indexFrame';
import { MaskType } from '../../../UIFrame/UIBase';
import Ext from '../../../utils/exts';
import ConstEnum from '../../../utils/EnumeDefine';
import { EquipInfo, PlayerInfo } from '../../../utils/pomelo/DataDefine';
import { ConfigHelper } from '../../../utils/ConfigHelper';
import { Common } from '../../../utils/indexUtils';
import Constants from '../../../Constant';
const { ccclass, property } = _decorator;

@ccclass('UIArenaOpponentsInfo')
export class UIArenaOpponentsInfo extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, true);
    static canRecall = true;
    static prefabPath = "arena/UIArenaOpponentsInfo";
    @bindComp("cc.Node")
    public playerName: Node = null;
    @bindComp("cc.Node")
    public arenaScore: Node = null;
    @bindComp("cc.Node")
    public playerLevel: Node = null;
    @bindComp("cc.Node")
    public playerUid: Node = null;
    @bindComp("cc.Node")
    public Power: Node = null;
    @bindComp("cc.Node")
    public equips: Node = null;
    @bindComp("cc.Node")
    public head: Node = null;
    @bindComp("cc.Node")
    public gender: Node = null;
    @bindComp("cc.Node")
    public noSex: Node = null;
    @bindComp("cc.Node")
    public iconBoy: Node = null;
    @bindComp("cc.Node")
    public iconGirl: Node = null;
    @bindComp("cc.Label")
    public Speed: Label = null;  // 速度
    @bindComp("cc.Label")
    public Hp: Label = null;  // 血量
    @bindComp("cc.Label")
    public Atk: Label = null; // 攻击
    @bindComp("cc.Label")
    public Def: Label = null; // 防御
    @bindComp("cc.Label")
    public DblAttackRate: Label = null; //连击率
    @bindComp("cc.Label")
    public DizzyRate: Label = null;  //击晕率
    @bindComp("cc.Label")
    public TrumpRate: Label = null;  //暴击率
    @bindComp("cc.Label")
    public DodgeRate: Label = null;  //闪避率
    @bindComp("cc.Label")
    public CounterRate: Label = null; //反击率
    @bindComp("cc.Label")
    public BloodRate: Label = null;   //格挡率
    @bindComp("ButtonPlus")
    public detailBtn: ButtonPlus = null;
    private opponentsInfo

    async onShow(param) {
        console.log("arenalist===",param);
        this.opponentsInfo = param;
        this.detailBtn.addClick(this.showDetail,this);
        this.refeshPlayerInfo(param.accInfo);
        this.initAttrs(param.accInfo.heroAttrs);
        this.initEquips(param.accInfo);
    }
    

    refeshPlayerInfo(info){
        this.playerName.getComponent(Label).string = info.name ? info.name : info.uid;
        this.playerLevel.getComponent(Label).string = Ext.i18n.t("UI_Main_01_001").replace("{0#}", info.lv);
        this.arenaScore.getComponent(Label).string = info.arenaScore;
        this.playerUid.getComponent(Label).string = info.uid;
        this.Power.getComponent(Label).string = info.battlePower;
        if(info.gender == 1)
        {
            this.iconGirl.active = false
            this.iconBoy.active = true;
            this.noSex.active = false;
        }
        else if(info.gender == 2)
        {
            this.iconGirl.active = true;
            this.iconBoy.active = false;
            this.noSex.active = false;
        }
        else
        {
            this.iconGirl.active = false
            this.iconBoy.active = false;
            this.noSex.active = true;
        }
        if(info.avatar == ""){
            Common.setNodeImgSprite("headIcon/0", this.head,null, () => {});
        }else{
            if(info.avatar.indexOf("img://") != -1){ //系统默认头像
                let idxStr = info.avatar.split("img://")[1]
                let oriIdx = parseInt(idxStr)
                Common.setNodeImgSprite("headIcon/"+oriIdx, this.head,null, () => {});
            }
        }
    }

    initAttrs(atts) {
        //连击 击晕 暴击 闪避 反击 吸血
        this.Atk.string = atts[ConstEnum.AttrType.Attack] +""
        this.Def.string = atts[ConstEnum.AttrType.Defense] +""
        this.Hp.string = atts[ConstEnum.AttrType.HP] +""
        this.Speed.string = atts[ConstEnum.AttrType.Speed] +""
        this.DblAttackRate.string = atts[ConstEnum.AttrType.ComboRate] +"%"
        this.DizzyRate.string = atts[ConstEnum.AttrType.StunRate] +"%"
        this.TrumpRate.string = atts[ConstEnum.AttrType.TrumpDmgRate] +"%"
        this.DodgeRate.string = atts[ConstEnum.AttrType.DodgeRate] +"%"
        this.CounterRate.string = atts[ConstEnum.AttrType.CounterRate] +"%"
        this.BloodRate.string = atts[ConstEnum.AttrType.BloodRate] +"%"
    }

    initEquips(accInfo: PlayerInfo) {
        let equips = accInfo.equips
        equips.forEach(ele => {
            let info = ele as EquipInfo
            if (info != null && info.equipId != 0) {
                let equip = ConfigHelper.getCfg("EquipCfg", info.equipId)
                if (equip.equipId) {

                }
                let euqipItem = this.equips.children[equip.part - 1]
                let empty = euqipItem.children[0]
                empty.active = false

                let item = euqipItem.children[1]
                item.active = true
                let itemLv = item.children[1].getComponent(Label)
                let lv = info.lv
                if(lv == null){
                    lv = 1
                }
                itemLv.string = "LV."+lv
                let icon = item.children[0]
                let imgUrl = "gameRes/" + equip.imageId
                Common.setNodeImgSprite(imgUrl, icon, null, () => {
                })
                this.setEquipBg(item,equip.quality)
            }
        });
    }

    async setEquipBg(node:Node,quality){
        let quaUrl = "quality/" + quality
        Common.setNodeImgSprite(quaUrl, node, null, () => {
        })
        let spineNode = node.children[2]
        if(quality>=6){
            spineNode.active = true
            let aniUrl = "uiEffect/zhuangbeikuang"
            let aniName = "caihongfen"
            if(quality == 6){
                aniName = "hongse"
            }else if(quality == 7){
                aniName = "huangse"
            }else if(quality == 8){
                aniName = "lanse"
            }else if(quality == 9){
                aniName = "caihongfen"
            }
            console.log("setEquipBg aniName="+aniName)
			Common.setNodeSpine(aniUrl, spineNode, () => {
                let spine = spineNode.getComponent(sp.Skeleton)
                spine.premultipliedAlpha = false
                spine.paused = false
				spine.setAnimation(0, aniName, true);
			});
        }else{
            let spine = spineNode.getComponent(sp.Skeleton)
            spine.paused = true
            // spine.enabled = false
            // Common.unloadSkeNode(node)
            spineNode.active = false
        }
    }

    showDetail()
    {
        UIManager.openView(Constants.Panels.UIArenaCompareAttr,{opponentsInfo:this.opponentsInfo})
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}


