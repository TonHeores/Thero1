
import {
    Slider,
    _decorator,
    Node,
    Widget,
    EventTouch,
    UITransform
  } from "cc";
const {ccclass, property} = _decorator;
@ccclass
export default class SliderEx extends Slider {
    @property(Node)
    nodeProgress: Node = null;
    private _dragging = false;
    private _handleDragStart: (progress: number) => void = null;
    private _handleDragMove: (progress: number) => void = null;
    private _handleDragEnd: (progress: number) => void = null;

     __preload() {
        super.__preload();

        let widget = this.node.getComponent(Widget);
        if (widget) {
            widget.updateAlignment();
        }
    }

     _onHandleDragStart(event: EventTouch) {
        super._onHandleDragStart(event);

        if (this._handleDragStart) {
            this._handleDragStart(this.progress);
        }
    }

     _onTouchBegan(event) {
        if (!this.handle) { return; }

        super._onTouchBegan(event);

        this.handleTouchEvent(this._handleDragStart);
    }

     _onTouchMoved(event) {
        if (!this.handle) { return; }

        super._onTouchMoved(event);

        this.handleTouchEvent(this._handleDragMove);
    }

     _onTouchEnded(event) {
        super._onTouchEnded(event);

        this.handleTouchEvent(this._handleDragEnd);
    }

     _onTouchCancelled(event) {
        super._onTouchCancelled(event);

        this.handleTouchEvent(this._handleDragEnd);
    }

     _updateHandlePosition() {
        if (!this.handle) { return; }

        super._updateHandlePosition();

        this.nodeProgress.getComponent(UITransform).width = this.node.getComponent(UITransform).width * this.progress;
    }

     handleTouchEvent(callback: (progress: number) => void) {
        this.nodeProgress.getComponent(UITransform).width = this.node.getComponent(UITransform).width * this.progress;
        if (callback) {
            callback(this.progress);
        }
    }

    /**
     * 拖拽开始事件回调
     * @param callback 
     */
    handleDragStart(callback: (progress: number) => void) {
        this._handleDragStart = callback;
    }

    /**
    * 拖拽中事件回调
    * @param callback 
    */
    handleDragMove(callback: (progress: number) => void) {
        this._handleDragMove = callback;
    }

    /**
    * 拖拽结束事件回调
    * @param callback 
    */
    handleDragEnd(callback: (progress: number) => void) {
        this._handleDragEnd = callback;
    }

    /**
     * 设置进度
     * @param value 
     */
    setProgress(value: number) {
        if (!this._dragging) {
            this.progress = value;
            this.nodeProgress.getComponent(UITransform).width = this.node.getComponent(UITransform).width * value;
        }
    }
}