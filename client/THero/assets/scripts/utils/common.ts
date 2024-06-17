
import { sys, Vec3, ImageAsset, SpriteFrame, Sprite, loader, error, Node, sp, resources, Texture2D, UITransform, Color, UIOpacity, Label, color, ParticleSystem, assetManager, Camera, RenderTexture, log, SkeletalAnimationComponent, math, Vec2, TERRAIN_SOUTH_INDEX, RichText } from 'cc';
import Setting, { SERVER_OPT } from "../SeverConfig";
import { EventCenter } from "../UIFrame/EventCenter";
import Ext from "./exts";
import NativeMgr, { NativeMethod } from "./NativeMgr";

const regx = /@(.+?)\s/g;
const regex = /\[(.+?)\]/g; // 全局搜索表情
const regex2 = /\[(.+?)\]/; // 局部搜索表情

const regex3 = /\[\*(.+?)\\*]/g;
const regex4 = /\[_(.+?)_\]/g;

const regex5 = /\[@(.+?)@\]/g

import ButtonPlus from '../UIFrame/Common/Components/ButtonPlus';
import Constants, { EventName } from '../Constant';
import { resourceUtil } from '../UIFrame/resourceUtil';
import State from '../redux/state';
import Redux from '../redux';
import ConstEnum from './EnumeDefine';
import { EnumUtils } from '../UIFrame/Common/Utils/EnumUtils';
import { AttrInfo } from './pomelo/DataDefine';
import { CommUtil } from './pomelo/CommUtil';
import { AttrType, Consts } from './ConstDefine';
import ResMgr from '../UIFrame/ResMgr';

export default class Common {

	static disableNode(n: Node, state) {

		if (n.getComponent(Sprite) != undefined) {
			n.getComponent(Sprite).grayscale = state;
		}
		if (n.getComponent(Label) != undefined) {
			if (state) {
				if ((n as any).oldColor == undefined) {
					(n as any).oldColor = n.getComponent(Label).color.toHEX("#rrggbb");
				}
				n.getComponent(Label).color = color(200, 200, 200);
			} else {
				if ((n as any).oldColor != undefined) n.getComponent(Label).color = color((n as any).oldColor);
			}
		}
		if (n.getComponent(ButtonPlus) != undefined) {
			n.getComponent(ButtonPlus).interactable = !state
		}
		if (n.children.length != 0) {
			n.children.map(item => {
				this.disableNode(item, state);
			})
		}
	}
	// 获取url参数
	static getUrlParams(paras) {
		const reg = new RegExp('(^|&)' + paras + '=([^&]*)(&|$)');
		const r = window.location.search.substr(1).match(reg);
		if (r) {
			if (r != null) {
				return unescape(r[2]);
			} else {
				return null;
			}
		} else {
			var url = location.href;
			var paraArr = url.split('?');
			var paraString = paraArr[paraArr.length - 1].split("&");
			var paraObj = {};
			let j;

			for (let i = 0; (paraString[i]); i++) {
				j = paraString[i];
				paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
			}
			var returnValue = paraObj[paras.toLowerCase()];
			if (typeof (returnValue) == "undefined") {
				return "";
			} else {
				return returnValue;
			}
		}
	}

	//数组移除元素
	static arrRemoveItem(arr, item){
		let pos = arr.indexOf(item);
		if(pos > -1){
			arr.splice(pos, 1);
		}
	}

	// 计算两点之间的距离
	static getDis(sPoint, ePoint){
		let sP = new Vec2(sPoint.x, sPoint.y);
		let eP = new Vec2(ePoint.x, ePoint.y);

		// let vec = eP.distance(sP);
		let dis = math.Vec2.distance(sP, eP);
		// return vec.mag()

		// console.log({dis})
		return dis
	}

	static changeLang(lang) {
		if (lang === "zh_SG") { lang = "zh-TW" }
		if (lang === "ru_RU") { lang = "ru" }
		if (lang === "zh-CN") { lang = "zh_CN" }
		if (lang === "zh-TW") { lang = "zh_TW" }
		sys.localStorage.setItem("momoverse-lang", lang);
		console.log("initLang lang="+lang)
		Ext.i18n.init(lang)
		Ext.i18n.updateSceneRenderers();
		EventCenter.emit(EventName.ChangeLang)
	}

	//获取整数随机数 < maxNum
	static getRandomNum(maxNum) {
		return Math.floor(Math.random() * maxNum);
	}

	static randomNum(num1, num2) {
		return Math.random() * (num2 - num1) + num1
	}

	//对象深拷贝
	static ObjClone(obj) {
		// let copy123  = JSON.parse(JSON.stringify(obj));
		// return copy123;

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
					copy[attr] = this.ObjClone(obj[attr]);
			}
			return copy;
		}
		throw new Error("Unable to clone obj! Its type isn't supported.");
	}

	static getDeviceId(): Promise<string> {
		return new Promise((resolve) => {
			if (Setting.environment != SERVER_OPT.product) {
				resolve("10")
			} else {
				if (sys.isNative) {
					resolve("0")

				} else {
					if (window["Fingerprint2"]) {
						let excludes = {
							userAgent: true,
							audio: true,
							enumerateDevices: true,
							fonts: true,
							fontsFlash: true,
							webgl: true,
							canvas: true
						};
						let options = { excludes: excludes }

						window["Fingerprint2"].get(options, (components) => {
							// 参数
							const values = components.map((component) => {
								return component.value
							});
							// 指纹
							const murmur = window["Fingerprint2"].x64hash128(values.join(''), 31);
							resolve(murmur + " ")
						});
					} else {
						resolve("0")
					}
				}
			}

		})
	}

	static postMessage(action, value = "") {
		window.parent.postMessage({
			from: "mbox",
			action,
			value,
		}, '*');
	}

	static changeCurPosToServePos(posVec3) {
		let serverPos = { xPos: Math.floor(posVec3.x + 0.5), yPos: Math.floor(-posVec3.z + 0.5) }
		return serverPos
	}

	static changeServePosToCurPos(posVec2) {
		let vec3 = new Vec3(posVec2.xPos, 0, -posVec2.yPos)
		return vec3;
	}

	static changeServePosToCurMapPos(posVec2) {
		let vec3 = new Vec3(posVec2.xPos, posVec2.yPos, 0)
		return vec3;
	}

	static async sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms))
	}

	static setNodeParticle(parUrl: string, node: Node, cb,) {
		// resources.load("particle/"+parUrl, ParticleAsset, (err, res:ParticleAsset) => {
		//     if (err) {
		//         error(err.message || err);
		//         return;
		//     }
		//     if(!node) return;
		//     node.getComponent(ParticleSystem).file = ParticleAsset;
		//     cb();
		// });
	}

	static setNodeSpine(spineUrl: string, node: Node, cb) {
		(node as any).spineUrl = spineUrl;
		resources.load("spine/" + spineUrl, sp.SkeletonData, function (err, skeletonData) {
			try {
				if (err) {
					console.error(err.message || err);
					cb(1)
					return;
				}
				if (!node || node.components == undefined|| spineUrl != (node as any).spineUrl) {
					return;
				}
				node.getComponent(sp.Skeleton).skeletonData = skeletonData;
				cb(0);
			} catch (err) {
				console.log(err)
			}
		})
	}

	static setNodeImg(imgUrl: string, node: Node, pad: object = [0, 0, 0, 0], cb = null) {
		resourceUtil.setNodeImg("texture/"+imgUrl,node,cb)
	}

	static setNodeImgSprite(imgUrl: string, node: Node, pad: object = [0, 0, 0, 0], cb = null) {
		node.getComponent(Sprite).spriteFrame = null;
		(node as any).imgUrl = imgUrl;
		resources.load("texture/" + imgUrl+"/spriteFrame", SpriteFrame, (err, res: SpriteFrame) => {
			if (err) {
				console.error(err.message || err);
				return;
			}
			if (!node || node.components == undefined || imgUrl != (node as any).imgUrl) return;

			node.active = true;
			node.getComponent(Sprite).spriteFrame = res;
			if (cb) {
				cb(res);
			}
		});
	}

	static setRemoteImg(imgUrl: string, node: Node,cb = null) {
		let old = node.getComponent(Sprite).spriteFrame;
		if(old){
			try {
				assetManager.releaseAsset(old.texture);
			} catch (error) {
				
			}
		}
		node.getComponent(Sprite).spriteFrame = null;

		(node as any).imgUrl = imgUrl;
		assetManager.loadRemote<ImageAsset>(imgUrl, (err, imageAsset) => {
			if (err) {
				error(err.message || err);
				if(cb){
					cb(1)
				}
				return;
			}
			if (!node || node.components == undefined || imgUrl != (node as any).imgUrl) {
				if(cb){
					cb(2)
				}
				return;
			}
			const spriteFrame = new SpriteFrame();
			const texture = new Texture2D();
			texture.setWrapMode(2, 2, 2)
			texture.image = imageAsset;
			spriteFrame.texture = texture;
			node.getComponent(Sprite).spriteFrame = spriteFrame;
			if(cb){
				cb(0)
			}
		});
	}

	//设置文本节点文本
	static setLableNodeText(text, node: Node,color:Color=Color.WHITE) {
		let nodeLabel = node.getComponent(Label);
		let nodeRichText = node.getComponent(RichText);
		
		if (nodeLabel) {
		  nodeLabel.string = text.toString();
		  nodeLabel.color = color
		}
		if (nodeRichText) {
		  nodeRichText.string = text.toString();
		  nodeLabel.color = color
		}
	
	  }

	static getCutStr(string, len = 10, isMiddle = false) {
		let str = string ? string.toString() : '';

		if (str.length < len) {
			return str;
		}

		let newStr = ""
		if (isMiddle) {
			let stage = Math.floor(len  / 2)
			newStr = str.slice(0, stage) + "..." + str.slice(str.length - stage, str.length)
		} else {
			newStr = str.slice(0, len) + "..."
		}

		return newStr
	}

	static setPositionX(node: Node, x) {
		node.position = new Vec3(x, node.position.y, node.position.z)
	}
	static setPositionY(node: Node, y) {
		node.position = new Vec3(node.position.x, y, node.position.z)
	}
	static setPositionZ(node: Node, z) {
		node.position = new Vec3(node.position.x, node.position.y, z)
	}
	static setNodeWidth(node: Node, w) {
		let trans = node.getComponent(UITransform)
		if (trans) {
			trans.width = w
		}
	}
	static setNodeHeight(node: Node, h) {
		let trans = node.getComponent(UITransform)
		if (trans) {
			trans.height = h
		}
	}
	static setOpacity(node: Node, o) {
		let sp = node.getComponent(Sprite)
		if (sp) {
			sp.color = new Color(sp.color.r, sp.color.g, sp.color.b, o)
			return
		}
		let op = node.getComponent(UIOpacity)
		if (op) {
			op.opacity = o
			return
		}
	}

	static getFullNum(num, fullNum = 3) {
		// return num < 10 ? `0${num}` : `${num}`
		let strNum = num.toString();
		let numLen = strNum.length;

		new Array(fullNum-numLen).fill(0).map((item)=>{
			strNum = `0${strNum}`
		})

		// return num > 10 ? (num > 99 ? `${num}` : `0${num}`) : `00${num}`;
		return strNum
	}

	// 设置按钮是否开启遮罩
	static btnMask(node, isMask) {
		let cover = node.getChildByName("cover")
		// let button = node.getComponent("ButtonPlus")

		cover.active = isMask
		// button.enabled = !isMask
	}

	static disableMask(n: Node, state) {
		if (n.name == "cover") {
			n.active = state;
		}
		if (!!n.getComponent(Label)) {
			if (state) {
				if ((n as any).oldOutLine == undefined) {
					(n as any).oldOutLine = n.getComponent(Label).outlineColor.toHEX("#rrggbb");
				}
				n.getComponent(Label).outlineColor = color(164, 164, 164);
			} else {
				if ((n as any).oldOutLine) n.getComponent(Label).outlineColor = color((n as any).oldOutLine);
			}
		}
		// if (!!n.getComponent(ButtonPlus)) {
		// 	n.getComponent(ButtonPlus).interactable = !state
		// }
		if (n.children.length != 0) {
			n.children.map(item => {
				this.disableMask(item, state);
			})
		}
	}

	static getLeftTime(times) {
		let day = 0,
			hour = 0,
			minute = 0,
			second = 0;
		if (times > 0) {
			hour = Math.floor(times / (60 * 60));
			minute = Math.floor(times / 60) - (day * 24 * 60) - (hour * 60);
			second = Math.floor(times) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
		}

		return this.patchTimeLength(hour) + ":" + this.patchTimeLength(minute) + ":" + this.patchTimeLength(second)
	}

	// 时间长度补位
	static patchTimeLength(time: number | string): string {
		const timeString = time.toString();

		return timeString.length === 1 ? '0' + timeString : timeString;
	}

	static numFloor(num, decimals = 1000) {
		return Number(Math.floor(num * decimals + 0.0000002) / decimals);
	}

	static numCeil(num, decimals = 1000) {
		return Number(Math.ceil(num * decimals - 0.0000002) / decimals);
	}

	static getRound(num, float) {
		return Number((parseInt((Number(num) * Math.pow(10, float + 1)).toString()) / Math.pow(10, float + 1)).toFixed(float))
	}

	static getEffect(text){
		let res = '';

		if(text >= 0 && text < 1) {
			res = `${this.getRound(text * 100, 2)}%`;
		} else if(text >= 1 && text <= 100) {
			res = text;
		} else {
			res = `${this.getRound(text/3600, 2)}H`;
		}

		return res
	}

	//日期格式化
	static dateFtt(fmt, date) { //author: meizz
		var o = {
			"M+": date.getMonth() + 1,
			"d+": date.getDate(),
			"h+": date.getHours(),
			"m+": date.getMinutes(),
			"s+": date.getSeconds(),
			"q+": Math.floor((date.getMonth() + 3) / 3),
			"S": date.getMilliseconds()
		};
		if (/(y+)/.test(fmt))
			fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (var k in o)
			if (new RegExp("(" + k + ")").test(fmt))
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		return fmt;
	}

	static chargeMbox() {
		if (sys.isNative) {
			NativeMgr.commonMethod(NativeMethod.jumpAPP, { method: "openPay" })
		} else {
			Common.postMessage("ShowMeTheMoney")
			window["RECHARGE_MBOX"] && window["RECHARGE_MBOX"].postMessage('');
		}
	}

	static openFarm() {
		if (sys.isNative) {
			NativeMgr.commonMethod(NativeMethod.jumpAPP, { method: "open-game" })
		} else {
			Common.postMessage("open-game",'momo-farm')
			window["RECHARGE_MBOX"] && window["RECHARGE_MBOX"].postMessage('open-game');
		}
	}

	static getDisTime(time, haveAgo = true) {
		function formatBit(val) {
			val = +val
			return val > 9 ? val : '0' + val
		}
		let min = Math.floor(time % 3600)

		let hourTime = formatBit(Math.floor(time / 3600))
		let minTime = formatBit(Math.floor(min / 60))
		let secTime = formatBit(time % 60)

		let addStr = haveAgo ? " ago" : ""

		let disTime = ""
		if (hourTime >= 24) {
			let double = Math.floor(hourTime / 24) > 1 ? "s" : ""
			disTime = Math.floor(hourTime / 24) + " day" + double + addStr
		} else if (hourTime >= 1) {
			let double = Number(hourTime) > 1 ? "s" : ""
			disTime = Number(hourTime) + " hour" + double + addStr
		} else if (minTime >= 1) {
			let double = Number(minTime) > 1 ? "s" : ""
			disTime = Number(minTime) + " min" + double + addStr
		} else if (secTime >= 1) {
			let double = Number(secTime) > 1 ? "s" : ""
			disTime = Number(secTime) + " second" + double + addStr
		}

		return disTime
	}

	static formatUserNameByLength7(name: string) {
		let strLen = name.length;
		let realLen = this.getStringLength(name);
		if (realLen > 14) {
			if (strLen * 2 <= realLen) {
				return name.substring(0, 7).concat("...");
			} else {
				return name.substring(0, strLen - 3 > 7 ? strLen - 3 : 7).concat("...");
			}
		}
		return name;
	}

	static getStringLength(str) {
		var slength = 0;
		for (let i = 0; i < str.length; i++) {
			if ((str.charCodeAt(i) >= 0) && (str.charCodeAt(i) <= 255))
				slength = slength + 1;
			else
				slength = slength + 2;
		}
		return slength;
	};

	static getShortAddr(addr) {
		if (typeof addr != "string") return "";
		return addr.substring(0, 6) + "..." + addr.substring(addr.length - 4, addr.length);
	}

	static getAtFromStr(str) {
		let arr = [];
	
		if (str) {
		  let matcher = str.match(regx);
		  if (matcher) {
			matcher.map((item) => {
			  let s = item.split("@")[1];
			  arr.push(s.slice(0, s.length - 1));
			});
		  }
		}
	
		return arr;
	}

	static keepContent(data) {
		let str = data.m || '';
		let replaceIdx = 0;
		
		let replaceArr = [];

		// 渲染表情
        // const emojiSingle = str.match(regex2);
        // if(!!emojiSingle && emojiSingle[0] === emojiSingle.input){
        //     let key = emojiSingle[1];
        //     const emojiImg = basecfg.EMOJI_CODE[key];
        //     const momojiImg = basecfg.MOMOJI_CODE[key];
            
        //     // if(emojiImg) {
        //     //     // str = `<img class="chat-single-emoji" src="assets/images/emoji/${emojiImg}.png">`;
        //     //     // str = `<img src='${key}' offset=7 />`; 
        //     //     str = `<img src='${key}' offset=7 />`; 
        //     // } else if(momojiImg){
        //     //     // str = `<img class="chat-single-momoji" src="assets/images/momoji/${momojiImg}.png">`;
        //     //     str = `<img src='${momojiImg}' offset=7 />`;
        //     // }

		// 	if(emojiImg || momojiImg) {
		// 		replaceArr.push(str);
		// 		str = `<${replaceIdx}>`;
		// 	}

        // } else {
        //     const emojiArr = str.match(regex) || [];
        //     emojiArr.map((item)=>{
        //         let key = item.match(regex2)[1];
        //         const emojiImg = basecfg.EMOJI_CODE[key];
        //         const momojiImg = basecfg.MOMOJI_CODE[key];

        //         // if(emojiImg) {
        //         //     // str = str.replaceAll(`${item}`, `<img class="chat-emoji" src="assets/images/emoji/${emojiImg}.png">`)
        //         //     str = str.replaceAll(`${item}`, `<img src='${key}' offset=7 />`)
        //         // } else if(momojiImg){
        //         //     // str = str.replaceAll(`${item}`, `<img class="chat-emoji" src="assets/images/momoji/${momojiImg}.png">`)
        //         //     str = str.replaceAll(`${item}`, `<img src='${momojiImg}' offset=7 />`)
        //         // }

		// 		if(emojiImg || momojiImg) {
		// 			str = str.replaceAll(`${item}`, `<${replaceIdx}>`);
		// 			replaceArr.push(item);
		// 			replaceIdx++;
		// 		}
        //     })
        // }

        // if(data.a){
        //     if(data.a.length && typeof data.a == "object"){

        //         const atArr = str.match(regex5);

        //         // console.log(atArr);

        //         (atArr || []).map((item)=>{
        //             // str = str.replaceAll(item, `<span style="color:#618FFC">@${item.slice(2, item.length - 2)} </span>`)
        //             // str = str.replaceAll(item, `<color=#618FFC>@${item.slice(2, item.length - 2)} </color>`)
        //             str = str.replaceAll(item, `<${replaceIdx}>`);
		// 			replaceArr.push(item);
		// 			replaceIdx++;
        //         })

        //         // console.log(str);

        //         // (data.a || []).map((item)=>{
        //         //     if(roomIdMap){
        //         //         if(roomIdMap[item]){
        //         //             const nickName = roomIdMap[item].nickName;

        //         //             str = str.replaceAll(`@${nickName}`, `<color=#618FFC>@${nickName} </color>`)     
        //         //         }
        //         //     }
        //         // })
        //     }
        // }

        // const gif = str.match(regex4);
        // if(!!gif && gif[0]){
        //     const id = gif[0].replace('[_', '').replace('_]', '');
        //     const idArr = id.split('/');

        //     if(idArr.length === 1){
        //         if(idArr[0].indexOf('stickers') != -1 && basecfg.MOMOJI_CODE[idArr[0]]){
        //             // str = `<div class="chat-gif"><img src="https://www.mobox.io/img/gifs/${idArr[0]}.gif"></div>`;

        //             // str = `<img src='${idArr[0]}' offset=7 />`;
		// 			replaceArr.push(str);
		// 			str = `<${replaceIdx}>`;
        //         }
        //     }
        // }

        // // console.log({str})

        // return {str, replaceArr, a:data.a}
	}

	static getContent(data){
        let str = data.m || '';

        // const roomIdMap = Redux.State.getState(Redux.ReduxName.chat, "roomIdMap");

        // // 渲染表情
        // const emojiSingle = str.match(regex2);
        // if(!!emojiSingle && emojiSingle[0] === emojiSingle.input){
        //     let key = emojiSingle[1];
        //     const emojiImg = basecfg.EMOJI_CODE[key];
        //     const momojiImg = basecfg.MOMOJI_CODE[key];
            
        //     if(emojiImg) {
        //         // str = `<img class="chat-single-emoji" src="assets/images/emoji/${emojiImg}.png">`;
        //         str = `<img src='${key}' offset=7 />`;
        //     } else if(momojiImg){
        //         // str = `<img class="chat-single-momoji" src="assets/images/momoji/${momojiImg}.png">`;
        //         str = `<img src='${momojiImg}' offset=7 />`;
        //     }
        // } else {
        //     const emojiArr = str.match(regex) || [];
        //     emojiArr.map((item)=>{
        //         let key = item.match(regex2)[1];
        //         const emojiImg = basecfg.EMOJI_CODE[key];
        //         const momojiImg = basecfg.MOMOJI_CODE[key];

        //         if(emojiImg) {
        //             // str = str.replaceAll(`${item}`, `<img class="chat-emoji" src="assets/images/emoji/${emojiImg}.png">`)
        //             str = str.replaceAll(`${item}`, `<img src='${key}' offset=7 />`)
        //         } else if(momojiImg){
        //             // str = str.replaceAll(`${item}`, `<img class="chat-emoji" src="assets/images/momoji/${momojiImg}.png">`)
        //             str = str.replaceAll(`${item}`, `<img src='${momojiImg}' offset=7 />`)
        //         }
        //     })
        // }

        // if(data.a){
        //     if(data.a.length && typeof data.a == "object"){

        //         const atArr = str.match(regex5);

        //         // console.log(atArr);

        //         (atArr || []).map((item)=>{
        //             // str = str.replaceAll(item, `<span style="color:#618FFC">@${item.slice(2, item.length - 2)} </span>`)
        //             str = str.replaceAll(item, `<color=#618FFC>@${item.slice(2, item.length - 2)} </color>`)
        //         })

        //         // console.log(str);

        //         // (data.a || []).map((item)=>{
        //         //     if(roomIdMap){
        //         //         if(roomIdMap[item]){
        //         //             const nickName = roomIdMap[item].nickName;

        //         //             str = str.replaceAll(`@${nickName}`, `<color=#618FFC>@${nickName} </color>`)     
        //         //         }
        //         //     }
        //         // })
        //     }
        // }

		// const pic = str.match(regex3);
		// if(!!pic && pic[0]){
		// 	if(pic[0] === str) {
		// 		const url = pic[0].replace('[*', '').replace('*]', '');
		// 		str = `[${Ext.i18n.t('Chat_11')}]`;
		// 	}
		// }

        // const gif = str.match(regex4);
        // if(!!gif && gif[0]){
        //     const id = gif[0].replace('[_', '').replace('_]', '');
        //     const idArr = id.split('/');

        //     if(idArr.length === 1){
        //         if(idArr[0].indexOf('stickers') != -1 && basecfg.MOMOJI_CODE[idArr[0]]){
        //             // str = `<div class="chat-gif"><img src="https://www.mobox.io/img/gifs/${idArr[0]}.gif"></div>`;
        //             str = `<img src='${idArr[0]}' offset=7 />`;
        //         } else {
		// 			str = `[${Ext.i18n.t('Chat_11')}]`;
		// 		}
        //     }
        // }

        // // console.log({str})

        // return str
    }

	static getLeftTimeObj(times){
		let hour=0,
		  minute=0,
		  second=0;
		let hourStr = "",minStr = "",secStr = ""
		if(times > 0){
		  hour = Math.floor(times / (60 * 60));
		  minute = Math.floor((times - (hour * 60 * 60))/60);
		  second = times - (hour * 60 * 60)-(minute * 60)
		}
		return {hour,minute,second}
	}

	static getTimeByHours(times){
		let hour=0,
		  minute=0,
		  second=0;
		let hourStr = "",minStr = "",secStr = ""
		if(times > 0){
		  hour = Math.floor(times / (60 * 60));
		  minute = Math.floor((times - (hour * 60 * 60))/60);
		  second = times - (hour * 60 * 60)-(minute * 60)
		}
		hour <= 9?hourStr = '0' + hour:hourStr = '' + hour;
		minute <= 9?minStr = '0' + minute:minStr = '' + minute;
		second <= 9?secStr = '0' + second:secStr = '' + second;
		return hourStr+":"+minStr+":"+secStr
	}

	static getTimeByMin(times){
		let minute=0,
		  second=0;
		let minStr = "",secStr = ""
		if(times > 0){
		  minute = Math.floor((times )/60);
		  second = times -(minute * 60)
		}
		minute <= 9?minStr = '0' + minute:minStr = '' + minute;
		second <= 9?secStr = '0' + second:secStr = '' + second;
		return minStr+":"+secStr
	}

	static getNewHase(lv){
		let hash = 0
		let stepStartPre = 1637640000;
		let setpSec = 2592000;
		let now = Math.floor(Date.now()/1000) 
		let step = Math.floor((now-stepStartPre)/setpSec)
		step = step<60?step:60
		if(lv == 4){
			hash = Math.floor(((Math.floor((step-8)/2)*10+10) +((step-2)*10+80))/2)
		}else if(lv == 5){
			hash = Math.floor(((Math.floor((step-8)/2)*20+50) +((step-1)*20+150))/2)
		}else if(lv == 6){
			hash = (step-1)*10+90
		}
		return hash
	}

	static getVectorRadians(sPos, ePos){
		//计算出朝向
		var dx = ePos.x - sPos.x;
		var dy = ePos.y - sPos.y;
		var dir = new Vec2(dx, dy);
  
		//根据朝向计算出夹角弧度
		var angle = dir.signAngle(new Vec2(1,0));
  
		//将弧度转换为欧拉角
		var degree = angle / Math.PI * 180;
  
		return -degree
	}

	static formatEngNumber(number: any, decimals: number = 2,hasK=true): string {
		var str: string;
		var num: number;
		number = <number><any>number;
		let prefix = ""
		if(number<0){
			prefix = "-"
			number = -number
		}
  
		if (number >= 1000000000) {
			num = number / 1000000000;
			str = (Math.floor(num / 0.001) * 0.001).toFixed(decimals);
			return prefix+this.formatEndingZero(str) + "B";
		}else if (number >= 1000000) {
			num = number / 1000000;
			str = (Math.floor(num / 0.001) * 0.001).toFixed(decimals);
			return prefix+this.formatEndingZero(str) + "M";
		}else if (number >= 1000&&hasK) {
			num = number / 1000;
			str = (Math.floor(num / 0.001) * 0.001).toFixed(decimals);
			return this.formatEndingZero(str) + "K";
		}
		else {
			return prefix+this.convertNum(number,decimals);
		}
	}
	static endWith(c: string, suffix: string): boolean {
		return (suffix == c.substring(c.length - suffix.length));
	}
	static convertNum(money, decimals: number = 2) {
	  let s = money.toString().split('.'); /**获取小数型数据**/
	  let deciStr:string = s[1]
	  return Number(s[0]).toLocaleString() + (s[1] ? `.${deciStr.substr(0,decimals)}` : '')
	}

	static formatEndingZero(c: string): string {
		if (c.indexOf(".") != -1) {
		  if (this.endWith(c, "000")) {
			c = c.substring(0, c.length - 3);
		  } else if (this.endWith(c, "00")) {
			c = c.substring(0, c.length - 2);
			} else if (this.endWith(c, "0")) {
			  c = c.substring(0, c.length - 1);
			}
		}
		if(c.endsWith(".")){
		  c = c.substring(0, c.length - 1);
		}
  
		return c;
	}
	
	static async setNodeSpineFromeRemote(spineUrl: string, node:Node, cb, cb2 = null){
		spineUrl = spineUrl.replace("momo/","spine/")
		spineUrl= "/"+spineUrl
		let image = spineUrl+".png"
		let atlas = spineUrl+".atlas"
		let ske = spineUrl+".json"
		let sk = node.getComponent(sp.Skeleton)
		let arr = image.split('/');
		let textureNames = arr[arr.length - 1];
		loader.load(image, (error, texture) => {
			loader.load({ url: atlas, type: 'txt' }, (error, atlasJson) => {
				loader.load({ url: ske, type: 'txt' }, (error, spineJson) => {
				  if(sk.isValid){
					var asset = new sp.SkeletonData();
					texture.name = [spineUrl+".png"]
					asset.skeletonJson = spineJson;
					asset.atlasText = atlasJson;
					asset.textures = [texture];
					asset["textureNames"] = [textureNames];
					sk.skeletonData = asset;
					if(cb){
					  cb(0)
					}
				  }
				});
			});
		});
	  }

	  static getAttrNameByType(type: ConstEnum.AttrType) {
		let value = ""
		switch (type) {
			case ConstEnum.AttrType.Attack:
				value = Ext.i18n.t("UI_Details_01_001")
				break;
			case ConstEnum.AttrType.Defense:
				value = Ext.i18n.t("UI_Details_01_002")
				break;
			case ConstEnum.AttrType.HP:
				value = Ext.i18n.t("UI_Details_01_003")
				break;
			case ConstEnum.AttrType.Speed:
				value = Ext.i18n.t("UI_Details_01_004")
				break;
			case ConstEnum.AttrType.TrumpRate:
				value = Ext.i18n.t("UI_Details_01_005")
				break;
			case ConstEnum.AttrType.DodgeRate:
				value = Ext.i18n.t("UI_Details_01_006")
				break;
			case ConstEnum.AttrType.ComboRate:
				value = Ext.i18n.t("UI_Details_01_007")
				break;
			case ConstEnum.AttrType.CounterRate:
				value = Ext.i18n.t("UI_Details_01_008")
				break;
				case ConstEnum.AttrType.BloodRate:
				value = Ext.i18n.t("UI_Details_01_009")
				break;
			case ConstEnum.AttrType.StunRate:
				value = Ext.i18n.t("UI_Details_01_010")
				break;
			case ConstEnum.AttrType.RsTrumpRate:
				value = Ext.i18n.t("UI_Details_01_011")
				break;
			case ConstEnum.AttrType.RsDodgeRate:
				value = Ext.i18n.t("UI_Details_01_012")
				break;
			case ConstEnum.AttrType.RsComboRate:
				value = Ext.i18n.t("UI_Details_01_013")
				break;
			case ConstEnum.AttrType.RsCounterRate:
				value = Ext.i18n.t("UI_Details_01_014")
				break;
			case ConstEnum.AttrType.RsBloodRate:
				value = Ext.i18n.t("UI_Details_01_015")
				break;
			case ConstEnum.AttrType.RsStunRate:
				value = Ext.i18n.t("UI_Details_01_016")
				break;
			case ConstEnum.AttrType.DmgExtRate:
				value = Ext.i18n.t("UI_Details_01_017")
				break;
			case ConstEnum.AttrType.RsDmgExtRate:
				value = Ext.i18n.t("UI_Details_01_018")
				break;
			case ConstEnum.AttrType.TrumpDmgRate:
				value = Ext.i18n.t("UI_Details_01_019")
				break;
			case ConstEnum.AttrType.RsTrumpDmgRate:
				value = Ext.i18n.t("UI_Details_01_020")
				break;
			case ConstEnum.AttrType.CureRate:
				value = Ext.i18n.t("UI_Details_01_021")
				break;
			// case ConstEnum.AttrType.RsCureRate:
			// 	value = Ext.i18n.t("UI_Details_01_022")
			// 	break;
			case ConstEnum.AttrType.BlockRate:
				value = Ext.i18n.t("UI_Details_01_023")
				break;
			case ConstEnum.AttrType.RsBlockRate:
				value = Ext.i18n.t("UI_Details_01_024")
				break;
			case ConstEnum.AttrType.PierceRate:
				value = Ext.i18n.t("UI_Details_01_025")
				break;
			case ConstEnum.AttrType.RsPierceRate:
				value = Ext.i18n.t("UI_Details_01_026")
				break;
			
			
		}
		return value
	}

    CopyTextEvent(input) {

        const el = document.createElement('textarea');

        el.value = input;

        // Prevent keyboard from showing on mobile
        el.setAttribute('readonly', '');

        el.style.contain = 'strict';
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        el.style.fontSize = '12pt'; // Prevent zooming on iOS

        const selection = getSelection();
        let originalRange;
        if (selection.rangeCount > 0) {
            originalRange = selection.getRangeAt(0);
        }

        document.body.appendChild(el);
        el.select();

        // Explicit selection workaround for iOS
        el.selectionStart = 0;
        el.selectionEnd = input.length;

        let success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) {
            console.log(err)
        }

        document.body.removeChild(el);

        if (originalRange) {
            selection.removeAllRanges();
            selection.addRange(originalRange);
        }


        console.log("拷贝文本 success=" + success);
    }

	//计算战力值
	static computeFightPower(AttrArr:Array<AttrInfo>){
		let arr:Array<number> = new Array(EnumUtils.getNames(AttrType).length).fill(0);
		AttrArr.forEach(ele =>{
			arr[ele.attrId] = ele.attrVal;
		})
		return CommUtil.calcBattlePower(arr);
		// let atk:number = 0;
		// let defense:number = 0;
		// let spd:number = 0;
		// let hp:number = 0;
		// let allRate:number = 0;
		// let fightPower:number = 0;
		// AttrArr.forEach((ele) => {
		// 	if(ele.attrId == ConstEnum.AttrType.Attack)
		// 		atk = ele.attrVal
		// 	else if(ele.attrId == ConstEnum.AttrType.Defense)
		// 		defense = ele.attrVal
		// 	else if(ele.attrId == ConstEnum.AttrType.Speed)
		// 		spd = ele.attrVal
		// 	else if(ele.attrId == ConstEnum.AttrType.HP)
		// 		hp = ele.attrVal
		// 	else if(ele.attrId >= ConstEnum.AttrType.TrumpRate && ele.attrId <= ConstEnum.AttrType.RsPierceRate)
		// 		allRate += ele.attrVal
		// })

		// fightPower = Math.floor((atk + defense + spd + (hp / 5)) * (1 + allRate /100))
		// return fightPower;
	}
}
