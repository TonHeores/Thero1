
import { _decorator, Component,sys, UITransform } from 'cc';
import UIManager from '../../UIFrame/UIManager';
import Constants from '../../Constant';
import PlatformMgr from '../../platform/PlatformMgr';
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

    tgUrlClick(event,param){
        console.log("tgUrlClick=====",event,param)
        let url = "/tonheroes1"//先写死
        PlatformMgr.TGOpenTgLink(url);
    }
    
    showAttrNote(event,param){
        let pos = event.target.parent.getComponent(UITransform).convertToWorldSpaceAR(event.target.position)
        UIManager.openView(Constants.Panels.UIAttributeNote,{pos,attrId:param})
    }

    showGuideHead(event,param){
        UIManager.openView(Constants.Panels.UIEffect,{type:4,param});
    }
}
