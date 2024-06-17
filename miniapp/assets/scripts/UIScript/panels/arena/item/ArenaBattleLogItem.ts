import { _decorator, Component, Node } from 'cc';
import { bindComp, ButtonPlus, UIListItem } from '../../../../UIFrame/indexFrame';
const { ccclass, property } = _decorator;

@ccclass('ArenaBattleLogItem')
export class ArenaBattleLogItem extends UIListItem {

    @bindComp("cc.Node")
    public playerName: Node = null;
    @bindComp("cc.Node")
    public time: Node = null;
    @bindComp("cc.Node")
    public score: Node = null;
    @bindComp("ButtonPlus")
    public palybackBtn: ButtonPlus = null;

    protected dataChanged(){

    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}


