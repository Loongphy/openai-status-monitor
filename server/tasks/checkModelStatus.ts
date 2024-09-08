interface Model {
  id: string
  name: string
}

interface OpenAIChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    text: string
    index: number
    logprobs: null | unknown
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function checkModelStatus() {
  const db = useDrizzle()
  // Fetch all providers
  const providers = await db.select().from(tables.providers)

  for (const provider of providers) {
    try {
      // Parse the models from the provider's stored models
      const models: Model[] = JSON.parse(provider.models || '[]')

      // Send a request to the /v1/chat/completions API for each model
      for (const model of models) {
        const requestBody = {
          model: model.name,
          messages: [{ role: 'user', content: 'Hello, how are you?' }],
          max_tokens: 5,
        }

        const startTime = Date.now()

        try {
          const response = await $fetch<OpenAIChatCompletionResponse>(`${provider.apiBase}/v1/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${provider.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          })

          const latency = Date.now() - startTime

          // Check if the response body is valid
          if (response && response.choices && response.choices.length > 0) {
            // Log the successful request
            await db.insert(tables.requestLogs).values({
              providerId: provider.id,
              modelId: model.id,
              requestTime: new Date(startTime),
              latency,
              status: 'success',
            })
          }
          else {
            // Log the failed request due to invalid response body
            await db.insert(tables.requestLogs).values({
              providerId: provider.id,
              modelId: model.id,
              requestTime: new Date(startTime),
              latency,
              status: 'error',
              errorMessage: 'Invalid response body',
            })
          }
        }
        catch (error) {
          const latency = Date.now() - startTime

          // Log the failed request
          await db.insert(tables.requestLogs).values({
            providerId: provider.id,
            modelId: model.id,
            requestTime: new Date(startTime),
            latency,
            status: 'error',
            errorMessage: String(error),
          })

          console.error(`Error sending chat completion request for model ${model.name} of provider ${provider.apiBase} :`, error)
        }
      }
    }
    catch (error) {
      console.error(`Error processing provider ${provider.name}:`, error)
    }
  }
}
