import {FormType,ModalOpacity,UIState,SysDefine} from './config/SysDefine';
import { _decorator,Component } from "cc";
import {EventCenter}  from './EventCenter';
import ButtonPlus   from './Common/Components/ButtonPlus';
import SliderEx   from './Common/Components/SliderEx';
import UIListView   from './Common/Components/UIListView';
import UIListItem   from './Common/Components/UIListItem';
import ButtonDropdownList   from './Common/Components/ButtonDropdownList';
import UIManager  from './UIManager';
import UIBase  from './UIBase';
import Binder from './Binder'
import {CommonUtils} from './Common/Utils/CommonUtils'
import AdapterMgr,{AdaptaterType}  from './AdapterMgr';
import PomeloNetClient from './NetWork/pomelo/PomeloNetClient'


 function bindComp(clz) {
    return (target:Component, pKey: string) => {
        if(!target["bindNodes"]){
            target["bindNodes"] = {}
        }
        target["bindNodes"][pKey] = clz
    }
}


export {
    bindComp,
    EventCenter,
    ButtonPlus,
    SliderEx,
    UIManager,
    UIBase,
    ModalOpacity,
    FormType,
    UIState,
    SysDefine,
    Binder,
    AdapterMgr,
    AdaptaterType,
    CommonUtils,
    UIListView,
    UIListItem,
    ButtonDropdownList,
    PomeloNetClient
}
