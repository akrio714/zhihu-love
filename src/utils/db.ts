/*
 * @Author: your name
 * @Date: 2020-05-04 21:06:26
 * @LastEditTime: 2020-05-05 08:04:20
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /love/src/utils/db.ts
 */
import Datastore from 'nedb-promises'
import { remote } from 'electron'

export function dbFactory(fileName: string) {
  return Datastore.create({
    filename: `${
      process.env.NODE_ENV === 'dev' ? '.' : remote.app.getAppPath()
    }/data/${fileName}`,
    timestampData: true,
    autoload: true,
  })
}
