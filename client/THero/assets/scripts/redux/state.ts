import { Component } from "cc";
import reducer from "./modules/reducer";
import ReduxName from './reduxName';

export default class State {
	public static stateArr = [];
	public static initState = {} as any;
	public static state = {} as any;
	public static preState = {};
	public static bindScript = {};
	public static nodeBindInfo = {};
	public static hasInit = false;

	public static init() {
		if (!this.hasInit) {
			this.stateArr = reducer.getStates()
			this.bindData();
			this.hasInit = true;
		}
	}

	private static bindData() {
		this.stateArr.map(item => {
			this.initState[item.storeName] = item.state;
			this.state[item.storeName] = {};
			let oriState = this.initState[item.storeName]
			let curState = this.state[item.storeName]
			for (let key in item.state) {
				curState[key] = this.ObjClone(oriState[key])
			}
		});
	}

	public static resetState() {
		this.stateArr.map(item => {
			this.dispatch({ type: item.storeName, ...this.initState[item.storeName] })
		})
	}

	public static resetStateByName(storeName) {
		this.dispatch({ type: storeName, ...this.initState[storeName] })
	}

	public static dispatch(action) {
		// console.log("---action---", action);
		let st = this.initState[action.type]
		let curSt = this.state[action.type]
		for (const key in action) {
			if (key != "type") {
				let obj = action[key];
				let isequal = this.looseEqual(st[key],obj);
				// console.log("isequal======"+isequal)
				if(!isequal){
					st[key] = obj
					if(this.isObject(obj)){
						curSt[key] = this.ObjClone(obj)
					}else{
						curSt[key] = st[key]
					}
					let cbDic = this.bindScript[action.type + ":" + key];
					if(cbDic){
						let cbArr = Object.values(cbDic)
						if (cbArr) {
							cbArr.forEach(element => {
								element["cb"](curSt[key])
							});
						}
					}
				}
			}
		}
	}

	public static disconnect(name) {
		let cbArr = Object.values(this.bindScript)
		cbArr.forEach(element => {
			delete element[name]
		});
	}

	public static addUpdateTs(obj) {
		for (const key in obj) {
			if (typeof obj[key] !== "object") return;
			obj[key].updateTs = key + new Date().valueOf();
		}
	}

	public static connect(name, reduxName, key, cb) {
		name = name.split("_")[0];
		let targetObj = this.bindScript[reduxName + ":" + key];
		if (targetObj == undefined) {
			targetObj  = {};
		} 
		targetObj[name] ={ name,cb };
		this.bindScript[reduxName + ":" + key] = targetObj;
		let needState = this.state[reduxName][key]
		console.log(needState)
		cb(needState);
	}

	public static getRandomUUID() {
		return new Date().valueOf() + this.getRandomNum(1000).toString()
	}

	public static getState(rName, sName) {
		return this.state[rName][sName];
	}


	public static getState2(rName, sName) {
		return this.initState[rName][sName];
	}

	static ObjFreeze(obj) {
		if (obj instanceof Array || obj instanceof Object) {
			// console.log("ObjFreeze==== isObj",obj)
			for (let key in obj) {
				// console.log("ObjFreeze==== key="+key)
				this.ObjFreeze(obj[key])
			}
		}
		Object.freeze(obj);
	}

	static looseEqual (a, b) {
		// if (a === b) { //如果是绝对相等就直接返回true
		// 	console.log("looseEqual1")
		// 	return true ;
		// }
		// console.log("looseEqual a="+JSON.stringify(a)+" b="+JSON.stringify(b))
		//如果不是绝对相等就哦按的他们是否有相同的形状
		var isObjectA = this.isObject(a);
		var isObjectB = this.isObject(b);
		if (isObjectA && isObjectB) {//两个均是对象
		  try {
			var isArrayA = Array.isArray(a);
			var isArrayB = Array.isArray(b);
			if (isArrayA && isArrayB) {//如果都是数组
				if(a.length === b.length){//如果长度相等
					return a.every(function (e, i) {//用every和递归来比对a数组和b数组的每个元素，并返回
					  return State.looseEqual(e, b[i])
					})
				}
				//长度都不等直接返回false
				return  false;
			} else if (a instanceof Date && b instanceof Date) {//如果是Date 则直接getTime 比较
			   return a.getTime() === b.getTime()
			} else if (!isArrayA && !isArrayB) {//对象的比较
			  //拿到两个对象的key
			  var keysA = Object.keys(a);
			  var keysB = Object.keys(b);
			  if(keysA.length === keysB.length){//如果keys相等
				  return keysA.every(function (key) {//用every和递归来比对a对象和b对象的每个元素值，并返回
					return State.looseEqual(a[key], b[key]);
				  })
			  }
			  //长度都不等直接返回false
			  return false;
			} else {
			  return false
			}
		  } catch (e) {
			return false
		  }
		} else if (!isObjectA && !isObjectB) {//如果都不是对象则按String来处理
			return String(a) === String(b)
		} else {
			return false
		}
	  }
	   
	  static isObject (obj) {
		return obj !== null && typeof obj === 'object'
	  }

	static ObjClone(obj) {
		// let copy123  = JSON.parse(JSON.stringify(obj));
		// return copy123;
		if ( obj instanceof Component) {
			console.log("is Com")
			return obj
		}

		// Handle the 3 simple types, and null or undefined or function
		if (null == obj || "object" != typeof obj) return obj;

		let copy = null as any;

		// Handle Date
		if (obj instanceof Date) {
			copy = new Date();
			copy.setTime(obj.getTime());
			return copy;
		}
		// Handle Array or Object
		if (obj instanceof Array || obj instanceof Object) {
			if (obj.updateTs != undefined) {
				copy = (obj instanceof Array) ? [...obj] : { ...obj };
				copy.updateTs = obj.updateTs;
				return copy;
			}
			copy = (obj instanceof Array) ? [] : {};
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr))
					copy[attr] = State.ObjClone(obj[attr]);
			}
			return copy;
		}
		throw new Error("Unable to clone obj! Its type isn't supported.");
	}

	static getRandomNum(maxNum) {
		return Math.floor(Math.random() * maxNum);
	}
}