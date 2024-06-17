var logger = require('pomelo-logger').getLogger('gameLog', process.pid)
//特殊使用的trace，来方便单独跟踪问题
var errorLogger = require('pomelo-logger').getLogger('errorLog', process.pid)
var warLogger = require('pomelo-logger').getLogger('warLog', process.pid)
// control variable of func "myPrint"
var blog = require('pomelo-logger').getLogger('battleLog', process.pid)

var DEBUG_ENUM = {
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4
}

var debugLevel = DEBUG_ENUM.DEBUG
var _isDebugTrace = false

// print the file name and the line number ~ begin
function getStack(...args) {
  var orig = Error.prepareStackTrace
  Error.prepareStackTrace = function (_, stack) {
    return stack
  }
  var err = new Error()
  Error.captureStackTrace(err)
  var stack = err.stack
  Error.prepareStackTrace = orig
  return stack
}

function getFileName(stack: string | any[]) {
  let logStack = stack[2]
  if (!logStack) {
    logStack = stack[1]
  }
  let fileName = logStack.getFileName()
  let pos = fileName.lastIndexOf('/')
  if (pos == -1) {
    pos = fileName.lastIndexOf('\\')
  }
  return fileName.substr(pos + 1)
}

function getLineNumber(stack: any[]) {
  return stack[1].getLineNumber()
}

class Log {
  //第一个参数默认是uid
  static debug(...args) {
    if (debugLevel < DEBUG_ENUM.DEBUG) return
    var len = args.length
    if (len <= 0) {
      return
    }
    //第一个参数默认是UID
    var uid = args[0] as string
    var stack = getStack() as any
    var traceArr = ['u[', uid, ']', getFileName(stack), '@', getLineNumber(stack), ':']

    for (var i = 1; i < len; ++i) {
      if (typeof args[i] == 'object') {
        traceArr.push(JSON.stringify(args[i]), ' ')
      } else {
        traceArr.push(args[i], ' ')
      }
    }
    logger.debug(traceArr.join(''))
  }

  //第一个参数默认是uid
  static info(...args: any[]) {
    if (debugLevel < DEBUG_ENUM.INFO) return
    var len = args.length
    if (len <= 0) {
      return
    }
    //第一个参数默认是UID
    var uid = args[0] as string
    var stack = getStack() as any
    var traceArr = ['u[', uid, ']', getFileName(stack), '@', getLineNumber(stack), ':']

    for (var i = 1; i < len; ++i) {
      if (typeof args[i] == 'object') {
        traceArr.push(JSON.stringify(args[i]), ' ')
      } else {
        traceArr.push(args[i], ' ')
      }
    }
    logger.info(traceArr.join(''))
  }

  static log(...args: any[]) {
    if (debugLevel < DEBUG_ENUM.INFO) return
    var len = args.length
    if (len <= 0) {
      return
    }
    //第一个参数默认是UID
    var uid = null
    var stack = getStack() as any
    var traceArr = ['u[', uid, ']', getFileName(stack), '@', getLineNumber(stack), ':']

    for (var i = 0; i < len; ++i) {
      if (typeof args[i] == 'object') {
        traceArr.push(JSON.stringify(args[i]), ' ')
      } else {
        traceArr.push(args[i], ' ')
      }
    }
    logger.info(traceArr.join(''))
  }

  //第一个参数默认是uid
  static trace(...args) {
    if (_isDebugTrace == false) return

    var len = args.length
    if (len <= 0) {
      return
    }
    //第一个参数默认是UID
    var uid = args[0] as string
    var stack = getStack() as any
    var traceArr = ['u[', uid, ']', getFileName(stack), '@', getLineNumber(stack), ':']

    for (var i = 1; i < len; ++i) {
      if (typeof args[i] == 'object') {
        traceArr.push(JSON.stringify(args[i]), ' ')
      } else {
        traceArr.push(args[i], ' ')
      }
    }
    warLogger.info(traceArr.join(''))
  }

  static logWarn(...args) {
    if (debugLevel < DEBUG_ENUM.WARN) return
    var len = args.length
    if (len <= 0) {
      return
    }
    //第一个参数默认是UID
    var uid = args[0] as string
    var stack = getStack() as any
    var traceArr = ['u[', uid, ']', getFileName(stack), '@', getLineNumber(stack), ':']

    for (var i = 1; i < len; ++i) {
      if (typeof args[i] == 'object') {
        traceArr.push(JSON.stringify(args[i]), ' ')
      } else {
        traceArr.push(args[i], ' ')
      }
    }
    logger.warn(traceArr.join(''))
  }
  /**
   * 抛异常
   * @param uid
   * @param errorID
   */
  static logError(...args) {
    if (debugLevel < DEBUG_ENUM.ERROR) return
    var len = args.length
    if (len <= 0) {
      return
    }
    var uid = args[0] as string
    var stack = getStack() as any
    var traceArr = ['u[', uid, ']', getFileName(stack), '@', getLineNumber(stack), ':']

    for (var i = 1; i < len; ++i) {
      if (typeof args[i] == 'object') {
        traceArr.push(JSON.stringify(args[i]), ' ')
      } else {
        traceArr.push(args[i], ' ')
      }
    }

    var str = traceArr.join('')
    errorLogger.error(str)
    console.log(str)
  }

  // log.rspError = function (errKey: string, funcCallback: Function) {
  //   var errCode = configUtil.getErrCode(errKey)
  //   if (errCode == null) {
  //     errCode = configUtil.getErrCode('UNKNOWN_ERROR')
  //   }
  //   var rsp = { code: errCode }

  //   if (funcCallback != null) {
  //     log.invokeCallback(funcCallback, rsp)
  //     return
  //   } else {
  //     return rsp
  //   }
  // }

  // log.doError = function (errCode, errMsg) {
  //   var errObj = {}
  //   errObj.errCode = errCode
  //   errObj.errMsg = errMsg
  //   return errObj
  // }
  // print the file name and the line number ~ end

  static battleLog(...args) {
    var len = args.length
    if (len <= 0) {
      return
    }
    var stack = getStack() as any
    var traceArr = [getFileName(stack), '@', getLineNumber(stack), ':']

    for (var i = 0; i < len; ++i) {
      if (typeof args[i] == 'object') {
        traceArr.push(JSON.stringify(args[i]), ' ')
      } else {
        traceArr.push(args[i], ' ')
      }
    }
    var str = traceArr.join(' ')
    blog.info(str)
    return str
  }
}

export default Log
