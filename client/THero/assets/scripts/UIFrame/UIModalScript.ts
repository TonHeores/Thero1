import UIManager from "./UIManager";
import { ModalOpacity } from "./config/SysDefine";
import CocosHelper from "./CocosHelper";
import { Component,Texture2D,view,Color, Node,ImageAsset,_decorator, Sprite,tween, UITransform,Button,SpriteFrame, UIOpacity, resources, Layers } from "cc";
import { resourceUtil } from "./resourceUtil";

/**
 * @Author: 邓朗 
 * @Describe: modal
 * @Date: 2019-05-30 23:35:26  
 * @Last Modified time: 2019-05-30 23:35:26 
 */
const {ccclass, property} = _decorator;

@ccclass
export default class UIModalScript extends Component {

    public uid: string;
    /** 代码创建一个单色texture */
    private _texture: Texture2D = null;
    private async getSingleTexture() {
        if(this._texture) return this._texture;
        this._texture = await this.loadTexture("texture/ui/default_sprite_splash")
        // this._texture = this.genTexture(2,2)
        return this._texture;
    }

    loadTexture(url){
        return new Promise<Texture2D>(resolve=>{
            resources.load(url, ImageAsset, (err, res:ImageAsset) => {
                if (err) {
                    console.error(err.message || err);
                    resolve(null)
                    return;
                }
                const texture = new Texture2D();
                texture.image = res;
                resolve(texture)
            });
        });
    }

    genTexture (width:number, height: number, color: Color = new Color(255, 255, 255, 255)) {
        const data: any = new Uint8Array(width * height * 4)
        for (let i = 0; i < width; i++) {
          for (let j = 0; j < height; j++) {
            //R
            data[i * width * 4 + j * 4] = color.r;
            //G
            data[i * width * 4 + j * 4 + 1] = color.g;
            //B
            data[i * width * 4 + j * 4 + 2] = color.b;
            //A
            data[i * width * 4 + j * 4 + 3] = color.a;
          }
        }
    
        const image = new ImageAsset();
        image.reset({
            _data: data,
            _compressed: false,
            width: width, 
            height: height,
            format: Texture2D.PixelFormat.RGBA8888
        });

        const texture = new Texture2D()
        texture.image = image;

        return texture;
    }

    /**
     * 初始化
     */
    public async init() {
        let maskTexture = await this.getSingleTexture();
        this.onResize()
        this.node.layer = Layers.Enum.UI_2D
        this.node.addComponent(Button);
        this.node.on('click', this.clickMaskWindow, this);
        
        let sprite = this.node.addComponent(Sprite)
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        let a =  new SpriteFrame()
        a.texture = maskTexture
        sprite.spriteFrame = a;
        sprite.color = new Color(0, 0, 0);
        this.node.getComponent(UIOpacity).opacity = 0;
        this.node.active = true;
    }

    public onResize(){
        let size = view.getVisibleSize();
        let trans = this.node.addComponent(UITransform)
        trans.height = size.height;
        trans.width = size.width;
    }

    // 
    public async showModal(lucenyType: number, time: number = 0.6, isEasing: boolean = true) {
        let o = 0;
        switch (lucenyType) {
            case ModalOpacity.None:    
                this.node.active = false;
            break;        
            case ModalOpacity.OpacityZero:   
                o = 0;
            break;
            case ModalOpacity.OpacityLow:    
                o = 63;
            break;
            case ModalOpacity.OpacityHalf:   
                o = 126;
            break;
            case ModalOpacity.OpacityHigh:
                o = 200;
            break;
            case ModalOpacity.OpacityFull:
                o = 255;
            break;
        }
        if(!this.node.active) return ;
        if(isEasing) {
            await CocosHelper.runTweenSync(this.node.getComponent(UIOpacity), tween().to(time, {opacity: o}));
        }else {
            this.node.getComponent(UIOpacity).opacity = o;
        }
    }

    public async clickMaskWindow() {
        let com = UIManager.getInstance().getComponentByUid(this.uid);
        if(com && com.maskType.clickMaskClose) {
           await UIManager.getInstance().closeUIForm(this.uid);
        }
    }
}