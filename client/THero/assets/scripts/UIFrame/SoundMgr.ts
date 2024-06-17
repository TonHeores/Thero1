import CocosHelper from "./CocosHelper";
import { SysDefine } from "./config/SysDefine";
import { _decorator, Component, AudioClip, find, js, game, Game, AudioSource, ImageAsset } from "cc";
const { ccclass } = _decorator;

@ccclass
export default class SoundMgr extends Component {

    private audioCache: {[key: string]: AudioClip} = js.createMap();

    public static _inst: SoundMgr = null;                     // 单例
    public static get inst(): SoundMgr {
        if(this._inst == null) {
            this._inst = find(SysDefine.SYS_UIROOT_NAME).addComponent<SoundMgr>(this);
        }
        return this._inst;
    }

    private currMusicName: string = "";
    private _musicSource: AudioSource;
    private _effectSource: AudioSource;
    private soundFolder = "sound/"
    onLoad () {
        this._musicSource = new AudioSource()
        this._effectSource = new AudioSource()
        let volume = this.getVolumeToLocal();
        if(volume) {
            this.volume = volume;
        }else {
            this.volume.musicVolume = 1;
            this.volume.effectVolume = 1;
        }
        this.setVolumeToLocal();

        game.on(Game.EVENT_HIDE, () => {
            this._musicSource.pause()
            this._effectSource.pause()
        }, this);
        game.on(Game.EVENT_SHOW,() => {
            this._musicSource.play()
            this._effectSource.play()
        }, this);
    }
    /** volume */
    private volume: Volume = new Volume();
    getVolume() {
        return this.volume;
    }

    start () {

    }
    /**  */
    public setMusicVolume(musicVolume: number) {
        this.volume.musicVolume = musicVolume;
        this.setVolumeToLocal();
    }
    public setEffectVolume(effectVolume: number) {
        this.volume.effectVolume = effectVolume;
        this.setVolumeToLocal();
    }
    /** 播放背景音乐 */
    public async playMusic(url: string, loop = true) {
        if(!url || url === '') return ;
        url = this.soundFolder + url
        if(this.currMusicName  === url) return ; //重复播放
        
        this.currMusicName = url
        if(this.audioCache[url] == null) {
            let sound = await CocosHelper.loadResSync<AudioClip>(url, AudioClip);
            this.audioCache[url] = sound;
        }
        
        this._musicSource.stop()
        this._musicSource.clip = null
        this._musicSource.clip = this.audioCache[url]
        this._musicSource.loop = loop
        this._musicSource.play()
    }
    public stopMusic(){
        this._musicSource.stop()
        this._musicSource.clip = null
    }
    reset(){
        this._musicSource.stop()
        this._musicSource.clip = null
        this._effectSource.stop()
        this._effectSource.clip = null
        this.audioCache = js.createMap();
    }
    /** 播放音效 */
    public async playEffect(url: string, loop = false) {
        if(!url || url === '') return ;
        url = this.soundFolder + url
        
        if(this.audioCache[url] == null ) {
            let sound = await CocosHelper.loadResSync<AudioClip>(url, AudioClip);
            this.audioCache[url] = sound;
        }
        
        this._effectSource.clip = this.audioCache[url]
        this._effectSource.loop = loop
        this._effectSource.play()
    }

    /** 从本地读取 */
    private getVolumeToLocal() {
        let objStr = localStorage.getItem("Volume_For_Creator");
        if(!objStr) {
            return null;
        }
        return JSON.parse(objStr);
    }
    /** 设置音量 */
    private setVolumeToLocal() {
        this._musicSource.volume = this.volume.musicVolume
        this._effectSource.volume = this.volume.effectVolume

        localStorage.setItem("Volume_For_Creator", JSON.stringify(this.volume));
    }

    // public setEffectActive(active: boolean, id: number = -1) {
    //     if(active) {
    //         this._musicSource.stop()
    //         this._effectSource.stop()
    //     }else {
    //         this._musicSource.play()
    //         this._effectSource.play()
    //     }
    // }

    // update (dt) {}
}

class Volume {
    musicVolume: number;
    effectVolume: number;
}