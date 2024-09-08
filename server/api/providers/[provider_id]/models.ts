import { sql } from 'drizzle-orm'
import { z } from 'zod'

interface ModelInfo {
  id: string
  name: string
}

interface LogEntry {
  model_id: string
  request_time: number
  latency: number
  status_code: number
  response: string | null
}

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  search: z.string().default(''),
})

export default defineEventHandler(async (event) => {
  const providerId = getRouterParam(event, 'provider_id')
  const { page, limit, search } = await getValidatedQuery(event, querySchema.parse)

  if (!providerId) {
    throw createError({
      statusCode: 400,
      message: '需要提供 Provider ID',
    })
  }

  const db = useDrizzle()
  const provider = await db.select().from(tables.providers).where(eq(tables.providers.id, providerId)).get()

  if (!provider) {
    throw createError({
      statusCode: 404,
      message: '未找到该供应商',
    })
  }

  const models: ModelInfo[] = JSON.parse(provider.models || '[]')

  // 应用搜索过滤
  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(search.toLowerCase())
    || model.id.toLowerCase().includes(search.toLowerCase()),
  )

  const total = filteredModels.length
  const offset = (page - 1) * limit
  const paginatedModels = filteredModels.slice(offset, offset + limit)

  const modelIds = paginatedModels.map(m => m.id)

  const query = sql`
    SELECT rl.model_id, rl.request_time, rl.latency, rl.status_code, rl.response
    FROM request_log AS rl
    WHERE rl.model_id IN (${sql.join(modelIds, sql`, `)})
    AND rl.request_time = (
      SELECT MAX(request_time)
      FROM request_log
      WHERE model_id = rl.model_id
    )
  `

  const logs: LogEntry[] = await db.all(query)

  const modelStatuses = paginatedModels.map((model) => {
    const log = logs.find(l => l.model_id === model.id)
    return {
      id: model.id,
      name: model.name,
      latency: log?.latency ?? null,
      status_code: log?.status_code ?? null,
      request_time: log?.request_time ?? null,
      response: log?.response ?? null,
    }
  })

  return {
    models: modelStatuses,
    total,
    page,
    limit,
  }
})
