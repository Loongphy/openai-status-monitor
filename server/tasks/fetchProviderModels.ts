import { v5 as uuidV5 } from 'uuid'
import { eq } from 'drizzle-orm'

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

export async function fetchProviderModels() {
  const db = useDrizzle()
  // Fetch all providers
  const providers = await db.select().from(tables.providers)

  for (const provider of providers) {
    try {
      // Fetch models from the provider's API
      const { data: modelsData } = await $fetch<ModelApiResponse>(`${provider.apiBase}/v1/models`, {
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
        },
      })

      // Transform the model data
      const models: Model[] = modelsData.map(model => ({
        id: uuidV5(`${provider.apiBase}${model.id}`, uuidV5.URL),
        name: model.id,
      }))

      // Update the provider with the fetched models
      await db.update(tables.providers)
        .set({ models: JSON.stringify(models) })
        .where(eq(tables.providers.id, provider.id))
    }
    catch (error) {
      console.error(`Error updating models for provider ${provider.name}:`, error)
    }
  }
}
