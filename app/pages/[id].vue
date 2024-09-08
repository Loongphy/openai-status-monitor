<script setup>
const route = useRoute()
const { data: provider, error, status } = useFetch(`/api/providers/${route.params.id}/models`)

const columns = [
  { key: 'name', label: 'Model Name' },
  { key: 'api_latency', label: 'API Latency (ms)' },
  { key: 'data_time', label: 'Last Updated' },
]
</script>

<template>
  <UContainer>
    <UCard>
      <template #header>
        <h1 class="text-2xl font-bold">
          {{ provider?.provider }} Models
        </h1>
      </template>

      <UTable :columns="columns" :rows="provider?.models || []" :loading="status=='pending'">
        <template #api_latency-data="{ row }">
          {{ row.api_latency }} ms
        </template>
      </UTable>

      <template #footer>
        <p v-if="error" class="text-red-500">
          Error loading models: {{ error.message }}
        </p>
        <UButton to="/" color="gray" variant="soft">
          Back to Providers
        </UButton>
      </template>
    </UCard>
  </UContainer>
</template>
