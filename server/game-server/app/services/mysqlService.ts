import { Application } from 'pinus'
import sqlClient from './mysql/mysql'
import Log from '../utils/log'
import { Pool } from 'generic-pool'
import { PlayerInfo } from '../../proto/DataDefine'


export enum MysqlValueTypes {
  PlayerInfo = 'PlayerInfo'
}




class MysqlService {
  mysqlClient: Pool<any>
  constructor(app: Application, dbConfig: JSON) {
    const mysqlConfig = dbConfig['mysql']
    //mysql链接
    sqlClient.init({
      ...mysqlConfig,
      user: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD
    })
  }



  //储存playerInfo
  savePlayerInfo(playerInfo: PlayerInfo) {
    
    const{uid}=playerInfo;
    Log.info('Start to update user info: ', uid, playerInfo)
    
    const value = JSON.stringify(playerInfo)
    const sql = `
    INSERT INTO \`t_player_info\` (uid, playerInfo, ctime, utime) 
    VALUES (?, ?, NOW(), NOW()) 
    ON DUPLICATE KEY UPDATE  \`playerInfo\` = ?, utime = NOW()
    `
    return sqlClient.query(sql, [uid, value, value])
  }


  
  // checkUserExist(uid: string) {
  //   Log.info('Start to check user if existing...', uid)
  //   var sql = `SELECT * FROM \`t_player_info\` WHERE  \`uid\` = ${uid}`
  //   console.log(sql, 'checkUserExist')
  //   return sqlClient.query(sql, [])
  // }

  async getValue(sKey: string, valueType: MysqlValueTypes) {
    const config = {
      [MysqlValueTypes.PlayerInfo]: {
        table: 't_player_info',
        keyName: 'uid',
        keyValue: sKey
      }
    }[valueType]
    var sql = `select * from \`${config.table}\` where \`${config.keyName}\` = "${config.keyValue}"`
    return sqlClient.query(sql, [])
  }

  // createNewPlayer(uid: string, player: PlayerInfo) {
  //   const values = [
  //     ['uid', uid],
  //     ['playerInfo', JSON.stringify(player)]
  //   ] as [string, string | number][]
  //   const sql = this.getSql('t_player_info', values)
  //   Log.info('createNewPlayer sql: ', sql)
  //   return sqlClient.query(sql, [])
  // }

  // private getSql(tableName: string, fields: [string, string | number][]) {
  //   const fieldNames = fields.map(field => field[0]).join(', ')
  //   const fieldValues = fields
  //     .map(field => {
  //       if (typeof field[1] === 'string') {
  //         return `'${field[1]}'`
  //       } else {
  //         return field[1]
  //       }
  //     })
  //     .join(', ')

  //   return `INSERT INTO ${tableName} (${fieldNames}) VALUES (${fieldValues});`
  // }
}

export default MysqlService
