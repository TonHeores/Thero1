import { _decorator, Prefab, Asset, error, resources, Material, Sprite, Node, Texture2D, ImageAsset, sp, assetManager, SpriteFrame, UITransform, SpriteAtlas, AnimationClip,Animation } from "cc";
import { AssetType, LoadCompleteCallback } from "./configuration";
import ResMgr from "./ResMgr";
const { ccclass } = _decorator;

declare global {
    namespace globalThis {
        var LZString: any;
    }
}

interface ITextAsset {
    text?: string;
    _file?: string;
    json?: string
}

@ccclass("resourceUtil")
export class resourceUtil {
    public static loadRes<T extends Asset>(url: string, type: AssetType<T> | null, cb?: LoadCompleteCallback<T>) {
        if (type) {
            resources.load(url, type, (err, res) => {
                if (err) {
                    error(err.message || err);
                    if (cb) {
                        cb(err, res);
                    }

                    return;
                }

                if (cb) {
                    cb(err, res);
                }
            });
        } else {
            resources.load(url, (err, res) => {
                if (err) {
                    error(err.message || err);
                    if (cb) {
                        cb(err, res as T);
                    }

                    return;
                }

                if (cb) {
                    cb(err, res as T);
                }
            });
        }
    }

    public static getTexture(path, cb: LoadCompleteCallback<Texture2D>) {
        this.loadRes(path, ImageAsset, (err, imageAsset: ImageAsset) => {
            if (err) {
                cb(err, null)
                return;
            }
            const texture = new Texture2D();
            texture.image = imageAsset;
            cb(null, texture)
        });
    }

    public static getAvatar(name: string, cb: LoadCompleteCallback<Prefab>) {
        this.loadRes(`prefab/avatar/avatar${name}`, Prefab, cb);
    }

    public static getPreb(path: string, cb: LoadCompleteCallback<Prefab>) {
        this.loadRes(`prefab/${path}`, Prefab, cb);
    }

    static async getPrebSync(path: string) {
        return new Promise((resolve, reject) => {
            this.loadRes(`prefab/${path}`, Prefab, (err, prefab) => {
                if (err) reject();
                resolve(prefab)
            });
        })
    }

    public static getMat(path: string, cb: LoadCompleteCallback<Material>) {
        this.loadRes(`mat/${path}`, Material, cb);
    }

    public static async unloadSkeNode(node: Node, isDynamic) {
        // console.log("unloadSkeNode")
        let sk = node.getComponent(sp.Skeleton)
        if (sk) {
            sk.paused = true
            sk.clearTracks()
            let data = sk.skeletonData

            sk.destroy()
            if (isDynamic) {
                ResMgr.inst.destoryDynamicRes(data)
            } else {
                assetManager.releaseAsset(data);
            }
            sk.skeletonData = null
        }
    }

    public static unloadSprite(node, isDynamic) {
        let sp: Sprite = node.getComponent(Sprite)
        if (sp && sp.spriteFrame) {
            if (isDynamic) {
                ResMgr.inst.destoryDynamicRes(sp.spriteFrame.texture)
            } else {
                assetManager.releaseAsset(sp.spriteFrame.texture);
                assetManager.releaseAsset(sp.spriteFrame);
            }
            sp.spriteFrame.texture = null
            sp.spriteFrame = null
        }
    }

    public static unloadNode(node: Node, isDynamic = true) {
        // console.log("unloadNode name="+node.name)
        resourceUtil.unloadSkeNode(node, true)
        resourceUtil.unloadSprite(node, isDynamic)
        node.children.forEach((child: Node) => {
            resourceUtil.unloadNode(child, isDynamic)
        });
    }

    public static unloadNodeSingle(node: Node, isDynamic = true) {
        resourceUtil.unloadSkeNode(node, true)
        resourceUtil.unloadSprite(node, isDynamic)
    }

    public static async setMapNodeImg(imgUrl: string, node: Node, cb = null, isDynamic, resize = false) {
        (node as any).imgUrl = imgUrl;

        let spriteData = await ResMgr.inst.loadRes(imgUrl, Asset, false) as ImageAsset;
        if (spriteData == null) {
            cb(1, imgUrl)
        } else {
            if (!node || node.components == undefined || imgUrl != (node as any).imgUrl) {
                cb(2, imgUrl);
                return;
            }
            const texture2 = new Texture2D();
            texture2.image = spriteData;
            texture2.setWrapMode(2, 2, 2)
            let uuid = spriteData._uuid
            texture2._uuid = uuid
            ResMgr.inst.addDynamicRes(uuid)
            let a = new SpriteFrame();
            a.texture = texture2;

            if (resize) {
                node.getComponent(UITransform).width = texture2.width
                node.getComponent(UITransform).height = texture2.height
            }

            node.active = true;
            let sp = node.getComponent(Sprite)
            if (sp == null) {
                sp = node.addComponent(Sprite)
            }
            sp.spriteFrame = a;

            if (cb) {
                cb(0, imgUrl, texture2);
            }
        }
    }

    public static async setNodeImg(imgUrl: string, node: Node, cb = null, isDynamic = true, resize = false) {
        (node as any).imgUrl = imgUrl;
        // this.unloadNodeSingle(node,isDynamic)
        let spriteData = await ResMgr.inst.loadRes(imgUrl + "/texture", Asset, false) as Texture2D;
        if (spriteData == null) {
            cb && cb(1)
        } else {
            if (!node || node.components == undefined || imgUrl != (node as any).imgUrl) {
                cb && cb(2);
                return;
            }
            let uuid = spriteData._uuid
            if (isDynamic) {
                ResMgr.inst.addDynamicRes(uuid)
            }
            let a = new SpriteFrame();
            a.texture = spriteData

            if (resize) {
                node.getComponent(UITransform).width = spriteData.width
                node.getComponent(UITransform).height = spriteData.height
            }
            node.active = true;
            let sp = node.getComponent(Sprite)
            if (sp == null) {
                sp = node.addComponent(Sprite)
            }
            sp.spriteFrame = a;
            if (cb) {
                cb(0, spriteData);
            }
        }
    }

    public static async setNodeSpine(spineUrl: string, node: Node, cb, isDynamic) {
        (node as any).spineUrl = spineUrl;
        let url = "spine/" + spineUrl
        let skeletonData = await ResMgr.inst.loadRes(url, sp.SkeletonData, isDynamic) as sp.SkeletonData;
        if (!node || node.components == undefined || spineUrl != (node as any).spineUrl) {
            cb(1)
            return;
        }
        let sk = node.getComponent(sp.Skeleton);
        if (!sk) {
            sk = node.addComponent(sp.Skeleton);
        }
        // node.getComponent(sp.Skeleton).skeletonData = skeletonData;
        sk.skeletonData = skeletonData;
        cb(0);
    }

    public static atlasDic = {}
    public static async setNodeImgFromAtlas(plistUrl: string, imgUrl: string, node: Node, cb = null, isDynamic = false) {
        // let plist:SpriteAtlas = resourceUtil.atlasDic[plistUrl]
        // if(!plist) {
        //     console.log("noplist")
        //     plist = await ResMgr.inst.loadRes(plistUrl,SpriteAtlas,false) as SpriteAtlas;
        //     resourceUtil.atlasDic[plistUrl] = plist
        // }
        let plist = await ResMgr.inst.loadRes(plistUrl, SpriteAtlas, false) as SpriteAtlas;
        let sp = plist.getSpriteFrame(imgUrl)
        node.active = true;
        let oldSP = node.getComponent(Sprite).spriteFrame
        if (oldSP) {
            sp.insetTop = oldSP.insetTop;
            sp.insetLeft = oldSP.insetLeft;
            sp.insetRight = oldSP.insetRight;
            sp.insetBottom = oldSP.insetBottom;
        } else {
            sp.insetTop = 0;
            sp.insetLeft = 0;
            sp.insetRight = 0;
            sp.insetBottom = 0;
        }

        node.getComponent(Sprite).spriteFrame = sp;
        if (cb) {
            cb();
        }
    }
    public static clearAllAtlas() {
        console.log("clearAllAtlas=================")
        Object.values(resourceUtil.atlasDic).map((element) => {
            let als = element as SpriteAtlas
            assetManager.releaseAsset(als);
        });
        resourceUtil.atlasDic = {}
    }

    public static async loadAniFromAtlas(plistUrl: string, animation:Animation,aniName,wrapMode:AnimationClip.WrapMode,sampleNum, cb = null) {
        let plist = await ResMgr.inst.loadRes(plistUrl, SpriteAtlas, false) as SpriteAtlas;
        var spriteFrames = plist.getSpriteFrames();
        var clip = AnimationClip.createWithSpriteFrames(spriteFrames, sampleNum);
        clip.name = aniName;
        // clip.wrapMode = AnimationClip.WrapMode.Loop;
        clip.wrapMode = wrapMode;

        animation.addClip(clip);
        // animation.play('run');
        if (cb) {
            cb(aniName);
        }
    }
}
