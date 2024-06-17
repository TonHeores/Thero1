/** 事件 */
export class EventHandler {
    callback: Function;
    target: Object;
    once: boolean;

    constructor(callback: Function, target: Object, once: boolean) {
        this.callback = callback;
        this.target = target;
        this.once = once;
    }
}