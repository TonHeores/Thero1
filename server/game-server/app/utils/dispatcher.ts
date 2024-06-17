import crc from 'crc'

const dispatch = function (uid: string, connectors: any) {
  // var index = Math.abs(crc.crc32(uid)) % connectors.length
  // return connectors[index]
  return connectors[0]
}

export { dispatch }
