import { tween, Asset,Node, Tween, Component,error,loader,Animation,AnimationClip, resources, Vec3} from "cc";
import { SysDefine } from "./config/SysDefine";
export class LoadProgress {
    public url: string;
    public completedCount: number;
    public totalCount: number;
    public item: any;
    public cb?: Function;
}

/** 一些cocos api 的封装, promise函数统一加上sync后缀 */
export default class CocosHelper {

    /** 加载进度 */
    public static loadProgress = new LoadProgress();

    /** 等待时间, 秒为单位 */
    public static sleepSync = function(time: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(true);
            }, time * 1000);
        });
    }

    /**
     * 
     * @param target 
     * @param repeat -1，表示永久执行
     * @param tweens 
     */
    public static async runRepeatTweenSync(target: any, repeat: number, ...tweens: Tween<Component>[]) {
        return new Promise((resolve, reject) => {
            let selfTween = tween(target);
            for(const tmpTween of tweens) {
                selfTween = selfTween.then(tmpTween);
            }
            if(repeat < 0) {
                tween(target).repeatForever(selfTween).start();
            }else {
                tween(target).repeat(repeat, selfTween).start();
            }
        });   
    }
    /** 同步的tween */
    public static async runTweenBezierSync(target: any, [x1, x2, y1, y2, e1], toPos): Promise<void> {
        return new Promise((resolve, reject) => {
            var startPos = target.position;
            var startAngle = target.eulerAngles;
            var fruitTween = tween(startPos);
            const mixY = y1;
            const maxY = y2;
            const mixX = x1;
            const maxX = x2;
            var progressX = function (start, end, current, t) {
                //@ts-ignore
                current = cc.bezier(start, mixX, maxX, end, t);
                return current;
            };
            var progressY = function (start, end, current, t) {
                //@ts-ignore
                current = cc.bezier(start, mixY, maxY, end, t);
                return current;
            };

            fruitTween.parallel(
                tween().to( 0.7, {x: toPos.x}, {progress: progressX, easing: "smooth", onUpdate: ()=>{
                    target.setPosition(startPos);
                }}),
                tween().to( 0.7, {y: toPos.y}, { progress: progressY, easing: "smooth", onUpdate: ()=>{
                    target.setPosition(startPos);
                }}),
            ).start();

            tween(startAngle).to( 0.7, {z: e1}, {easing: "smooth", onUpdate: ()=>{
                target.eulerAngles = startAngle;
            }}).start();

            // let selfTween = tween(target);
            
            // for(const tmpTween of tweens) {
            //     // console.log(tmpTween)
            //     selfTween = selfTween.then(tmpTween);
            // }
            // selfTween.call(() => {
            //     resolve();
            // }).start();
        });
    }
    /** 同步的tween */
    public static async runTweenSync(target: any, ...tweens: Tween<Component>[]): Promise<void> {
        return new Promise((resolve, reject) => {
            let selfTween = tween(target);
            
            for(const tmpTween of tweens) {
                // console.log(tmpTween)
                selfTween = selfTween.then(tmpTween);
            }
            selfTween.call(() => {
                resolve();
            }).start();
        });
    }
    /** 停止tween */
    public stopTween(target: any) {
        Tween.stopAllByTarget(target);
    }
    public stopTweenByTag(tag: number) {
        Tween.stopAllByTag(tag);
    }

    /** 同步的动画 */
    public static async runAnimSync(node: Node, animName?: string | number) {
        let anim = node.getComponent(Animation);
        if(!anim) return ;
        let clip: AnimationClip = null;
        if(!animName) clip = anim.defaultClip;
        else {
            let clips = anim.clips;
            if(typeof(animName) === "number") {
                clip = clips[animName];
            }else if(typeof(animName) === "string") {
                for(let i=0; i<clips.length; i++) {
                    if(clips[i].name === animName) {
                        clip = clips[i];
                        break;
                    }
                }
            }   
        }
        if(!clip) return ;
        await CocosHelper.sleepSync(clip.duration);
    }

    /** 加载资源异常时抛出错误 */
    public static loadResThrowErrorSync<T>(url: string, type: typeof Asset, progressCallback?: (completedCount: number, totalCount: number, item: any) => void): Promise<T> {
        return null;
    }

    private static _loadingMap: {[key: string]: Function[]} = {};
    public static async loadRes<T>(url: string, type: typeof Asset, callback: Function ) {
        if(this._loadingMap[url]) {
            this._loadingMap[url].push(callback);
            return ;
        }
        this._loadingMap[url] = [callback];
        this.loadResSync<T>(url, type).then((data: any) => {
            let arr = this._loadingMap[url];
            for(const func of arr) {
                func(data);
            }
            this._loadingMap[url] = null;
            delete this._loadingMap[url];
        });
    }
    /** 加载资源 */
    public static loadResSync<T>(url: string, type: typeof Asset, progressCallback?: (completedCount: number, totalCount: number, item: any) => void): Promise<T>{
        if (!url || !type) {
            error("参数错误", url, type);
            return;
        }
        CocosHelper.loadProgress.url = url;
        if(progressCallback) {
            this.loadProgress.cb = progressCallback;
        }
        return new Promise((resolve, reject) => {
            resources.load(url, type, this._progressCallback, (err, asset) => {
                if (err) {
                    error(`${url} [资源加载] 错误 ${err}`);
                    resolve(null);
                }else {
                    resolve(asset as any);
                }
                // 加载完毕了，清理进度数据
                CocosHelper.loadProgress.url = '';
                CocosHelper.loadProgress.completedCount = 0;
                CocosHelper.loadProgress.totalCount = 0;
                CocosHelper.loadProgress.item = null;
                CocosHelper.loadProgress.cb = null;
            });
        });
    }
    /** 
     * 加载进度
     * cb方法 其实目的是可以将loader方法的progress
     */
    private static _progressCallback(completedCount: number, totalCount: number, item: any) {
        CocosHelper.loadProgress.completedCount = completedCount;
        CocosHelper.loadProgress.totalCount = totalCount;
        CocosHelper.loadProgress.item = item;
        CocosHelper.loadProgress.cb && CocosHelper.loadProgress.cb(completedCount, totalCount, item);
    }
    /**
     * 寻找子节点
     */
    public static findChildInNode(nodeName: string, rootNode: Node): Node {
        if(rootNode.name == nodeName) {
            return rootNode;
        }
        for(let i=0; i<rootNode.children.length; i++) {
            let node = this.findChildInNode(nodeName, rootNode.children[i]);
            if(node) {
                return node;
            }
        }
        return null;
    }
    /** 获得Component的类名 */
    public static getComponentName(com) {
        let arr = com.name.match(/<.*>$/);
        if(arr && arr.length > 0) {
            return arr[0].slice(1, -1);
        }
        return com.name;
    }

    /** 释放资源 */
    public static releaseAsset(assets: Asset | Asset[]) {
        this.decRes(assets);
    }
    /** 增加引用计数 */
    private static addRef(assets: Asset | Asset[]) {
        if(assets instanceof Array) {
            for(const a of assets) {
                a.addRef();
            }
        }else {
            assets.addRef();
        }
    }
    /** 减少引用计数, 当引用计数减少到0时,会自动销毁 */
    private static decRes(assets: Asset | Asset[]) {
        if(assets instanceof Array) {
            for(const a of assets) {
                a.decRef();
            }
        }else {
            assets.decRef();
        }
    }




}

