
import { EditBox, Label, Node, _decorator } from "cc";
import { ButtonPlus, EventCenter, FormType, ModalOpacity, UIBase, UIListView, bindComp } from "../../../UIFrame/indexFrame";
import { MaskType } from "../../../UIFrame/UIBase";
import Ext from "../../../utils/exts";
import Common from "../../../utils/common";
import { LangTxt } from "../../../config/basecfg";
import UserModel from "../../../model/UserModel";
import { PlayerInfo, SysSettingType } from "../../../utils/pomelo/DataDefine";
import Redux from "../../../redux";
import { AvatarListItem } from "../../items/AvatarListItem";
import State from "../../../redux/state";
import GameUtils from "../../../utils/GameUtils";

const { ccclass } = _decorator;

@ccclass
export default class UIEditAvatar extends UIBase {
    formType = FormType.PopUp;
    maskType = new MaskType(ModalOpacity.OpacityHigh, false);
    static prefabPath = "setting/UIEditAvatar";
    @bindComp("cc.Node")
    head: Node

    // 确认
    @bindComp('ButtonPlus')
    btn_confirm: ButtonPlus;
    @bindComp('ButtonPlus')
    btn_cancel: ButtonPlus;
    @bindComp('ButtonPlus')
    closeBtn: ButtonPlus;
    @bindComp("UIListView")
    public avatarList: UIListView = null;

    private selectIdx = 0
    private oriIdx = 0

    public onInit(): void {
        this.initEvent();
        this.avatarList.setItemClickCb(this.onItemCb.bind(this))
        this.avatarList.setItemRefreshCb(this.onItemRefreshCb.bind(this));
        this.closeBtn.addClick(this.closeSelf,this)
    }

    onItemCb(id , data){
        console.log({id, data});
        if(id != this.selectIdx){
            this.selectIdx = id
            this.avatarList.refreshCurItem()
        }
    }

    onItemRefreshCb(id,itemS){
        let a = itemS as AvatarListItem
        if(id == this.selectIdx){
            a.light.active = true
        }else{
            a.light.active = false
        }
    }

    connectRedux() {
        Redux.Watch(this, Redux.ReduxName.user, "accInfo", (accInfo: PlayerInfo) => {
            GameUtils.setHeadImg(accInfo.avatar ,this.head)
            if(accInfo.avatar.indexOf("img://") != -1){ //系统默认头像
                let idxStr = accInfo.avatar.split("://")[1]
                this.oriIdx = parseInt(idxStr)
            }else{
                this.oriIdx = 0
            }
            this.avatarList.refreshCurItem()
        });
    }

    onShow() {
        this.connectRedux()
        let arr = []
        for(let i=0;i<20;i++){
            arr.push(i)
        }
        this.avatarList.setData(arr)
    }

    // 初始化事件
    initEvent() {
        this.btn_confirm.addClick(this.submit, this);
        this.btn_cancel.addClick(this.onBtnClose, this);
    }

    onBtnClose(){
        this.closeUIForm()
    }

    // 提交
    async submit() {
        if(this.selectIdx != this.oriIdx){
            UserModel.roleChangeAvatar(this.selectIdx)
        }
    }

    closeSelf()
    {
        this.closeUIForm();
    }
}
