//通用工具放在这里：前后端通用

import { AttrType, Consts } from "./ConstDefine";

export class CommUtil{


    //战力计算（前后端通用)，入口参数attr[attrType]:number[]数组
    public static calcBattlePower(attrs:number[]):number{
        let power = 0;

        for(let i=1;i<attrs.length;i++){
            let n = attrs[i];
            switch(i){
                case AttrType.Attack:
                case AttrType.Defense:
                case AttrType.Speed:{
                    power += n;
                    break;
                }
                case AttrType.HP:{
                    power += Math.floor(n/5+0.5);
                    break;
                }
                
                default:{
                    if(i>=Consts.BattleAttrTypeMin && i<= Consts.BattleAttrTypeMax){
                        power += n * 100;
                    }else if(i>=Consts.SpecAttrTypeMin && i<= Consts.SpecAttrTypeMax){
                        power += n * 120;
                    }
                }
            }
        }

        return power;
    }


    //时间差整小时计算
    public static countHoursByTimeDiff(ts1: number, ts2: number): number {
        if (ts1 > ts2) {
            return 0
        }

        // 将时间戳转换为 Date 对象
        const date1 = CommUtil.getLastWholeHour(ts1)
        const date2 = CommUtil.getLastWholeHour(ts2)

        // 计算两个整点之间的毫秒数
        const diffMilliseconds = date2.getTime() - date1.getTime()
        // 将毫秒数转换为小时数
        const diffHours = diffMilliseconds / (1000 * 60 * 60)

        return Math.floor(diffHours)
    }

    

    // 返回ts前的最后一个整点
    public static getLastWholeHour(ts: number): Date {
        const now = new Date(ts)
        now.setMinutes(0)
        now.setSeconds(0)
        now.setMilliseconds(0)
        return now
    }
}