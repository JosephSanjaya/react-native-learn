import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import schema from './schema'
import Post from './Post'

const adapter = new SQLiteAdapter({
  schema,
})

export const database = new Database({
  adapter,
  modelClasses: [Post],
})
