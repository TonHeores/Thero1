import { _decorator, Component, Node,find } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SceneBase')
export class SceneBase extends Component {

    onEnter(){
        console.log("SceneBase onEnter")
    }

    onExit(){
        console.log("SceneBase onExit")
    }
}

