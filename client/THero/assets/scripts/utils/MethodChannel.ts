/*
 * @Author: Allan
 * @Date: 2022-04-11 15:24:19
 * @Describe: 原生通信
 */

export type Methods = "login";
export type Handler = (arg?: string) => void;

class MethodChannel {
    // constructor() {
    //     if (globalThis.jsb) {
    //         globalThis.jsb.bridge.onNative = this.handler.bind(this);
    //     }
    // }

    // // 事件
    // private events = new Map<Methods, Handler[]>();

    // // 事件处理
    // public handler(method: Methods, arg: string) {
    //     const handlers = this.events.get(method);
    
    //     if (handlers) {
    //         handlers.forEach((callback) => {
    //             callback(arg);
    //         });
    //     }
    // }

    // // 监听
    // on(method: Methods, callback: Handler) {
    //     const handler = this.events.get(method);

    //     if (handler) {
    //         handler.push(callback);
    //     } else {
    //         this.events.set(method, [callback]);
    //     }
    // }

    // // 调用原生
    // call(method: string, ...args) {
    //     if (globalThis.jsb) {
    //         globalThis.jsb.bridge.sendToNative.apply(globalThis.jsb, [method, ...args]);
    //     }
    // }
}

export default new MethodChannel();
