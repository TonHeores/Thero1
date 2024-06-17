import Log from './log'

class HelpUtil {
  static getRandomInt(a: number, b: number): number {
    return Math.floor(Math.random() * (b - a + 1)) + a
  }

  static getRandomFloat(a: number, b: number): number {
    return Math.random() * (b - a) + a
  }

  static getRandomByProbabilities(probabilities: number[]): number {
    const total = probabilities.reduce((sum, probability) => sum + probability, 0)
    if (total !== 100) {
      Log.logWarn('Total probabilities is not 100', total)
    }
    const randomValue = Math.random() * total
    let sum = 0

    for (let i = 0; i < probabilities.length; i++) {
      sum += probabilities[i]
      if (randomValue < sum) {
        return i + 1
      }
    }

    // 如果因为浮点精度问题没有返回值，则返回最后一个值
    return probabilities.length
  }

  static getRandomElementAndRemove<T>(arr: T[]): T {
    const index = HelpUtil.getRandomInt(0, arr.length - 1)
    return arr.splice(index, 1)[0]
  }

  static formatNumber(num: number, decimals = 2) {
    const factor = 10 ** decimals
    return Math.round((num + Number.EPSILON) * factor) / factor
  }

  //对象深拷贝
  public static copyObj(dstObj: any, srcObj: any): void {
    if (srcObj == null || dstObj == null) return

    const keys = Object.keys(srcObj) as Array<keyof typeof srcObj>
    keys.forEach(key => {
      dstObj[key] = srcObj[key]
    })
    //dstObj = JSON.parse(JSON.stringify(srcObj));
  }

}

export default HelpUtil
