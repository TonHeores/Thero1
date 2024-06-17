
import { _decorator, Component, Label, RichText } from 'cc';
import Ext from '../../utils/exts';
import { EventCenter } from '../../UIFrame/EventCenter';
import { EventName } from '../../Constant';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('LocalizedRichLabel')
@executeInEditMode
export class LocalizedRichLabel extends Component {
    richLabel: RichText | null = null;

    @property({ visible: false })
    key: string = '';
    @property({ displayName: 'Key', visible: true })
    get _key() {
        return this.key;
    }
    set _key(str: string) {
        this.updateLabel();
        this.key = str;
    }
    
    @property({ visible: false })
    cb: string = '';
    @property({ displayName: 'cb', visible: true })
    get _cb() {
        return this.cb || "";
    }
    set _cb(str: string) {
        this.updateLabel();
        this.cb = str;
    }

    @property({ visible: false })
    param: string = '';
    @property({ displayName: 'param', visible: true })
    get _param() {
        return this.param || "";
    }
    set _param(str: string) {
        this.updateLabel();
        this.param = str;
    }

    onLoad() {
        if (!Ext.i18n.ready) {
            Ext.i18n.init('en');
        }
        let richText = this.getComponent(RichText);
        if(richText)
        {
            this.richLabel = richText;
            this.updateLabel();
            return;
        }
    }

    protected onEnable(): void {
        EventCenter.on(EventName.ChangeLang, this.updateLabel, this)
    }


    updateLabel() {
        let str = Ext.i18n.t(this.key);
        
        this.richLabel && (this.richLabel.string = `<color=FFFACA> <outline color=9E5C1B width=3 click = '${this.cb}' param = ${this.param}>`+ str +"</outline></color>");
    }
}


