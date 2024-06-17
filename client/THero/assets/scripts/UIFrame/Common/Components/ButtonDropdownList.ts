
import {_decorator,Button,Event,Component,SpriteFrame,Size,Sprite,Font,instantiate,Node,ScrollView,Label,find, Vec3,director, Vec2
,CCInteger,size,isValid,tween,screen,CCString,CCBoolean,
UITransform,
UIOpacity} from "cc";
const {ccclass, property} = _decorator;
@ccclass
export default class ButtonDropdownList extends Component {
    buttonList = []
    ctor() {
        this.buttonList = [];
    }

    Events= {
        SELECTTION_CHANGED: "1", // 选项变更事件
    } 
    @property(Node)
    optionButtonTemplate: Node = null    // 选项按钮模板(Button)
    multiButtonTemplate:Node = null              // 多種選擇按鈕
    @property(Node)
    titleButtonTemplate:Node = null 
    @property(Node)
    selectedOptionButtonTemplate:Node = null 
    @property(CCString)
    placeHolder= ''                   // 当placeholder为空的时候，默认选项为列表第一个
    @property(CCBoolean)
    isUp= false          // 选项显示在上面
    @property(CCBoolean)
    hideSelectedOption= false          // 打开列表的时候，当前选中的选项是否在列表中显示
    @property(CCInteger)
    paddingLeftAndRight= 5             // 下拉框两侧边距
    @property(CCInteger)
    paddingTopAndBottom= 5             // 下拉框上下边距
    @property(CCInteger)
    spacingY= 3                        // 选项之间间隙
    @property(CCInteger)
    marginTop= 0                       // 下拉列表距标题按钮距离
    @property(CCInteger)
    itemMarginTop= 0                       // 列表中item的marginTop
    @property(CCInteger)
    maxListHeight= 0                   // 列表限高
    @property(SpriteFrame)
    listBackground: SpriteFrame  = null    // 下拉列表背景图片
    @property(Size)
    optionButtonSize: Size = new Size(0,0)          // 下来选项按钮大小
    @property(Sprite)
    mask: Sprite     = null              // 遮罩
    @property(Node)
    titleContainer: Node = null            // 头部选项容器
    @property(Node)
    listBacgroundNode: Node = null        // 下拉选项背景节点
    @property(Node)
    listContent: Node  = null             // 下拉列表内容容器 scrollview
    @property(Font)
    font:Font = null 

        _foldFlg= true                     // 列表是否展开标识
        _selectionChangedHandler= null     // 选项变更事件
        _itemRenderHandler= null     // 选项变更事件
        _handlerThisObj= null              // 选项变更事件this对象
        _optionDataList= null              // 选项数据队列
        _optionSecDataList= null           // 二級选项数据队列
        _initialized= false                // 初始化完成
        _content= null                     // 列表滚动区域
        _selectedKey = ''                    // 下拉列表当前选项
        _preSelectedKey= ''                // 預選擇鍵

        _hideMap= null                   // 下拉二级列表当前选项
        _secSelectedKey= ''                    // 下拉二级列表当前选项
        _selectMultiMap={}      // 多選材單Map
        secListBackgroundNode = null            // 二级菜单 背景
        secListContent = null              // 二级菜单 content
        _isComMenu= false                    // 是否有二级菜单
        _isMultiSelect= false                   // 是否有多選菜單
        _secContent = null                   // 二级菜单
        _maxMultiCount = 5

    /**
     * 通过初始化方法传参的方式，初始化控件，建议在画面的onLoad方法中调用，
     * 相比在creator界面中设置参数，这种方式更易维护，不会因为与预制体控件保持同步而导致配置丢失或者重置。
     * @param {Prefab} optionButtonTemplate 选项按钮模板(Button)
     * @param {{placeHolder?: String, 
        hideSelectedOption?: Boolean,
        paddingLeftAndRight?: Number,
        paddingTopAndBottom?: Number,
        spacingY?: Number,
        marginTop?: Number,
        maxListHeight?: Number,
        listBackground?: SpriteFrame,
        optionButtonSize?: Size,
        }} options

     *  placeHolder: 当placeholder为空的时候，默认选项为列表第一个
        hideSelectedOption: 打开列表的时候，当前选中的选项是否在列表中显示
        paddingLeftAndRight: 下拉框两侧边距 默认为5
        paddingTopAndBottom: 下拉框上下边距 默认为5
        spacingY: 选项之间间隙 默认为3
        marginTop: 下拉列表距标题按钮距离 默认为0
        maxListHeight: 列表限高 默认为0：不限制高度
        listBackground: 下拉列表背景图片
        optionButtonSize: 下来选项按钮大小
     * @param {Prefab} titleButtonTemplate   头部按钮模板(Button)，如果不设置，默认使用optionButtonTemplate
     * @param {Prefab} selectedOptionButtonTemplate  列表中选中的按钮模板(Button)，如果不设置，默认使用optionButtonTemplate,
     * 只有当 hideSelectedOption = false 的时候有效
     */
    initDropdownList(isComMenu = false, isMultiSelect = false,optionButtonTemplate=null, options=null, titleButtonTemplate=null, selectedOptionButtonTemplate=null) {
        this.optionButtonTemplate = optionButtonTemplate || this.optionButtonTemplate
        this.titleButtonTemplate = titleButtonTemplate || this.titleButtonTemplate;
        this.selectedOptionButtonTemplate = selectedOptionButtonTemplate || this.selectedOptionButtonTemplate;
    
        this.optionButtonSize = this.optionButtonTemplate.getComponent(UITransform).contentSize
        this.optionButtonTemplate.removeFromParent()
        this.titleButtonTemplate&&this.titleButtonTemplate.removeFromParent()
        this.selectedOptionButtonTemplate.removeFromParent()

        this._isMultiSelect = isMultiSelect;
        if(this.listContent.getComponent(UIOpacity)==null){
            this.listContent.addComponent(UIOpacity)
        }

        if(isComMenu) {
            this._isComMenu = isComMenu;

            this.secListContent = instantiate(this.listContent);
            this.listContent.parent.addChild(this.secListContent);

            this.secListBackgroundNode = instantiate(this.listBacgroundNode);
            this.secListBackgroundNode.parent = null;
            // this.listBacgroundNode.parent.addChild(this.secListBackgroundNode);
            this.secListBackgroundNode.getComponent(Sprite).enabled = true;

            this._secContent = this.secListContent.getComponent(ScrollView).content;
        }

        if (options) {
            this.placeHolder = !!options.placeHolder ? options.placeHolder : this.placeHolder;
            this.paddingLeftAndRight = options.paddingLeftAndRight === undefined ? this.paddingLeftAndRight : options.paddingLeftAndRight;
            this.paddingTopAndBottom = options.paddingTopAndBottom === undefined ? this.paddingTopAndBottom : options.paddingTopAndBottom;
            this.spacingY = options.spacingY === undefined ? this.spacingY : options.spacingY;
            this.marginTop = options.marginTop === undefined ? this.marginTop : options.marginTop;
            this.maxListHeight = options.maxListHeight === undefined ? this.maxListHeight : options.maxListHeight;
            this.hideSelectedOption = options.hideSelectedOption === undefined ? this.hideSelectedOption : options.hideSelectedOption;
            this.optionButtonSize = options.optionButtonSize || this.optionButtonSize;
            if (!this.optionButtonSize){
              let trans = this.node.getComponent(UITransform)
              this.optionButtonSize = size(trans.width, trans.height);
            }
            if (options.listBackground)
                this.listBacgroundNode.getComponent(Sprite).spriteFrame = options.listBackground;
        }

        this._content = this.listContent.getComponent(ScrollView).content;

        if(this.maxListHeight==0){
            this.listContent.getComponent(ScrollView).vertical = false
            this.listContent.getComponent(ScrollView).horizontal = false
        }
    }

    /**
     * 获取下拉列表数据 [{key, label}]
     * @returns {Array}
     */
    getOptionDataList() {
        return this._optionDataList;
    }

    /**
     * 获取当前选中的key
     * @returns {String}
     */
    getSelectKey(){
        return this._selectedKey;
    }

    /**
     * 设定选中选项
     * @param {String} key 
     * @param {Boolean} triggerEvent    是否触发选项变更事件 默认 false
     */
    setSelection(key, triggerEvent) {
        let selection;
        for (let data of this._optionDataList) {
            if (data.key == key) {
                selection = data;
                break;
            }
        }
        this._initTitleButton(selection)

        if (true === triggerEvent) {
            if (this._selectionChangedHandler && this._handlerThisObj) {
                this._selectionChangedHandler.call(this._handlerThisObj, selection);
            } else {
                let event = new Event(this.Events.SELECTTION_CHANGED, false);
                event.target = event.currentTarget = this;
                // event.selection = selection;
                this.node.emit(this.Events.SELECTTION_CHANGED, event);
            }
        }
    }

    /**
     * 注册选项变更事件处理方法，如果注册了此事件，则不会触发emit(ButtonDropdownList.Events.SELECTTION_CHANGED)
     * @param {Function} handler 选项修改回调函数 function(selectionData)
     * @param {*} thisObj 回调函数this对象
     */
    addSelectionChangedEventHandler(handler, thisObj) {
        this._selectionChangedHandler = handler;
        this._handlerThisObj = thisObj;
    }

    /**
     * 注册item的渲染回调方法
     * @param {Function} handler 选项修改回调函数 function(selectionData)
     * @param {*} thisObj 回调函数this对象
     */
     addItemRenderHandler(handler, thisObj) {
        this._itemRenderHandler = handler;
        this._handlerThisObj = thisObj;
    }

    refreshItemState(type){
        if(this._itemRenderHandler){
            if(type == 1){
                let titleBtn = this.titleContainer.children[0]
                let idx = this._selectedKey==""?"0":this._selectedKey
                this._itemRenderHandler(titleBtn,idx)
            }else{
                let idx = 0
                this._content.children.forEach(element => {
                    this._itemRenderHandler(element,idx)
                    idx++
                });
            }
        }
    }

    /**
     * 初始化下拉列表数据
     * @param {Array} dataList 下拉列表数据 [{key, label}]
     * @param {String} selectedKey 下拉列表默认选项
     */
    setOptionDataList(dataList, selectedKey, secDataList=null, secSelectedKey=null) {
        if (!dataList || dataList.length <= 0) {
            return;
        }
        this._optionDataList = dataList;
        this._optionSecDataList = secDataList;
        // for (let data of dataList) {
        //     data.enabled = true;
        // }

        dataList.map((item, i)=>{
            item.enabled = true;
            item.menuIdx = i;
        })
        if(secDataList){

            secDataList.map((item,i)=>{
                item.map((item2)=>{
                    item2.enabled = true;
                    item2.menuIdx = i;
                })
            })

            // for (let data of secDataList) {
            //     for(let item of data){
                    
                    
            //     }
            // }
        }
        this._selectedKey = selectedKey || null;
        this._secSelectedKey = secSelectedKey || null;
        if(this._selectedKey){
            this.setSelection(this._selectedKey,false)
        }
    }

    onLoad() {
        if (!this._initialized) {
            this._initialized = true;
            this.listBacgroundNode.parent = null;
            this.listBacgroundNode.getComponent(Sprite).enabled = true;
            this.listContent.parent = null;
            this.mask.node.parent = null;
            this.mask.node.on(Node.EventType.TOUCH_END, this._fold, this);

            if(this.titleContainer.children.length <= 0){
                if(!!this._selectedKey){
                    let selection;
                    for (let data of this._optionDataList) {
                        if (data.key == this._selectedKey) {
                            selection = data;
                            break;
                        }
                    }
                    this._initTitleButton(selection);
                } else {
                    this._initTitleButton();
                }
            } else {

            }
        }
    }

    /**
     * 初始化标题按钮
     * @param {*} selectionData 
     */
    _initTitleButton(selectionData=null) {
        // 显示默认选项
        if (!!selectionData && selectionData.key === this._selectedKey && this.titleContainer.children.length > 0) {
            return;
        }
        let titleContainer = this.titleContainer;
        if (titleContainer.children.length > 0) {
            titleContainer.children[0].off(Node.EventType.TOUCH_END, this._onOptionTouched, this);
            this.titleContainer.removeAllChildren();
        }

        let dataList = this._optionDataList;
        let titleData;
        if (!!selectionData) {
            titleData = selectionData;
            this._selectedKey = titleData.key;
        } else if (!!this.placeHolder) {
            titleData = {
                key: null,
                label: this.placeHolder
            };
        } else if (!dataList || dataList.length <= 0) {
            titleData = dataList[0];
            this._selectedKey = titleData.key;
        } else {
            titleData = {
                key: null,
                label: ''
            };
        }
        let titleButton = this._createOneOption(titleData, true);
        titleButton.position = new Vec3(0,0,0)
        titleButton.active = true
        this.titleContainer.addChild(titleButton);
        this.refreshItemState(1)
    }

    /**
     * 重置
     */
    reset() {
        this._fold();
        let titleContainer = this.titleContainer;
        if (titleContainer.children.length > 0) {
            titleContainer.children[0].off(Node.EventType.TOUCH_END, this._onOptionTouched, this);
        }
        this.titleContainer.removeAllChildren();
        this._selectedKey = "";
        this._initTitleButton();
    }

    /**
     * 创建选项按钮
     * @param {*} data  选项数据
     * @param {*} isTitleButton 是否是标题按钮，如果存在标题按钮模板，则采用标题按钮模板
     * @returns {Prefab} 创建好的选项按钮
     */
    _createOneOption(data, isTitleButton=false, isNormalBtn=false) {
        let option;
        if (true === isTitleButton) {
            option = this.titleButtonTemplate ? instantiate(this.titleButtonTemplate) : instantiate(this.optionButtonTemplate);
        } else if (true === isNormalBtn) {
            option = instantiate(this.optionButtonTemplate);
        } else if (this._selectedKey === data.key) {
            option = this.selectedOptionButtonTemplate ? instantiate(this.selectedOptionButtonTemplate) : instantiate(this.optionButtonTemplate);
        } else {
            option = instantiate(this.optionButtonTemplate);
        }
        if (false === data.enabled) {
            option.getComponent(Button).interactable = false;
        } else {
            option.getComponent(Button).interactable = true;
        }
        option.getComponent(UITransform).setContentSize(this.optionButtonSize.width, this.optionButtonSize.height);
        this._setBtnText(option, data.label);
        option.optionData = data;

        option.on(Node.EventType.TOUCH_END, this._onOptionTouched, this);

        return option;
    }

    _createSecOption(data){
        let option;
        if (this._secSelectedKey == data.key) {
            option = this.selectedOptionButtonTemplate ? instantiate(this.selectedOptionButtonTemplate) : instantiate(this.optionButtonTemplate);
        } else {
            option = instantiate(this.optionButtonTemplate);
        }

        option.getComponent(UITransform).setContentSize(this.optionButtonSize.width, this.optionButtonSize.height);
        this._setBtnText(option, data.label);
        option.optionData = data;

        option.on(Node.EventType.TOUCH_END, this._onSecOptionTouched, this);

        return option;
    }

    _createMultiOption(data){
        let option;
        option = instantiate(this.multiButtonTemplate);
        const selected = option.getChildByName("selected");
        selected.active = this._selectMultiMap[data.key];
        // if (this._selectMultiMap[data.key]) {
        //     option = this.selectedOptionButtonTemplate ? instantiate(this.selectedOptionButtonTemplate) : instantiate(this.optionButtonTemplate);
        // } else {
        //     option = instantiate(this.optionButtonTemplate);
        // }

        option.getComponent(UITransform).setContentSize(this.optionButtonSize.width, this.optionButtonSize.height);
        this._setBtnText(option, data.label);
        option.optionData = data;

        option.on(Node.EventType.TOUCH_END, this._onMultiOptionTouched, this);

        return option;
    }

    /**
     * 设置按钮文字
     * @param {Node} btnNode 按钮节点
     * @param {String} str 设置的字符串
     */
    _setBtnText(btnNode, str) {
        if (!isValid(btnNode) || str == null) {
            console.error('setBtnText btnNode or str is null');
            return;
        }
        let label = null;
        if (btnNode instanceof Button) {
            label = find("Label", btnNode.node);
        } else {
            label = find("Label", btnNode);
        }

        if (label) {
            label.getComponent(Label).string = str;
            if (this.font) {
                label.getComponent(Label).font = this.font;
            }
        }
    }

    /**
     * 选项按钮点击事件
     * @param {Event} event 
     */
    _onOptionTouched(event) {
        let target = event.target;
        if (this._foldFlg) {
            // 展开
            this._unfold();
        } else {
            // 选中， 收起
            let data = target.optionData;
            if(this._isComMenu){
                const arrLen = this._optionSecDataList[data.key].length;

                if(arrLen > 0){
                    // this._selectedKey = data.key;
                    this._preSelectedKey = data.key;
                    if(this._isMultiSelect){
                        this._unfoldMulti(target);
                    } else{
                        this._unfoldSec(target);
                    }
                } else {
                    this._secSelectedKey = "-1";

                    if (data.key != this._selectedKey && data.enabled === true) {
                        this._selectedKey = data.key;
                        let selectedButton = this._createOneOption(data, true);
                        let titleContainer = this.titleContainer;
                        if (titleContainer.children.length > 0) {
                            titleContainer.children[0].off(Node.EventType.TOUCH_END, this._onOptionTouched, this);
                        }
                        this.titleContainer.removeAllChildren();
                        selectedButton.x = 0;
                        selectedButton.y = 0;
                        this.titleContainer.addChild(selectedButton);
                        
                        if (this._selectionChangedHandler && this._handlerThisObj) {
                            if(this._isMultiSelect){
                                this._selectMultiMap = {};
                                this._selectionChangedHandler.call(this._handlerThisObj, this._selectMultiMap);
                            } else {
                                this._selectionChangedHandler.call(this._handlerThisObj, data);
                            }

                        } else {
                            let event:Event = new Event(this.Events.SELECTTION_CHANGED, false);
                            event.target = event.currentTarget = this;
                            // event. = data;
                            this.node.emit(this.Events.SELECTTION_CHANGED, event);
                        }
                        this._fold();
                    } else if (data.enabled === true) {
                        this._fold();
                    }
                }
            } else {
                if (data.key != this._selectedKey && data.enabled === true) {
                    this._selectedKey = data.key;
                    let selectedButton = this._createOneOption(data, true);
                    let titleContainer = this.titleContainer;
                    if (titleContainer.children.length > 0) {
                        titleContainer.children[0].off(Node.EventType.TOUCH_END, this._onOptionTouched, this);
                    }
                    this.titleContainer.removeAllChildren();
                    selectedButton.x = 0;
                    selectedButton.y = 0;
                    this.titleContainer.addChild(selectedButton);
                    this.refreshItemState(1)
    
                    if (this._selectionChangedHandler && this._handlerThisObj) {
                        this._selectionChangedHandler.call(this._handlerThisObj, data);
                    } else {
                        let event = new Event(this.Events.SELECTTION_CHANGED, false);
                        event.target = event.currentTarget = this;
                        // event.selection = data;
                        this.node.emit(this.Events.SELECTTION_CHANGED, event);
                    }
                    this._fold();
                } else if (data.enabled === true) {
                    this._fold();
                }
            }

        }
    }

    /**
     * 选项按钮点击事件
     * @param {Event} event 
     */
    _onSecOptionTouched(event) {
        let target = event.target;

        this._selectedKey = this._preSelectedKey;

        if (this._foldFlg) {
            // 展开
            this._unfold();
        } else {
            // 选中， 收起
            let data = target.optionData;

            if (data.key != this._secSelectedKey && data.enabled === true) {
                this._secSelectedKey = data.key;
                let selectedButton = this._createOneOption(data, true);
                let titleContainer = this.titleContainer;
                if (titleContainer.children.length > 0) {
                    titleContainer.children[0].off(Node.EventType.TOUCH_END, this._onOptionTouched, this);
                }
                this.titleContainer.removeAllChildren();
                selectedButton.position = new Vec3(0,0,0)
                // selectedButton.x = 0;
                // selectedButton.y = 0;
                this.titleContainer.addChild(selectedButton);

                if (this._selectionChangedHandler && this._handlerThisObj) {
                    this._selectionChangedHandler.call(this._handlerThisObj, data);
                } else {
                    let event = new Event(this.Events.SELECTTION_CHANGED, false);
                    event.target = event.currentTarget = this;
                    // event.selection = data;
                    this.node.emit(this.Events.SELECTTION_CHANGED, event);
                }
                this._fold();
            } else if (data.enabled === true) {
                this._fold();
            }
        }
    }

    /**
     * 选项按钮点击事件
     * @param {Event} event 
     */
    _onMultiOptionTouched(event) {
        let target = event.target;
        let data = target.optionData;
        
        // 大菜單如果之前選的和之前選的不一樣 需要清空之前選擇的多選

        let hasChange = false;

        if(this._selectedKey != this._preSelectedKey){
            this._selectedKey = this._preSelectedKey;
            hasChange = true;

            this._selectMultiMap = {};
        }

        if(this._selectMultiMap[data.key]){
            delete this._selectMultiMap[data.key]
        } else {
            this._selectMultiMap[data.key] = true;
        }

        if(Object.keys(this._selectMultiMap).length == 0){
            this._selectedKey = "0";
            let selectedButton = this._createOneOption(this._optionDataList[0], true);
            let titleContainer = this.titleContainer;
            if (titleContainer.children.length > 0) {
                titleContainer.children[0].off(Node.EventType.TOUCH_END, this._onOptionTouched, this);
            }
            this.titleContainer.removeAllChildren();
            selectedButton.position = new Vec3(0,0,0)
            // selectedButton.x = 0;
            // selectedButton.y = 0;
            this.titleContainer.addChild(selectedButton);
        } else if(hasChange){
            let selectedButton = this._createOneOption(this._optionDataList[this._selectedKey], true);
            let titleContainer = this.titleContainer;
            if (titleContainer.children.length > 0) {
                titleContainer.children[0].off(Node.EventType.TOUCH_END, this._onOptionTouched, this);
            }
            this.titleContainer.removeAllChildren();
            selectedButton.position = new Vec3(0,0,0)
            // selectedButton.x = 0;
            // selectedButton.y = 0;
            this.titleContainer.addChild(selectedButton);
        }

        this._secContent.children.map((item, i)=>{
            const selected = item.getChildByName("selected");
            selected.active = this._selectMultiMap[item.optionData.key];
            // label.color = this._selectMultiMap[item.optionData.key] ? color(215,167,0) : color(238,228,193);
        });

        this._selectionChangedHandler.call(this._handlerThisObj, this._selectMultiMap);
        // let target = event.target;

        // this._selectedKey = this._preSelectedKey;

        // if (this._foldFlg) {
        //     // 展开
        //     this._unfold();
        // } else {
        //     // 选中， 收起
        //     let data = target.optionData;

        //     if (data.key != this._secSelectedKey && data.enabled === true) {
        //         this._secSelectedKey = data.key;
        //         let selectedButton = this._createOneOption(data, true);
        //         let titleContainer = this.titleContainer;
        //         if (titleContainer.childrenCount > 0) {
        //             titleContainer.children[0].off(Node.EventType.TOUCH_END, this._onOptionTouched, this);
        //         }
        //         this.titleContainer.removeAllChildren();
        //         selectedButton.x = 0;
        //         selectedButton.y = 0;
        //         this.titleContainer.addChild(selectedButton);

        //         if (this._selectionChangedHandler && this._handlerThisObj) {
        //             this._selectionChangedHandler.call(this._handlerThisObj, data);
        //         } else {
        //             let event = new Event(ButtonDropdownList.Events.SELECTTION_CHANGED, false);
        //             event.target = event.currentTarget = this;
        //             event.selection = data;
        //             this.node.emit(ButtonDropdownList.Events.SELECTTION_CHANGED, event);
        //         }
        //         this._fold();
        //     } else if (data.enabled === true) {
        //         this._fold();
        //     }
        // }
    }

    /**
     * 收起
     */
    _fold() {
        this._foldFlg = true;
        let mask = this.mask;
        let listBacgroundNode = this.listBacgroundNode;
        let listContent = this.listContent;

        let secListBackgroundNode = this.secListBackgroundNode;
        let secListContent = this.secListContent;
        mask.node.parent = null;
        let oriScale = listBacgroundNode.scale
        let opCom = listContent.getComponent(UIOpacity)
        if (listBacgroundNode.parent) {
            tween(opCom).to(.05, {
                opacity: 0
            }).start();
            tween(listBacgroundNode).delay(.05).to(.1, {
                scale: new Vec3(oriScale.x,0,oriScale.z)
            }).call(() => {
                let buttonList = this.buttonList;
                for (let i = buttonList.length - 1; i >= 0; i--) {
                    let button = buttonList[i];
                    if (button.optionData.key === this._selectedKey) {
                        continue;
                    }
                    button.targetOff(this);
                }
                buttonList.splice(0);
                buttonList = null;

                this._content.removeAllChildren();
                listContent.parent = null;
                listContent.active = false;
                listBacgroundNode.parent = null;
                listBacgroundNode.active = false;
                this.mask.node.active = false;

                if(this._isComMenu){
                    this._secContent.removeAllChildren();
                    secListContent.parent = null;
                    secListContent.active = false;
                    secListBackgroundNode.parent = null;
                    secListBackgroundNode.active = false;
                }
            }).start();
        } else {
            let buttonList = this.buttonList;
            for (let i = buttonList.length - 1; i >= 0; i--) {
                let button = buttonList[i];
                if (button.optionData.key === this._selectedKey) {
                    continue;
                }
                button.targetOff(this);
            }
            buttonList.splice(0);
            buttonList = null;

            this._content.removeAllChildren();
            listContent.parent = null;
            listContent.active = false;
            listBacgroundNode.parent = null;
            listBacgroundNode.active = false;
            this.mask.node.active = false;

            if(this._isComMenu){
                this._secContent.removeAllChildren();
                secListContent.parent = null;
                secListContent.active = false;
                secListBackgroundNode.parent = null;
                secListBackgroundNode.active = false;
            }
        }
    }

    hideSection(obj, isHide = true){
        isHide ? (this._hideMap = obj) : (this._hideMap = {});
    }

    /**
     * 展开
     */
    _unfold() {
        this._foldFlg = false;
        // let curScene = director.getScene();
        let curScene = this.node.parent
        let content = this._content;

        let mask = this.mask;
        mask.node.parent = null;
        mask.node.getComponent(UITransform).setContentSize(screen.windowSize);
        mask.node.setPosition(0, 0);
        mask.node.active = true;
        curScene.addChild(mask.node);

        const dataList = this._optionDataList.filter((item)=>{return !this._hideMap || !this._hideMap[item.key]});

        let btnTitlePos = this.node.position
        let spacingY = this.spacingY;

        let listBacgroundNode = this.listBacgroundNode;
        listBacgroundNode.parent = null;

        let listContent = this.listContent;
        listContent.parent = null;

        let hasSelection = !!this._selectedKey ? true : false;
        let optionLength = this.hideSelectedOption && hasSelection ? dataList.length - 1 : dataList.length;
        let contentHeight = (this.optionButtonSize.height + spacingY) * optionLength + spacingY;
        let height = contentHeight + this.paddingTopAndBottom * 2;
        if (this.maxListHeight > 0 && height > this.maxListHeight) {
            height = this.maxListHeight;
        }
        let nodeTrans = this.node.getComponent(UITransform)
        listBacgroundNode.getComponent(UITransform).setContentSize(nodeTrans.width + this.paddingLeftAndRight * 2, height);
        if(this.isUp){
            listBacgroundNode.getComponent(UITransform).setAnchorPoint(.5, 0);
            listBacgroundNode.setPosition(new Vec3(btnTitlePos.x, btnTitlePos.y  + this.marginTop));
        }else{
            listBacgroundNode.getComponent(UITransform).setAnchorPoint(.5, 1);
            listBacgroundNode.setPosition(new Vec3(btnTitlePos.x, btnTitlePos.y  - this.marginTop));
        }
        listBacgroundNode.active = true;
        curScene.addChild(listBacgroundNode);

        content.getComponent(UITransform).setContentSize(nodeTrans.width, contentHeight);
        listContent.getComponent(UITransform).setContentSize(nodeTrans.width, height - this.paddingTopAndBottom * 2);
        if(this.isUp){
            listContent.getComponent(UITransform).setAnchorPoint(.5, 0);
            listContent.setPosition(new Vec3(btnTitlePos.x, btnTitlePos.y + nodeTrans.height * .5 + this.marginTop));
        }else{
            listContent.getComponent(UITransform).setAnchorPoint(.5, 1);
            listContent.setPosition(new Vec3(btnTitlePos.x, btnTitlePos.y - nodeTrans.height * .5 - this.marginTop ));
        }
        content.removeAllChildren();
        listContent.getComponent(UIOpacity).opacity = 255;
        listContent.active = true;
        curScene.addChild(listContent);

        listBacgroundNode.scale = new Vec3(listBacgroundNode.scale.x,0,listBacgroundNode.scale.z);
        tween(listBacgroundNode).to(.1, {
            scale: new Vec3(listBacgroundNode.scale.x,1,listBacgroundNode.scale.z)
        }, {
            easing: 'circOut'
        }).call(() => {
            listContent.getComponent(ScrollView).scrollToTop();
            let buttonList = this.buttonList;
            let cheight = content.getComponent(UITransform).height
            for (let i = 0; i < dataList.length; i++) {
                let data = dataList[i];
                if (true === this.hideSelectedOption && data.key == this._selectedKey) {
                    continue;
                }
                let button = this._createOneOption(data);
                buttonList.push(button);
                button.active = true;
                height = button.getComponent(UITransform).height
                let ypos = cheight * .5 - (height + spacingY) * i - this.itemMarginTop
                button.position = new Vec3(0,ypos,0)
                content.addChild(button);
            }
            this.refreshItemState(2)
        }).start()
    }

    _unfoldMulti(target){
        this._foldFlg = false;
        let curScene = director.getScene();
        let content = this._secContent;

        // let mask = this.mask;
        // mask.node.parent = null;
        // mask.node.setContentSize(winSize);
        // mask.node.setPosition(0, 0);
        // mask.node.active = true;
        // curScene.addChild(mask.node);

        let btnTitlePos = this.node.parent.getComponent(UITransform).convertToWorldSpaceAR(this.node.getPosition());
        let spacingY = this.spacingY;

        let targetPos = target.convertToWorldSpaceAR(new Vec2(0, 0))
        const winSize = screen.windowSize;
        let nodeTrans = this.node.getComponent(UITransform)
        const nodeWidth = nodeTrans.width + this.paddingLeftAndRight * 2 + 8;
        const endPos = {x: 0, y: 0};
        let side = 1;
        if(btnTitlePos.x+nodeWidth*1.5 > winSize.width){
            side = -1
        }
        endPos.x = targetPos.x + side*nodeWidth; // 暂定
        endPos.y = targetPos.y; // 暂定
        
        let listBacgroundNode = this.secListBackgroundNode;
        listBacgroundNode.parent = null;

        let listContent = this.secListContent;
        listContent.parent = null;

        let hasSelection = !!this._preSelectedKey ? true : false;
        let dataListLen = this._optionSecDataList[this._preSelectedKey].length;
        let optionLength = this.hideSelectedOption && hasSelection ? dataListLen - 1 : dataListLen;
        let contentHeight = (this.optionButtonSize.height + spacingY) * optionLength - spacingY;
        let height = contentHeight + this.paddingTopAndBottom * 2;

        if (this.maxListHeight > 0 && height > this.maxListHeight) {
            height = this.maxListHeight;
        }
        listBacgroundNode.getComponent(UITransform).setContentSize(nodeTrans.width + this.paddingLeftAndRight * 2, height);
        listBacgroundNode.setAnchorPoint(.5, 1);
        // listBacgroundNode.setPosition(v2(btnTitlePos.x, btnTitlePos.y - this.node.height * .5 - this.marginTop));
        listBacgroundNode.setPosition(new Vec3(endPos.x, endPos.y));
        listBacgroundNode.active = true;
        curScene.addChild(listBacgroundNode);

        content.getComponent(UITransform).setContentSize(nodeTrans.width, contentHeight);
        listContent.setContentSize(nodeTrans.width, height - this.paddingTopAndBottom * 2);
        listContent.getComponent(UITransform).setAnchorPoint(.5, 1);
        // listContent.setPosition(v2(btnTitlePos.x, btnTitlePos.y - this.node.height * .5 - this.marginTop - this.paddingTopAndBottom));
        listContent.setPosition(new Vec3(endPos.x, endPos.y-this.paddingTopAndBottom));
        content.removeAllChildren();
        listContent.opacity = 255;
        listContent.active = true;
        curScene.addChild(listContent);

        listBacgroundNode.scaleY = 0;
        tween(listBacgroundNode).to(.1, {
            scaleY: 1
        }, {
            easing: 'circOut'
        }).call(() => {
            listContent.getComponent(ScrollView).scrollToTop();
            let dataList = this._optionSecDataList[this._preSelectedKey];
            let buttonList = this.buttonList;
            let index = 0;
            for (let i = 0; i < dataList.length; i++) {
                let data = dataList[i];
                if (true === this.hideSelectedOption && data.key == this._preSelectedKey) {
                    continue;
                }
                let button = this._createMultiOption(data);
                buttonList.push(button);
                button.active = true;
                button.setPosition(0, -button.height * .5 - (button.height + spacingY) * i);
                content.addChild(button);
                // button.x = 0;
                // button.y = 0 -button.height*i;
                // button.opacity = 0;
                // tween(button).delay(.02 * index++).to(.06, {
                //     opacity: 255
                // }).start();
            }
        }).start();
    }

    _unfoldSec(target){
        this._foldFlg = false;
        let curScene = director.getScene();
        let content = this._secContent;

        // let mask = this.mask;
        // mask.node.parent = null;
        // mask.node.setContentSize(winSize);
        // mask.node.setPosition(0, 0);
        // mask.node.active = true;
        // curScene.addChild(mask.node);

        let btnTitlePos = this.node.parent.getComponent(UITransform).convertToWorldSpaceAR(this.node.getPosition());
        let spacingY = this.spacingY;

        let nodeTrans = this.node.getComponent(UITransform)
        let targetPos = target.convertToWorldSpaceAR(new Vec3(0, 0))
        const winSize = screen.windowSize;
        const nodeWidth = nodeTrans.width + this.paddingLeftAndRight * 2 + 8;
        const endPos = {x: 0, y: 0};
        let side = 1;
        if(btnTitlePos.x+nodeWidth*1.5 > winSize.width){
            side = -1
        }
        endPos.x = targetPos.x + side*nodeWidth; // 暂定
        endPos.y = targetPos.y; // 暂定
        
        let listBacgroundNode = this.secListBackgroundNode;
        listBacgroundNode.parent = null;

        let listContent = this.secListContent;
        listContent.parent = null;

        let hasSelection = !!this._preSelectedKey ? true : false;
        let dataListLen = this._optionSecDataList[this._preSelectedKey].length;
        let optionLength = this.hideSelectedOption && hasSelection ? dataListLen - 1 : dataListLen;
        let contentHeight = (this.optionButtonSize.height + spacingY) * optionLength - spacingY;
        let height = contentHeight + this.paddingTopAndBottom * 2;
        if (this.maxListHeight > 0 && height > this.maxListHeight) {
            height = this.maxListHeight;
        }
        listBacgroundNode.getComponent(UITransform).setContentSize(nodeTrans.width + this.paddingLeftAndRight * 2, height);
        listBacgroundNode.setAnchorPoint(.5, 1);
        // listBacgroundNode.setPosition(v2(btnTitlePos.x, btnTitlePos.y - this.node.height * .5 - this.marginTop));
        listBacgroundNode.setPosition(new Vec3(endPos.x, endPos.y));
        listBacgroundNode.active = true;
        curScene.addChild(listBacgroundNode);

        content.getComponent(UITransform).setContentSize(nodeTrans.width, contentHeight);
        listContent.getComponent(UITransform).setContentSize(nodeTrans.width, height - this.paddingTopAndBottom * 2);
        listContent.setAnchorPoint(.5, 1);
        // listContent.setPosition(v2(btnTitlePos.x, btnTitlePos.y - this.node.height * .5 - this.marginTop - this.paddingTopAndBottom));
        listContent.setPosition(new Vec3(endPos.x, endPos.y-this.paddingTopAndBottom));
        content.removeAllChildren();
        listContent.opacity = 255;
        listContent.active = true;
        curScene.addChild(listContent);

        listBacgroundNode.scaleY = 0;
        tween(listBacgroundNode).to(.1, {
            scaleY: 1
        }, {
            easing: 'circOut'
        }).call(() => {
            listContent.getComponent(ScrollView).scrollToTop();
            let dataList = this._optionSecDataList[this._preSelectedKey];
            let buttonList = this.buttonList;
            let index = 0;
            for (let i = 0; i < dataList.length; i++) {
                let data = dataList[i];
                if (true === this.hideSelectedOption && data.key == this._preSelectedKey) {
                    continue;
                }
                let button = this._createSecOption(data);
                buttonList.push(button);
                button.active = true;
                button.setPosition(0, -button.height * .5 - (button.height + spacingY) * i);
                content.addChild(button);
                // button.x = 0;
                // button.y = 0 -button.height*i;
                // button.opacity = 0;
                // tween(button).delay(.02 * index++).to(.06, {
                //     opacity: 255
                // }).start();
            }
        }).start();
    }

    getButtons(){
        return this._content.children
    }

    start() {

    }

    // update (dt) {},

    onDestroy() {
        if (this.buttonList && this.buttonList.length > 0) {
            for (let button of this.buttonList) {
                button.targetOff(this);
                button.destroy();
            }
        }

        this._handlerThisObj = null;
        this._selectionChangedHandler = null;

        this.buttonList = null;
        this._optionDataList = null;
    }
}