import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { v7 as uuidV7 } from 'uuid'

export const providers = sqliteTable('providers', {
  id: text('id').primaryKey().$defaultFn(() => uuidV7()),
  name: text('name').notNull(),
  apiBase: text('api_base').notNull(),
  apiKey: text('api_key').notNull(),
  models: text('models'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
})

export const requestLogs = sqliteTable('request_log', {
  id: text('id').primaryKey().$defaultFn(() => uuidV7()),
  modelId: text('model_id').notNull(),
  requestTime: integer('request_time', { mode: 'timestamp_ms' }).notNull(),
  latency: integer('latency').notNull(), // in milliseconds
  statusCode: integer('status_code').notNull(),
  response: text('response'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
})
