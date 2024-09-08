import { z } from 'zod'
import { v5 as uuidV5 } from 'uuid'
import { eq } from 'drizzle-orm'

const providerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  apiBase: z.string().url('Invalid API base URL'),
  apiKey: z.string().min(1, 'API key is required'),
})

interface ModelApiResponse {
  object: string
  data: {
    id: string
    object: string
    created: number
    owned_by: string
  }[]
}

interface Model {
  id: string
  name: string
}

export default defineEventHandler(async (event) => {
  try {
    const { name, apiBase, apiKey } = await readValidatedBody(event, providerSchema.parse)

    const db = useDrizzle()

    // Check if a provider with the same apiBase already exists
    const existingProvider = await db.select()
      .from(tables.providers)
      .where(eq(tables.providers.apiBase, apiBase))
      .get()

    if (existingProvider) {
      throw createError({
        statusCode: 409,
        message: 'A provider with this API base already exists',
      })
    }

    // Fetch models from the provider's API
    const { data: modelsData } = await $fetch<ModelApiResponse>(`${apiBase}/v1/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    // Using UUIDv5 ensures that the ID remains consistent across updates
    const models: Model[] = modelsData.map(model => ({
      id: uuidV5(`${apiBase}${model.id}`, uuidV5.URL),
      name: model.id,
    }))

    // Create the new provider
    const newProvider = await db.insert(tables.providers).values({
      name,
      apiBase,
      apiKey,
      models: JSON.stringify(models),
    }).returning().get()

    // Return the newly created provider with models
    return {
      statusCode: 201,
      body: newProvider,
    }
  }
  catch (error) {
    if (error instanceof z.ZodError) {
      // If it's a validation error, return 400 with validation details
      throw createError({
        statusCode: 400,
        message: 'Validation failed',
        data: error.errors,
      })
    }

    console.error('Error creating provider:', error)
    throw createError({
      statusCode: 500,
      message: `An error occurred while creating the provider`,
    })
  }
})
