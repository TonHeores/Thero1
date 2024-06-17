import { _decorator, Component, Node, director, game, Game } from 'cc';
import { SceneBase } from '../manager/SceneBase';
import { UIManager } from '../UIFrame/indexFrame';
import Constants from '../Constant';
import { GameRoot } from '../manager/GameRoot';
import PlatformMgr from '../platform/PlatformMgr';
const { ccclass, property } = _decorator;

@ccclass('LoginScene')
export class LoginScene extends SceneBase {
    onEnter(){
        GameRoot.Instance.showBg()
        console.log("LoginScene onEnter");
        PlatformMgr.getCurPlatForm().showLogin()
    }

    onExit(){
        console.log("LoginScene onExit");
    }


    start() {
    }
   

    update(deltaTime: number) {
        
    }
}

