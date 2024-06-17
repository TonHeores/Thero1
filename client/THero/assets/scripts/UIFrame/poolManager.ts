// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { _decorator, Prefab, Node, instantiate, NodePool, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("poolManager")
export class poolManager {
    // dictPool: { [name: string]: NodePool }= {}
    dictPool: { [name: string]: Array<Node> }= {}
    dictPrefab: { [name: string]: Prefab } = {}

    static _instance: poolManager;

    static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new poolManager();
        return this._instance;
    }

    reset(){
        this.dictPool = {}
        this.dictPrefab = {}
    }
    
    getNode (prefab: Prefab, parent: Node) {
        let name = prefab.data.name;
        this.dictPrefab[name] = prefab;
        let node: Node;
        if (this.dictPool.hasOwnProperty(name)) {
            //已有对应的对象池
            let pool = this.dictPool[name];
            if (pool.length > 0) {
                node = pool.pop();
            } else {
                node = instantiate(prefab);
            }
            // if (pool.size() > 0) {
            //     node = pool.get()!;
            // } else {
            //     node = instantiate(prefab);
            // }
        } else {
            //没有对应对象池，创建他！
            // let pool = new NodePool();
            let pool = new Array()
            this.dictPool[name] = pool;

            node = instantiate(prefab);
        }

        // node.active = true
        // node.scale = new Vec3(1,1,1)
        node.removeFromParent()
        node.parent = parent;
        return node;
    }

    /**
     * 将对应节点放回对象池中
     */
    putNode (node: Node) {
        let name = node.name;
        let pool = null;
        if (this.dictPool.hasOwnProperty(name)) {
            //已有对应的对象池
            pool = this.dictPool[name];
        } else {
            //没有对应对象池，创建他
            // pool = new NodePool();
            pool = new Array()
            this.dictPool[name] = pool;
        }
        node.position = new Vec3(-1000000,-1000000,-1000000)
        pool.push(node)
    }

    /**
     * 根据名称，清除对应对象池
     */
    clearPool (name: string) {
        if (this.dictPool.hasOwnProperty(name)) {
            let pool = this.dictPool[name];
            // pool.clear();
            if(pool&&pool.length>0){
                pool.forEach(element => {
                    element.removeFromParent()
                });
            }
            pool = new Array()
        }
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
