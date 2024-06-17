
import { _decorator, Component,sys, UITransform } from 'cc';
import UIManager from '../../UIFrame/UIManager';
import Constants from '../../Constant';
const { ccclass, property } = _decorator;

@ccclass
export default class RichEvent extends Component {

    start () {

    }

    urlClick(event,param){
        console.log("tesfagfaga param="+param)
        // window.open('https://'+param);
        sys.openURL(param);
    }
    
    showAttrNote(event,param){
        let pos = event.target.parent.getComponent(UITransform).convertToWorldSpaceAR(event.target.position)
        UIManager.openView(Constants.Panels.UIAttributeNote,{pos,attrId:param})
    }
}
