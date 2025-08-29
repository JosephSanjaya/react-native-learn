import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import schema from './schema.ts'
import Post from './Post.ts'

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'WorkManagerSample',
})

export const database = new Database({
  adapter,
  modelClasses: [Post],
})
