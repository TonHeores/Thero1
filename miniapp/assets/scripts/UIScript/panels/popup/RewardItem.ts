import { _decorator, Component, Label, Node } from 'cc';
import { bindComp, Binder, UIListItem } from '../../../UIFrame/indexFrame';
import { Common, Ext } from '../../../utils/indexUtils';
import ConstEnum from '../../../utils/EnumeDefine';
const { ccclass, property } = _decorator;

@ccclass('RewardItem')
export class RewardItem extends Component {
    @bindComp("cc.Node")
    public itemQuality: Node = null;
    @bindComp("cc.Node")
    public itemIcon: Node = null;
    @bindComp("cc.Node")
    public itemNum: Node = null;
    @bindComp("cc.Node")
    public itemName: Node = null;

    private data
    protected onLoad(): void {
        // Binder.bindComponent(this);
    }

    start() {

    }

    initData(param){
        Binder.bindComponent(this);
        this.data = param;
        console.log(this.data);
        let imgUrl = "itemRes/"+"item" + this.data.type;
        Common.setNodeImgSprite(imgUrl, this.itemIcon,null, () => {
        })
        let quaUrl = "quality/"+1
        Common.setNodeImgSprite(quaUrl, this.itemQuality,null, () => {
        })
        this.itemNum.getComponent(Label).string = "x" + this.data.count;
        if(this.data.type == ConstEnum.ItemType.GoldCoin)
            this.itemName.getComponent(Label).string = Ext.i18n.t("UI_Item_01_001")
        else if(this.data.type == ConstEnum.ItemType.GemCoin)
            this.itemName.getComponent(Label).string = Ext.i18n.t("UI_Item_01_002")
        else if(this.data.type == ConstEnum.ItemType.ChestCount)
            this.itemName.getComponent(Label).string = Ext.i18n.t("UI_Item_01_007")
        else if(this.data.type == ConstEnum.ItemType.ArenaTicket)
            this.itemName.getComponent(Label).string = Ext.i18n.t("UI_Item_01_005")
        else if(this.data.type == ConstEnum.ItemType.SpeedUpCard)
            this.itemName.getComponent(Label).string = Ext.i18n.t("UI_Item_01_004")
        else if(this.data.type == ConstEnum.ItemType.Exp)
        {
            this.itemName.getComponent(Label).string = Ext.i18n.t("UI_Item_01_008")
        }
    }
}


