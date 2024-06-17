import { _decorator, Component, Node, director, game, Game } from 'cc';
import { SceneBase } from '../manager/SceneBase';
import { UIManager } from '../UIFrame/indexFrame';
import Constants from '../Constant';
const { ccclass, property } = _decorator;

@ccclass('MainScene')
export class MainScene extends SceneBase {
    onEnter(){
        console.log("MainScene onEnter");
        UIManager.openView(Constants.Panels.UIMainMenu);
    }

    onExit(){
        console.log("MainScene onExit");
    }

    start() {
    }

    update(deltaTime: number) {
        
    }
}

