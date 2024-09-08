import { z } from 'zod'
import { eq } from 'drizzle-orm'

const updateSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'provider_id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Provider ID is required',
    })
  }

  const body = await readValidatedBody(event, updateSchema.parse)

  const db = useDrizzle()

  const updatedProvider = await db.update(tables.providers)
    .set({ apiKey: body.apiKey })
    .where(eq(tables.providers.id, id))
    .returning()
    .get()

  if (!updatedProvider) {
    throw createError({
      statusCode: 404,
      message: 'Provider not found',
    })
  }

  return {
    message: 'API key 更新成功',
    provider: {
      id: updatedProvider.id,
      name: updatedProvider.name,
      apiBase: updatedProvider.apiBase,
    },
  }
})
