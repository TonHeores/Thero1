import { _decorator, Component, Node, director, game, Game } from 'cc';
import { SceneBase } from '../manager/SceneBase';
import { UIManager } from '../UIFrame/indexFrame';
import Constants from '../Constant';
import { Ext } from '../utils/indexUtils';
const { ccclass, property } = _decorator;

@ccclass('LoginScene')
export class LoginScene extends SceneBase {
    onEnter(){
        console.log("LoginScene onEnter");
        UIManager.closeView(Constants.Panels.UILoadingScene);
        UIManager.openView(Constants.Panels.UITestLogin);
    }

    onExit(){
        console.log("LoginScene onExit");
    }


    start() {
    }
   

    update(deltaTime: number) {
        
    }
}

