<script setup lang="ts">
const props = defineProps<{
  providerId: string
}>()

interface Model {
  id: string
  name: string
  latency: number | null
  status_code: number | null
  request_time: string | null
  response: string | null
}

const page = ref(1)
const limit = ref(10)
const searchQuery = ref('')

const { data, status, error, refresh } = useFetch<{
  models: Model[]
  page: number
  limit: number
  total: number
}>(() => `/api/providers/${props.providerId}/models`, {
  query: {
    page: page.value,
    limit: limit.value,
    search: searchQuery.value,
  },
})

watch([page, limit, searchQuery], () => {
  refresh()
})

const tableConfig = {
  columns: [
    { key: 'request_time', label: '请求时间', width: '200px' },
    { key: 'name', label: '名称', width: '200px' },
    { key: 'id', label: '模型 ID', width: '150px' },
    { key: 'latency', label: '延迟', width: '100px' },
    { key: 'status_code', label: '状态', width: '150px' },
  ],
  ui: {
    wrapper: 'mb-4',
    td: { base: 'whitespace-nowrap' },
  },
  helpers: {
    formatTimestamp(timestamp: string | null) {
      if (!timestamp) return '未知'
      return new Date(timestamp).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    },
    getStatusText(row: Model) {
      if (!row) return ''
      else if (row.status_code === null) return '未知'
      else if (row.status_code < 400) return '成功'
      return `${row.status_code}`
    },
    getStatusTooltip(model: Model) {
      if (model.status_code === null) return '未知状态'
      if (model.status_code >= 400 && model.response) {
        try {
          const responseObj = JSON.parse(model.response)
          return `状态码: ${model.status_code}, 错误: ${responseObj.error || responseObj.message || '未知错误'}`
        }
        catch {
          return `状态码: ${model.status_code}, 错误: ${model.response}`
        }
      }
      return `状态码: ${model.status_code}`
    },
    getStatusColor(row: Model) {
      if (row.status_code === null) return 'gray'
      if (row.status_code < 400) return 'green'
      return 'red'
    },
    getLatencyClass(row: Model) {
      if (row.status_code === null || row.status_code >= 400 || row.latency === null) return ''
      if (row.latency < 1000) return 'text-green-500'
      if (row.latency < 3000) return 'text-yellow-500'
      return 'text-red-500'
    },
    hasStatusData(row: Model) {
      return row.status_code !== null && row.status_code !== undefined
    },
  },
}
</script>

<template>
  <div class="mb-4">
    <UInput
      v-model="searchQuery"
      placeholder="搜索模型..."
      icon="i-heroicons-magnifying-glass-20-solid"
    />
  </div>
  <div v-if="status === 'pending'">
    <USkeleton v-for="i in 3" :key="i" class="h-6 w-full mb-2" />
  </div>
  <div v-else-if="error" class="text-red-500">
    加载模型时出错: {{ error.message }}
  </div>
  <div v-else-if="data?.models && data?.models.length">
    <UTable
      :columns="tableConfig.columns"
      :rows="data.models"
      :ui="tableConfig.ui"
    >
      <template #latency-data="{ row }">
        <span
          v-if="row.status_code < 400"
          :class="tableConfig.helpers.getLatencyClass(row)"
        >
          {{ row.request_time? row.latency+' 毫秒': '' }}
        </span>
        <span v-else>-</span>
      </template>
      <template #status_code-data="{ row }">
        <UTooltip v-if="tableConfig.helpers.hasStatusData(row)" :text="tableConfig.helpers.getStatusTooltip(row)">
          <UBadge
            :color="tableConfig.helpers.getStatusColor(row)"
            class="truncate max-w-[130px]"
          >
            {{ tableConfig.helpers.getStatusText(row) }}
          </UBadge>
        </UTooltip>
        <span v-else>-</span>
      </template>
      <template #request_time-data="{ row }">
        {{ row.request_time ? tableConfig.helpers.formatTimestamp(row.request_time) : '-' }}
      </template>
    </UTable>
    <div class="mt-4 flex justify-center">
      <UPagination
        v-model="page"
        :total="data.total"
        :limit="limit"
      />
    </div>
  </div>
  <div v-else class="text-gray-500 italic">
    没有可用的模型。
  </div>
</template>
