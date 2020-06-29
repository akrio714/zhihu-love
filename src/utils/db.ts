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
export const db = {
  postSettings: dbFactory('post_settings.db'),
  posts: dbFactory('posts.db')
}