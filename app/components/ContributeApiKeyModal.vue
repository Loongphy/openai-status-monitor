<script setup lang="ts">
const props = defineProps<{
  providerName: string
  providerId: string
}>()

const modelValue = defineModel<boolean>({ required: true, default: false })

const emit = defineEmits(['success'])

const apiKey = ref('')

const submitForm = async () => {
  try {
    await $fetch(`/api/providers/${props.providerId}`, {
      method: 'PATCH',
      body: { apiKey: apiKey.value },
    })
    emit('success')
    apiKey.value = ''
  }
  catch (error) {
    console.error('Failed to update API key:', error)
    // 这里可以添加错误处理，比如显示一个错误提示
  }
}
</script>

<template>
  <UModal v-model="modelValue">
    <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            为 {{ providerName }} 贡献 API KEY
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="modelValue=false"
          />
        </div>
      </template>
      <form @submit.prevent="submitForm">
        <UFormGroup label="API Key" name="apiKey">
          <UInput v-model="apiKey" type="password" placeholder="Enter your API key" />
        </UFormGroup>
        <div class="mt-4 flex justify-end">
          <UButton type="submit" color="primary">
            提交
          </UButton>
        </div>
      </form>
    </UCard>
  </UModal>
</template>
