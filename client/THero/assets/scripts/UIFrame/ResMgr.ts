import CocosHelper from "./CocosHelper";
import UIBase from "./UIBase";
import { EventCenter } from "./EventCenter";
import { js,log,Asset, Node,Prefab,_decorator, loader, assetManager, resources } from "cc";

/**
 * 资源加载, 针对的是Form
 * 首先将资源分为两类
 * 一种是在编辑器时将其拖上去图片, 这里将其称为静态图片, 
 * 一种是在代码中使用loader加载的图片, 这里将其称为动态图片
 * 
 * 对于静态资源
 * 1, 加载  在加载prefab时, cocos会将其依赖的图片一并加载, 所有不需要我们担心
 * 2, 释放  这里采用的引用计数的管理方法, 只需要调用destoryForm即可
 */
export default class ResMgr {
    private static instance: ResMgr = null;
    public static get inst() {
        if(this.instance === null) {
            this.instance = new ResMgr();
        }
        return this.instance;
    }
    /** 
     * 采用计数管理的办法, 管理form所依赖的资源
     */
    private staticDepends:{[key: string]: number} = js.createMap();
    private dynamicDepends:{[key: string]: number} = js.createMap();
    private tmpStaticDepends: Array<string> = [];

    // private _stubRes: {[type: string]: {[name: string]: Asset}} = {};
    // public addStub(res: Asset, type: typeof Asset) {
    //     let content = this._stubRes[type.name];
    //     if(!content) {
    //         content = this._stubRes[type.name] = {};
    //     }
    //     content[res.name] = res;
    // }
    // public getStubRes(resName: string, type: typeof Asset) {
    //     let content = this._stubRes[type.name];
    //     if(!content) {
    //         return null;
    //     }
    //     return content[resName];
    // }

    private _addTmpStaticDepends(completedCount: number, totalCount: number, item: any) {
        // this.tmpStaticDepends[this.tmpStaticDepends.length] = item.url;
        // if(this.staticDepends[item.url]) {
        //     this.staticDepends[item.url] ++;
        // }else {
        //     this.staticDepends[item.url] = 1;
        // }
    }

    private _clearTmpStaticDepends() {
        // for(let s of this.tmpStaticDepends) {
        //     if(!this.staticDepends[s] || this.staticDepends[s] === 0) continue;
        //     this.staticDepends[s] --;
        //     if(this.staticDepends[s] === 0) {
        //         delete this.staticDepends[s];           // 这里不清理缓存
        //     }
        // }
        // this.tmpStaticDepends = [];
    }

    /** 加载窗体 */
    public async loadForm(formName: string) {
        let form = await CocosHelper.loadResSync<Prefab>(formName, Prefab, this._addTmpStaticDepends.bind(this));
        this._clearTmpStaticDepends();
        let deps = assetManager.dependUtil.getDepsRecursively(form._uuid);
        this.addStaticDepends(deps);
        return form;
    }
    /** 销毁窗体 */
    public destoryForm(com: UIBase) {
        if(!com) {
           console.log("只支持销毁继承了UIBase的窗体!");
            return;
        }
        EventCenter.targetOff(com);
        // console.log("destoryForm formName="+com.name+" uuid="+com.node.uuid)
        // let deps = assetManager.dependUtil.getDepsRecursively(com.pre._uuid);
        // this.removeStaticDepends(deps);
        
        let deps = assetManager.dependUtil.getDepsRecursively(com.pre._uuid);
        this.removeStaticDepends(deps);
        assetManager.releaseAsset(com.pre)
        
        // let deps2 = assetManager.dependUtil.getDepsRecursively(com.node.uuid);
        // console.log(deps2)
        // this.removeStaticDepends(deps2);
        com.node.destroy();
    }

    /** 静态资源的计数管理 */
    public addStaticDepends(deps: Array<string>) {
        for(let s of deps) {
            if(this.staticDepends[s]) {
                this.staticDepends[s] += 1;
            }else {
                this.staticDepends[s] = 1;
            }
        }
    }

    public removeStaticDepends(deps: Array<string>) {
        for(let s of deps) {
            if(!this.staticDepends[s] || this.staticDepends[s] === 0) continue;
            this.staticDepends[s] --;
            if(this.staticDepends[s] === 0) {
                // 可以销毁
                loader.release(s);
                delete this.staticDepends[s];
            }
        }
        // console.log("removeStaticDepends len="+Object.values(this.staticDepends).length)
        // console.log(this.staticDepends)
    }

    /** 动态资源管理, 通过tag标记当前资源, 统一释放 */
    public async loadRes(url: string, type: typeof Asset,isDynamic=false) {
        let sources = await CocosHelper.loadResSync<Asset>(url, type);
        if(isDynamic&&sources){
            let tag = sources._uuid
            this.addDynamicRes(tag)
        }
        return sources;
    }

    public addDynamicRes(tag) {
        // console.log("addDynamicRes uuid="+tag)
        if(this.dynamicDepends[tag]) {
            this.dynamicDepends[tag] += 1;
        }else {
            this.dynamicDepends[tag] = 1;
        }
    }

    /** 销毁动态资源  没有做引用计数的处理 */
    public destoryDynamicRes(sources:Asset) {
        let tag = sources._uuid
        // console.log("destoryDynamicRes uuid="+tag)
        if(!this.dynamicDepends[tag]) {       // 销毁
            // console.log("destoryDynamicRes2")
            return false;
        }
        if(this.dynamicDepends[tag]){
            this.dynamicDepends[tag] --;
            if(this.dynamicDepends[tag] === 0) {
                // 可以销毁
                // console.log("destoryDynamicRes3")
                assetManager.releaseAsset(sources);
                delete this.dynamicDepends[tag];
            }

        }
        return true;
    }
    
}