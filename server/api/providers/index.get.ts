import { z } from 'zod'
import { count, like } from 'drizzle-orm'

const PAGE_SIZE = 20

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  search: z.string().default(''),
})

export default defineEventHandler(async (event) => {
  const { page, search } = await getValidatedQuery(event, querySchema.parse)

  const offset = (page - 1) * PAGE_SIZE
  const db = useDrizzle()

  const [allProviders, totalCount] = await Promise.all([
    db.select({
      id: tables.providers.id,
      name: tables.providers.name,
      apiBase: tables.providers.apiBase,
    })
      .from(tables.providers)
      .where(
        search
          ? or(
            like(tables.providers.name, `%${search}%`),
            like(tables.providers.apiBase, `%${search}%`),
          )
          : undefined,
      )
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: count() })
      .from(tables.providers)
      .where(
        search
          ? or(
            like(tables.providers.name, `%${search}%`),
            like(tables.providers.apiBase, `%${search}%`),
          )
          : undefined,
      ),
  ])

  return {
    providers: allProviders,
    totalCount: totalCount[0]?.count,
    hasMore: (totalCount[0]?.count ?? 0) > page * PAGE_SIZE,
  }
})
