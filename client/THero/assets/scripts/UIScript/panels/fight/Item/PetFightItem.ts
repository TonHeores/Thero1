
import ResMgr from "../../../../UIFrame/ResMgr";
import { Binder, UIListItem, UIManager, bindComp } from "../../../../UIFrame/indexFrame";
import FightMgr, { ActionType, BufEffectType, SkillType, SpecActType } from "../../../../module/fight/FightMgr";
import Common from "../../../../utils/common";
import { _decorator, Component, instantiate, Label, ProgressBar, warn, Node, tween, Vec3, Sprite, color, UITransform, UIOpacity, Tween, Animation, AnimationClip, AnimationState, Vec2, sp, SpriteFrame } from "cc";
import Ext from "../../../../utils/exts";
import CocosHelper from "../../../../UIFrame/CocosHelper";
import { EFFACT_WORLD_COLOR, FIGHT_ANI_NAME, SOUND_RES } from "../../../../config/basecfg";
import { ConfigHelper } from "../../../../utils/ConfigHelper";
import { resourceUtil } from "../../../../UIFrame/resourceUtil";
import Constants from "../../../../Constant";
import SoundMgr from "../../../../UIFrame/SoundMgr";
import ConstEnum from "../../../../utils/EnumeDefine";


export enum PetFightItemSide {
	left = 0,
	right,
}
export enum PetActType { //1待机 2普通攻击 3施法攻击 4被攻击
	Idle = 1, //待机
	Normal,   //普通攻击
	SkillUse, //施法攻击
	Def,   //被攻击
	SkillDef,   //被技能攻击
}
const { ccclass, property } = _decorator;
@ccclass
export default class PetFightItem extends Component {

	public static itemTypeLeft = 0
	public static ItemTypeRight = 1

	static PrefabPath = "fight/Item/PetFightItem"

	@bindComp("cc.Node")
	grp: Node = null;
	@bindComp("cc.Node")
	petIcon: Node = null;
	@bindComp("cc.ProgressBar")
	broodBar: ProgressBar = null;
	@bindComp("cc.Node")
	shieldNode: Node = null;
	@bindComp("cc.Node")
	momoGrp: Node = null;
	@bindComp("cc.Node")
	private popPrefab: Node = null;
	@bindComp("cc.Node")
	private petAniShadow: Node = null;
	@bindComp("cc.Node")
	petSpine: Node = null;
	@bindComp("cc.Node")
	topGrp: Node = null;
	@bindComp("cc.Node")
	head: Node = null;
	@bindComp("cc.Node")
	stateSpine: Node = null;
	@bindComp("cc.Node")
	stateGrp: Node = null;
	@bindComp("cc.Node")
	private buffGrp: Node = null;
	@bindComp("cc.Node")
	private buffPrefab: Node = null; //用于显示攻击的特效
	@bindComp("cc.Animation")
	petAni: Animation = null; //幻兽本身的动作
	@bindComp("cc.Animation")
	atkEftNode: Animation = null; //攻击以及特效
	@bindComp("cc.Animation")
	private defEftNode: Animation = null; //用于显示技能特效


	// broodNum: Label = null;
	typeIcon: Node = null;

	private data = null
	private uid = 0
	private hpMax = 0;
	private hp = 0;
	private protoId = 0;
	private type: PetFightItemSide = 0; //为0时在左边，为进攻方 为1时在右边为防守方
	public popArr = [];
	private t1 = null as any;

	private buffArr = {};//buff的状态 key为buffid，值为剩余回合数

	private oriPos = new Vec3(0, 0, 0)

	private isAttacking = false;//正在攻击
	private isChangeScaleX = false;
	dieCb: Function = null
	loadCb: Function = null
	actCb: Function = null //当前等待的cb
	//type 为0生成左边的item 为1右边的item
	public static async creatItem(type: PetFightItemSide) {
		let prePath = UIManager.getPrefedPath(this.PrefabPath)
		let pre = await ResMgr.inst.loadForm(prePath);
		if (!pre) {
			warn(`${this.PrefabPath} 资源加载失败, 请确认路径是否正确`);
			return;
		}

		let node: Node = instantiate(pre);
		let baseUI = node.addComponent(PetFightItem);
		Binder.bindComponent(baseUI)
		baseUI.type = type;
		if (baseUI.type == PetFightItemSide.left) {
			baseUI.petIcon.scale = new Vec3(1, 1, 1)
			baseUI.petSpine.scale = new Vec3(1*Math.abs(baseUI.petSpine.scale.x), baseUI.petSpine.scale.y,  baseUI.petSpine.scale.z)
		} else {
			baseUI.petIcon.scale = new Vec3(-1, 1, 1)
			baseUI.petSpine.scale = new Vec3(-1*Math.abs(baseUI.petSpine.scale.x), baseUI.petSpine.scale.y,  baseUI.petSpine.scale.z)
		}
		baseUI.broodBar.node.active = true
		return baseUI
	}

	initData(data, dieCb: Function, loadCb: Function) {
		console.log("initData ======", data)
		this.data = data;
		this.dieCb = dieCb
		this.loadCb = loadCb
		this.hpMax = data.HP;
		this.hp = data.HP;
		// this.broodNum.string = this.hpMax + "";
		this.protoId = data.id;
		this.uid = data.uid;
	}

	onLoad() {
		this.broodBar.progress = this.hp / this.hpMax;
		this.t1 = setInterval(this.popTimeFun.bind(this), 100)
		this.initAni();
		// this.initBuffGrp()
	}

	loadSkillAnis(skillArr) {
		// skillArr.forEach(element => {
		// 	let cfg = ConfigHelper.getCfg("SkillSmplCfg", element)
		// 	if (cfg.skillEffect != "") {
		// 		let skillAni = "atlas/skill/" + cfg.skillEffect
		// 		resourceUtil.loadAniFromAtlas(skillAni, this.defEftNode, element, AnimationClip.WrapMode.Normal, 8, this.loadAniCb.bind(this))
		// 	}
		// });
	}

	async initAni() {
		// console.log("initani ", this.data)
		// let cfg = ConfigHelper.getCfg("PetCfg", this.protoId);
		// Common.setNodeImgSprite(`attribute/${cfg.petType}`, this.typeIcon);
		if (Constants.gamePetAniType == 0) {
			this.petIcon.active = true;
			this.petAni.node.active = false;
			this.petSpine.active = false
			// this.petAniShadow.active = false;
			// let imgname = (this.data.id % 7 + 30001) + ""
			let imgname = (this.data.id) + ""
			let self = this
			Common.setNodeImgSprite(`Pet_fight/${imgname}`, this.petIcon, null, (res) => {
				console.log("setNodeImgSprite imgUrl2=" + imgname)
				let posy = self.petIcon.getComponent(Sprite).spriteFrame.rect.height + self.petIcon.position.y
				Common.setPositionY(self.topGrp, posy)
			});
			// Common.setNodeImgSprite(`Pet_fight/${imgname}`, this.petIcon);
		} else if (Constants.gamePetAniType == 1) {
			this.petIcon.active = false;
			this.petAni.node.active = true;
			this.petSpine.active = false
			// this.petAniShadow.active = true;
			//初始化幻兽序列帧
			let subFix = (this.type == PetFightItemSide.right ? 1 : 2)
			let petId = (this.data.id % 5 + 1)
			let petFolder = "atlas/pet/pet" + petId
			let petIdleAni = petFolder + "/idle/pet1_" + subFix
			await resourceUtil.loadAniFromAtlas(petIdleAni, this.petAni, FIGHT_ANI_NAME.PETIDLE, AnimationClip.WrapMode.Loop, 4, this.loadAniCb.bind(this))
			let petWalkAni = petFolder + "/walk/pet1_" + subFix
			await resourceUtil.loadAniFromAtlas(petWalkAni, this.petAni, FIGHT_ANI_NAME.PETWALK, AnimationClip.WrapMode.Loop, 4, this.loadAniCb.bind(this))
			this.playAni(this.petAni, FIGHT_ANI_NAME.PETWALK)
		} else if (Constants.gamePetAniType == 2) {
			this.petIcon.active = false;
			this.petAni.node.active = false;
			this.petSpine.active = true
			let spineUrl = "character/banrenma/banrenma"
			if(this.type == PetFightItemSide.left){
				spineUrl = "character/long/long"
			}
			let self = this
			Common.setNodeSpine(spineUrl, this.petSpine, () => {
				let spine: sp.Skeleton = self.petSpine.getComponent(sp.Skeleton)
				spine.timeScale = FightMgr.getAccTime()
				spine.setCompleteListener(this.momoSpineEventCallback.bind(self))
				Common.setPositionY(self.topGrp, 100)
				this.showMomoAct(1)
				if (this.loadCb) {
					this.loadCb()
				}
			});
		}

		//初始化攻击技能序列帧
		let normalAtk = "atlas/fight/normalAtk"
		await resourceUtil.loadAniFromAtlas(normalAtk, this.defEftNode, FIGHT_ANI_NAME.DEF, AnimationClip.WrapMode.Normal, 16, this.loadAniCb.bind(this))
		let useSkill = "atlas/fight/useSkill"
		await resourceUtil.loadAniFromAtlas(useSkill, this.atkEftNode, FIGHT_ANI_NAME.SKILL, AnimationClip.WrapMode.Normal, 16, this.loadAniCb.bind(this))

		this.atkEftNode.on(Animation.EventType.FINISHED, this.onAtkAniFinish, this);
		this.defEftNode.on(Animation.EventType.FINISHED, this.onDefAniFinish, this);
		if (this.loadCb) {
			this.loadCb()
		}
	}

	loadAniCb(aniName) {
		// console.log("loadAniCb ==============aniname=" + aniName)
	}

	onAtkAniFinish(n1, n2: AnimationState) {
		let aniName = n2.clip.name
		this.atkEftNode.node.active = false
	}

	onDefAniFinish(n1, n2: AnimationState) {
		let aniName = n2.clip.name
		this.defEftNode.node.active = false
	}

	//momo 动作spine 回调函数 
	momoSpineEventCallback(trackEntry,loopName){
		if(trackEntry.animation.name != 'idle'){
			this.showMomoAct(PetActType.Idle)
			if(this.actCb){
				this.actCb()
				this.actCb = null
			}
		}	
	}

	//展示momo动作 1待机 2普通攻击 3施法攻击
	async showMomoAct(type: PetActType) {
		Tween.stopAllByTarget(this.petIcon);
		if (type == PetActType.Normal) {
			if (Constants.gamePetAniType == 0) {
				let delx = 50;
				if (this.type == PetFightItemSide.right) {
					delx = -50
				}
				let tw1 = tween().to(0.1, { position: this.petIcon.position.clone().add(new Vec3(delx, 0, 0)) });
				let tw2 = tween().to(0.1, { position: this.petIcon.position.clone().add(new Vec3(0, 0, 0)) });
				await CocosHelper.runTweenSync(this.petIcon, tw1, tw2)
			} else if (Constants.gamePetAniType == 1) { }
			else if (Constants.gamePetAniType == 2) {
				let aniName = 'attack'
				let spine:sp.Skeleton = this.petSpine.getComponent(sp.Skeleton)
				spine.timeScale = FightMgr.getAccTime()
				let track:sp.spine.TrackEntry = spine.setAnimation(0, aniName, false);
				// spine.setTrackCompleteListener(track,this.momoSpineEventCallback.bind(this))
				await Common.sleep(500 / FightMgr.getAccTime())
			}
		} else if (type == PetActType.SkillUse) {
			if (Constants.gamePetAniType == 0) {

			} else if (Constants.gamePetAniType == 1) {
				this.playAni(this.atkEftNode, FIGHT_ANI_NAME.SKILL)
			}
			else if (Constants.gamePetAniType == 2) {
				let aniName = 'attack'
				let spine:sp.Skeleton = this.petSpine.getComponent(sp.Skeleton)
				spine.timeScale = FightMgr.getAccTime()
				let track:sp.spine.TrackEntry = spine.setAnimation(0, aniName, false);
				await Common.sleep(2000 / FightMgr.getAccTime())
				// spine.setTrackCompleteListener(track,this.momoSpineEventCallback.bind(this))
			}
		} else if (type == PetActType.Idle) {
			if (Constants.gamePetAniType == 0) {
				tween().repeatForever()

				let tw1 = tween().to(1, { position: new Vec3(0, -85, 0) });
				let tw2 = tween().to(1, { position: new Vec3(0, -90, 0) });
				CocosHelper.runRepeatTweenSync(this.petIcon, -1, tw1, tw2)
			} else if (Constants.gamePetAniType == 1) {
				this.playAni(this.petAni, FIGHT_ANI_NAME.PETIDLE)
			} else if (Constants.gamePetAniType == 2) {
				let aniName = 'Stand'
				let spine:sp.Skeleton = this.petSpine.getComponent(sp.Skeleton)
				spine.timeScale = FightMgr.getAccTime()
				let track:sp.spine.TrackEntry = spine.setAnimation(0, aniName, true);
				// spine.setTrackCompleteListener(track,this.momoSpineEventCallback.bind(this))
			}
		} else if (type == PetActType.Def) {
			SoundMgr.inst.playEffect(SOUND_RES.HIT)
			if (Constants.gamePetAniType == 0) {
				let angle = -30;
				if (this.type == PetFightItemSide.left) {
					angle = 30
				}
				let tw1 = tween().to(0.1 / FightMgr.getAccTime(), { eulerAngles: new Vec3(0, 0, angle) }, { easing: 'cubicOut' })
				let tw2 = tween().to(0.1 / FightMgr.getAccTime(), { eulerAngles: new Vec3(0, 0, 0) }, { easing: 'cubicOut' }).call(() => {
					this.setIdell(true)
				})
				let aniNode = null
				if (Constants.gamePetAniType == 0) {
					aniNode = this.petIcon
				} else {
					aniNode = this.petAni.node
				}
				CocosHelper.runTweenSync(aniNode, tw1, tw2);
			} else if (Constants.gamePetAniType == 1) {
				this.playAni(this.defEftNode, FIGHT_ANI_NAME.DEF)
			} else if (Constants.gamePetAniType == 2) {
				let aniName = 'Affected'
				let spine:sp.Skeleton = this.petSpine.getComponent(sp.Skeleton)
				spine.timeScale = FightMgr.getAccTime()
				let track:sp.spine.TrackEntry = spine.setAnimation(0, aniName, false);
				await Common.sleep(2000 / FightMgr.getAccTime())
				// spine.setTrackCompleteListener(track,this.momoSpineEventCallback.bind(this))
			}
		} else if (type == PetActType.SkillDef) {
			SoundMgr.inst.playEffect(SOUND_RES.HIT)
			if (Constants.gamePetAniType == 0) {
				let angle = 30;
				let delx = 50
				if (this.type == PetFightItemSide.right) {
					angle = -30
					delx = -50
				}
				let aniNode = null
				if (Constants.gamePetAniType == 0) {
					aniNode = this.petIcon
				} else {
					aniNode = this.petAni.node
				}
				let tw1 = tween().to(0.1 / FightMgr.getAccTime(), { eulerAngles: new Vec3(0, 0, angle) }, { easing: 'cubicOut' })
				let tw2 = tween().to(0.1 / FightMgr.getAccTime(), { eulerAngles: new Vec3(0, 0, 0) }, { easing: 'cubicOut' })
				CocosHelper.runTweenSync(aniNode, tw1, tw2);
			} else if (Constants.gamePetAniType == 1) {
				this.playAni(this.defEftNode, FIGHT_ANI_NAME.DEF)
			} else if (Constants.gamePetAniType == 2) {
				let aniName = 'Affected'
				let spine:sp.Skeleton = this.petSpine.getComponent(sp.Skeleton)
				spine.timeScale = FightMgr.getAccTime()
				let track:sp.spine.TrackEntry = spine.setAnimation(0, aniName, false);
				await Common.sleep(2000 / FightMgr.getAccTime())
				// spine.setTrackCompleteListener(track,this.momoSpineEventCallback.bind(this))
			}
		}
	}

	playAni(animation: Animation, aniName) {
		animation.node.active = true
		animation.play(aniName)
	}

	//展示攻击受击特效 1普攻 2技能攻击 3buff生效
	async showBeAttackAni(type, skillId) {
		if (type == 1) {
			this.showMomoAct(PetActType.Def)
		} else if (type == 2) {
			this.showSkillEffect(skillId + "")
			await Common.sleep(600 / FightMgr.getAccTime())
			this.showMomoAct(PetActType.SkillDef)
		} else {

		}
	}

	showSkillEffect(aniName) {
		this.playAni(this.defEftNode, aniName)
	}

	public initOripos() {
		this.oriPos = this.node.position.clone()
		// console.log("iniOripos=" + JSON.stringify(this.oriPos))
	}

	popTimeFun() {
		if (this.popArr.length != 0) {
			let obj = this.popArr.shift();
			let pop = instantiate(this.popPrefab);
			Common.setLableNodeText(obj.txt, pop, obj.color);
			pop.active = true;
			this.addToCanvas(pop);
		}
	}

	public getProtoID() {
		return this.protoId
	}

	addToCanvas(node: Node) {
		let container = this.node.parent;
		let realVec3 = container.getComponent(UITransform).convertToNodeSpaceAR(this.node.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(0, 0, 0)));
		container.addChild(node);
		node.position = new Vec3(realVec3.x, realVec3.y + this.node.getComponent(UITransform).height / 3, 0)
		// node.x = realVec3.x;
		// node.y = realVec3.y + this.node.getComponent(UITransform).height/3;
		node.setSiblingIndex(999)
		node.scale = new Vec3(0, 0, 0)

		let random = Math.floor(Math.random() * 3 + 5) / 10;
		let tw1 = tween().to(0.15 / FightMgr.getAccTime(), { scale: new Vec3(1.3, 1.3, 1) }, { easing: 'cubicOut' })
		let tw2 = tween().to(0.05 / FightMgr.getAccTime(), { scale: new Vec3(1.3, 1.3, 1) }, { easing: 'cubicOut' })
		let tw3 = tween().by(random / FightMgr.getAccTime(), { position: new Vec3(0, 150, 0), }, { easing: 'cubicOut' })
		CocosHelper.runTweenSync(node, tw1, tw2, tw3);
		let tw4 = tween().delay(0.2);
		let a: Node;
		let tw5 = tween().to(random, { opacity: 0 }).call(() => {
			node.removeFromParent()
		})
		CocosHelper.runTweenSync(node.getComponent(UIOpacity), tw4, tw5);
	}

	// public attackFinish(){
	// 	this.isAttacking = false
	// }

	private isNoReturn = false
	//atkcb 是攻击动作结束  actcb是回合结束
	public async attack(atkData, momoDic, isOver = true, actCb) {
		// atkData = this.handleAtkData(atkData)
		let { suffers, skillId, actionType } = atkData;
		if (actionType == ActionType.None) {
			actCb()
		}
		let targetArr = [] //攻击的对象
		suffers.forEach(element => {
			let pos = FightMgr.getPosByData(element.dstUnit)
			let defObj: PetFightItem = momoDic[pos];
			if (defObj.uid != this.data.uid) {
				targetArr.push(element)
			}
		});
		// let oriZ = this.node.getSiblingIndex()
		// console.log("oriZ==========="+oriZ)
		let oriZ = 0
		this.isAttacking = true
		if (actionType == ActionType.Attack) { //普攻 暂时都搞成近战普攻 没有远程普攻
			if (targetArr.length == 1) { //普攻 一个的话 要冲过去
				var defItem = targetArr[0]
				let pos = FightMgr.getPosByData(defItem.dstUnit)
				let defObj: PetFightItem = momoDic[pos];
				this.node.setSiblingIndex(99);
				defObj.node.setSiblingIndex(oriZ)
				await this.jumpToTarget(defObj)
				await this.showMomoAct(PetActType.Normal)
				this.isNoReturn = true
			} else { //多个对象的话  要发射子弹 暂时没有这种情况

			}
		} else if (actionType == ActionType.Skill) { //  使用技能
			await this.showMomoAct(PetActType.SkillUse)
			let skill = ConfigHelper.getCfg("SkillSmplCfg", skillId);
			// console.log("skill=============",skill)
			this.showFlyWord(Ext.i18n.t(skill.skillName), skill.skillType == SkillType.ActiveSkill ? EFFACT_WORLD_COLOR.SKILLNAME_MAIN : EFFACT_WORLD_COLOR.SKILLNAME_MAIN);
			// await Common.sleep(600 / FightMgr.getAccTime())
			let hasInjure = false
			suffers.map(defItem => {
				defItem.effects.forEach(element => {
					if (element.type == 1) {
						hasInjure = true
					}
				});
			});
			if (hasInjure) {
				await Common.sleep(600 / FightMgr.getAccTime())
			}
		} else if (actionType == ActionType.Buff) { //  buff生效
		} else if (actionType == ActionType.Cure) { //  治疗
		} else if (actionType == ActionType.Combo) { //  连击
			var defItem = targetArr[0]
			let pos = FightMgr.getPosByData(defItem.dstUnit)
			let defObj: PetFightItem = momoDic[pos];
			this.node.setSiblingIndex(99);
			defObj.node.setSiblingIndex(oriZ)
			await this.showMomoAct(PetActType.Normal)
		} else if (actionType == ActionType.Counter) { //  反击 对方普攻
			var defItem = targetArr[0]
			let pos = FightMgr.getPosByData(defItem.dstUnit)
			let defObj: PetFightItem = momoDic[pos];
			this.node.setSiblingIndex(99);
			defObj.node.setSiblingIndex(oriZ)
			await this.showMomoAct(PetActType.Normal)
		}

		if (suffers.length != 0) {
			//播放受击动效
			suffers.map(defItem => {
				this.startDef(defItem, atkData, momoDic)
			});
			await Common.sleep(200 / FightMgr.getAccTime())
			// //如果一系列的连击，反击结束，就要返回位置
			// if (isOver && this.isNoReturn) {
			// 	await Common.sleep(300 / FightMgr.getAccTime())
			// 	await this.backToOriginPos()
			// 	this.isNoReturn = true
			// 	this.node && this.node.setSiblingIndex(oriZ);
			// }

			// if(isOver){
			// 	await Common.sleep(1000 / FightMgr.getAccTime())
			// }else{
			// 	await Common.sleep(200 / FightMgr.getAccTime())
			// }
			// this.isAttacking = false
			// actCb()
			// this.setIdell(true)

			// //如果是反击结束后 开始一个新的动作循环 则要让对方回位
			// if (actionType == ActionType.Counter && isOver) { 
			// 	var defItem = targetArr[0]
			// 	let pos = FightMgr.getPosByData(defItem.dstUnit)
			// 	let defObj: PetFightItem = momoDic[pos];
			// 	await defObj.backToOriginPos()
			// 	defObj.node.setSiblingIndex(oriZ);
			// }

			if (isOver) {
				if (actionType == ActionType.Counter) {
					var defItem = targetArr[0]
					let pos = FightMgr.getPosByData(defItem.dstUnit)
					let defObj: PetFightItem = momoDic[pos];
					await defObj.backToOriginPos()
					defObj.node.setSiblingIndex(oriZ);
				}
				if (this.isNoReturn) {
					// await Common.sleep(300 / FightMgr.getAccTime())
					await this.backToOriginPos()
					this.isNoReturn = true
					this.node && this.node.setSiblingIndex(oriZ);
				}
			}
			// await Common.sleep(1000 / FightMgr.getAccTime())
			this.isAttacking = false
			actCb()
			this.setIdell(true)
		} else {
			this.isAttacking = false
			actCb()
			this.setIdell(true)
		}
	}

	//处理行动产生的效果
	async startDef(defItem, atkData, momoDic) {
		let { skillId, actionType } = atkData;
		let pos = FightMgr.getPosByData(defItem.dstUnit)
		let defObj: PetFightItem = momoDic[pos];
		for (let i = 0; i < defItem.effects.length; i++) {
			let element = defItem.effects[i]
			let { type } = element
			if (type == BufEffectType.Damage) { //伤害 要播放受击动作
				if (skillId != 0) { //使用技能的话要多等待 一些时间 等待技能特效播放完
					defObj.showBeAttackAni(ActionType.Skill, skillId)
					await Common.sleep(500 / FightMgr.getAccTime())
				} else {
					defObj.showBeAttackAni(ActionType.Attack, 0)
				}
			}
			defObj.ShowAtkEffect(element, actionType, skillId)
		}
	}

	//1,卡牌飞到目标位置攻击，近战单体
	async jumpToTarget(target: PetFightItem) {
		let isSameSide = target.getType() == this.type
		let targetVec3 = target.node.position
		let del = 0;
		let delx = 50
		let nodeWidth = 150
		if (this.type == PetFightItemSide.left) {
			del = -nodeWidth / 2 - delx
		} else {
			del = nodeWidth / 2 + delx
		}
		let targetX = targetVec3.x + del;

		let tw = tween().to(0.2 / FightMgr.getAccTime(), { position: new Vec3(targetX, targetVec3.y, 0) }, { easing: 'cubicOut' })
		await CocosHelper.runTweenSync(this.node, tw);
	}

	//近战单体攻击后回到原位置
	async backToOriginPos() {
		if (this.isChangeScaleX) {
			this.isChangeScaleX = false
			this.changeScaleX()
		}
		let tw = tween().to(0.2 / FightMgr.getAccTime(), { position: new Vec3(this.oriPos.x, this.oriPos.y, 0) }, { easing: 'cubicOut' })
		await CocosHelper.runTweenSync(this.node, tw);
		this.isNoReturn = true
	}

	private changeScaleX() {
		// this.momoSpine.scaleX = - this.momoSpine.scaleX
		// this.attackSpine.scaleX = - this.attackSpine.scaleX
	}

	//显示飘字
	showEffectWorld(effect) {
		let { type, attr, dmgType, val } = effect
		let showText = "";
		let color = EFFACT_WORLD_COLOR.BASE;

		// //设置克制和暴击颜色
		// if(isCrit) color = EFFACT_WORLD_COLOR.CIRT;
		// if(isKezhi) color = EFFACT_WORLD_COLOR.KEZHI;

		switch (type) {
			case BufEffectType.Damage:
				showText += "-" + val;
				color = EFFACT_WORLD_COLOR.CIRT;
				break;
			case BufEffectType.Cure: //治疗
				showText += "+" + val;
				color = EFFACT_WORLD_COLOR.ADDHP;
				break;
			case BufEffectType.AddAttr: //属性增益
				var attrName = Common.getAttrNameByType(attr)
				let preStr = val >= 0 ? "+" : ""
				showText += preStr + val + " " + attrName;
				color = val > 0 ? EFFACT_WORLD_COLOR.ADDHP : EFFACT_WORLD_COLOR.BASE;
				break;
			default:
				console.log("Flyworld etype error");
				break;
		}

		this.showFlyWord(showText, color);
	}

	setRun() {
		tween().repeatForever()
		let tw1 = tween().to(0.3, { position: new Vec3(0, -80, 0) });
		let tw2 = tween().to(0.3, { position: new Vec3(0, -90, 0) });
		CocosHelper.runRepeatTweenSync(this.petIcon, -1, tw1, tw2)
	}


	setIdell(isIdle) {
		Tween.stopAllByTarget(this.petIcon);
		if (isIdle) {
			this.showMomoAct(PetActType.Idle)
		}
	}

	//受伤害技能展示
	showSkill(skillId) {

	}

	//受到伤害掉血
	injured(effect) {

		this.showEffectWorld(effect);
		// this.hp -= effect.val
		// this.hp = parseFloat((this.hp).toPrecision(12))
		this.hp = effect.curHP
		this.setHp(this.hp);
	}

	//回血
	addHp(effect) {
		//显示飘字效果
		this.showEffectWorld(effect);
		// this.hp += effect.val
		// this.hp = parseFloat((this.hp).toPrecision(12))
		this.hp = effect.curHP
		this.setHp(this.hp);
	}

	//设置血量状态
	addMaxHp(effect) {
		this.hpMax = parseFloat((this.hpMax + effect.val).toPrecision(12))
		this.hp = effect.curHP
		let desPer = this.hp / this.hpMax;
		this.broodBar.progress = desPer
	}

	//设置血量状态
	setHp(curHp) {
		if (curHp < 0) {
			curHp = 0
		}
		this.hp = curHp
		let desPer = this.hp / this.hpMax;
		tween(this.broodBar)
			.to(0.5 / FightMgr.getAccTime(), { progress: desPer })
			.call(() => {
				this.broodBar.node.active = true
				// this.broodNum.node.active = true
				if (curHp == 0) { //死亡
					this.showDieAnime();
					// this.stateGrp.active = false
					if (this.dieCb) {
						this.dieCb(this.data)
					}
				} else if (desPer < 0.3) {
					//血条变红
					// this.bar.color = color(183, 16, 26);
				} else if (desPer < 0.6) {
					//血条变黄
					// this.bar.color = color(255, 255, 1);
				} else {
					// this.bar.color = color(46, 183, 16);
				}
			})
			.start();
		// this.broodNum.string = this.hp + ""
	}

	async showDieAnime() {
		let tw5 = tween().to(0.5, { opacity: 0 }).call(() => {
			this.hideMomo()
		})
		CocosHelper.runTweenSync(this.node.getComponent(UIOpacity), tw5)
	}

	//设置身上buff状态
	setBuffs() {
		let idx = 0
		for (let buffId in this.buffArr) {
			let buff = this.buffGrp.children[idx];
			if (!buff) {
				buff = instantiate(this.buffPrefab);
				this.buffGrp.addChild(buff);
			}
			buff.active = true
			let roundNum = this.buffArr[buffId]
			idx++

			Common.setNodeImgSprite("buff/Buff" + buffId, buff.getChildByName("icon"));
			Common.setLableNodeText(roundNum + "", buff.getChildByName("roundNum"));
		}
	}

	private showMomo() {
		this.node.active = true
	}

	private hideMomo() {
		this.node.active = false
	}

	private handleBuff(effect) {
		let { type, attr, dmgType, val } = effect
		if (type == BufEffectType.AddStatus) {
			this.buffArr[val] = 1
		}
		if (type == BufEffectType.CleanBuf) {
			delete this.buffArr[val]
		}
		this.setBuffs()
	}

	AttrBuff(effect) {
		let { type, attr, dmgType, val } = effect

		switch (attr) {
			case ConstEnum.AttrType.HP: //血量
				this.addMaxHp(effect)
				break;
			default:
				console.log("AttrBuff etype error");
				break;
		}
		this.showEffectWorld(effect);
	}

	ShowAtkEffect(effect, actionType, skillId) {
		// console.log("ShowAtkEffect", effect)
		effect.val = parseFloat((effect.val).toPrecision(12)) //服务器给的数据有例如这样的 112.80000000000001 要编程112.8
		let { type } = effect
		switch (type) {
			case BufEffectType.Damage: // 造成伤害,val伤害
				this.injured(effect);
				break;
			case BufEffectType.Cure: // 治疗 要根据spec 判断是否是吸血
				this.addHp(effect);
				break;
			case BufEffectType.AddAttr: // 属性增益
				this.AttrBuff(effect);
				break;
			case BufEffectType.AddStatus: //添加buff
			case BufEffectType.CleanBuf: //清除buff
				this.handleBuff(effect)
				break;
			default:
				console.log("other etype:" + type);
				break;
		}
		this.showSpecEffect(effect)
	}

	//展示特殊行为 
	showSpecEffect(effect) {
		let { type, specActs } = effect
		if (specActs.length > 0) {
			let color = EFFACT_WORLD_COLOR.BASE;
			let txt = ""
			specActs.forEach(speType => {
				switch (speType) {
					case SpecActType.Blood: // 吸血
						txt = "吸血"
						break;
					case SpecActType.Stun: // 击晕
						txt = "击晕"
						this.showStateSpine()
						break;
					case SpecActType.Dodge: // 闪避
						txt = "闪避"
						break;
					case SpecActType.Trump: // 暴击
						txt = "暴击"
						break;
					default:
						console.log("  other etype:" + type);
						break;
				}
				this.showFlyWord(txt, color);
			});
		}
	}

	showStateSpine() {
		this.stateSpine.active = true
		let spine = this.stateSpine.getComponent(sp.Skeleton)
		spine.timeScale = FightMgr.getAccTime()
		// spine.setAnimation(0, "animation", true);
		this.stateSpine.getComponent(sp.Skeleton).paused = false
	}

	hideStateSpine() {
		this.stateSpine.active = false
		this.stateSpine.getComponent(sp.Skeleton).paused = true
	}

	startRun() {
		this.refreshBuffState()
	}

	//更新buff状态
	refreshBuffState() {
		this.hideStateSpine()
		// for(let key in this.buffArr){ 
		// 	this.buffArr[key] --;
		// 	if(this.buffArr[key] <= 0){
		// 		if(key == "1"||key == "2"||key == "3"){
		// 			this.hideStateSpine()
		// 		}
		// 		delete this.buffArr[key]
		// 	}
		// }
		// this.setBuffs()
	}

	public getUid() {
		return this.uid
	}

	public getType() {
		return this.type
	}

	public updateAcc() {

	}

	onDestroy() {
		if (this.t1) clearInterval(this.t1)
		this.data = null
	}

	//显示飘字
	private showFlyWord(txt, color) {
		if (txt != "null") {
			this.popArr.push({ txt, color });
		}
	}
}