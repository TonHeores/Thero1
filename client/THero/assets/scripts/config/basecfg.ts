import { color, Vec4,Vec3 } from "cc";


export enum SOUND_RES{
    MAIN = "main", //主场景音乐
    Fight = "zhandou", //战斗音乐
    CLICK = "click", //按钮点击音效
    Openbox = "openbox", //打开箱子
    GetEquip = "getEquip", //获得装备
    AddMoney = "addMoney", //装备出售时加钱音效
    Lose = "lose", //战斗失败
    Win = "win",//战斗胜利,
    HIT = "hit"
}

export enum EFFACT_WORLD_COLOR{
	BASE =  color(255,255,255) as any, //默认
	CIRT =  color(255,66,66) as any, //暴击
	KEZHI =  color(255,241,127) as any, //克制
	DODGE = color(129,129,129) as any,//闪避
	MIANYI = color(255,241,127) as any,//免疫
	GEDANG = color(129,129,129) as any,//格挡
	ADDHP = color(0,255,0) as any,//回血
	SKILLNAME = color(101,221,255) as any, //被动技能
	SKILLNAME_MAIN = color(194,89,255) as any, //主动技能
}

export enum CHECK_KEY{
    TEST = "TEST",
    CHANGEEQUIP = "CHANGEEQUIP"
}

export enum FIGHT_ANI_NAME{
    PETATK = "PETATK",
    PETDEF = "PETDEF",
    PETIDLE = "PETIDLE",
    PETWALK = "PETWALK",
    PETRUN = "PETRUN",
    NORMAL = "normal",
    SKILL = "skill",
    DEF = "def"
}

export enum i18Lang{
    attrEnum = {
        1 : "Property_1",
        2 : "Property_1",
        3 : "Property_3",
        4 : "Property_2",
        5 : "Property_4",
 
        10 :"Property_5",
        11 : "Property_7",
        12 : "Property_6",
        13 : "Property_8",
        14 : "Property_9",
        15 : "Property_13",
        16 : "Property_12",
        17 : "Property_15",
        18 : "Property_11",
        19 : "Property_14",
        20 : "heal",
        21 : "beheal",

        31 : "MagicWeapon_08",
        32 : "MagicWeapon_09",
        33 : "MagicWeapon_10",
        34 : "MagicWeapon_11",
        35 : "MagicWeapon_12",

        105 : "Property_4",

        999 : "Property_18",
    } as any
}

export enum MapCfg {
    HomeTownMapConstans = {
        "1":{mapSplitWidth:1624,mapSplitHeight:750,mapWidth:3248,mapHeight:1500,gridWidth:25,gridHeight:25},
    } as any,
    DungeonMapConstans = {
        "1":{mapSplitWidth:1000,mapSplitHeight:1000,mapWidth:12000,mapHeight:6000},
    } as any,
}

export enum StringColor{
    quality1="#cfcfcf",
    quality2="#1EB628",
    quality3="#4981ff",
    quality4="#bd61f7",
    quality5="#ff8f0a",
    quality6="#ff2136",
    quality7="#fff005",
    quality8="#1bf0f3",
    quality9="#ffc0e4",
}

export enum StringOutline{
    quality1="#494949",
    quality2="#165502",
    quality3="#1f3077",
    quality4="#46056f",
    quality5="#9b2800",
    quality6="#870000",
    quality7="#d74c00",
    quality8="#006f8f",
    quality9="#b93780"
}


    

