import {
    _decorator,
    Component,
    Node,
    log,
  } from "cc";

/*
 * 
 * 在用脚本控制UI的时候, 绑定UI是一件很烦人的事情, 尤其是将UI拖到面板上绑定, 就更加繁琐, 
 * 或者在onload, start上 使用getChildByName() 或者cc.find() 查找结点, 又会显得代码冗长
 *  在取名字的时候,通过特殊的命名规则, 就可以在脚本中直接使用此结点,  Binder就来完成此功能
 */

class Binder {
    // 绑定组件
    public bindComponent(component: Component) {
        this._bindSubNode(component.node, component);
    }
    
    // 绑定子节点
    private _bindSubNode(node: Node, component: Component) {
        
        // 检测前缀是否符合绑定规范
        let name = node.name;
        let bindNodes = component["bindNodes"]
        for (let key in bindNodes) {
            let typeName = bindNodes[key].replace('_',".")
            if(key == name){
                let pro = component[`${name}`]
                if(pro != null){
                   console.log(`${name} 已经被绑定了, 请检查您是否出现了重名的情况!`);
                }
                if(typeName === 'cc.Node') {
                    component[`${name}`] = node;
                }else {
                    component[`${name}`] = node.getComponent(typeName);
                }  
            }
        }        
        // 绑定子节点
        node.children.forEach((target: Node) => {
            this._bindSubNode(target, component);
        }); 
    }
}
export default new Binder();