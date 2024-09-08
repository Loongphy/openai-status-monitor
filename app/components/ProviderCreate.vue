<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const formModel = ref({
  name: '',
  apiBase: '',
  apiKey: '',
})

const modelValue = defineModel<boolean>({ required: true, default: false })
const isTestingConnection = ref(false)
const toast = useToast()

const schema = z.object({
  name: z.string().min(1, '名称不能为空'),
  apiBase: z.string().url('请输入有效的 URL'),
  apiKey: z.string().min(1, 'API KEY 不能为空'),
})
type Schema = z.output<typeof schema>

const resetForm = () => {
  formModel.value = { name: '', apiBase: '', apiKey: '' }
}

watch(modelValue, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await $fetch('/api/providers', {
      method: 'POST',
      body: event.data,
    })
    toast.add({ title: '成功', description: '服务商添加成功', color: 'green' })
    modelValue.value = false
  }
  catch {
    toast.add({ title: '错误', description: `添加服务商失败，请测试连接能否成功`, color: 'red' })
  }
}

const testConnection = async () => {
  try {
    isTestingConnection.value = true
    // 表单校验
    schema.parse(formModel.value)

    await $fetch(`${formModel.value.apiBase}/v1/models`, {
      headers: {
        Authorization: `Bearer ${formModel.value.apiKey}`,
      },
    })
    toast.add({ title: '成功', description: '连接测试成功', color: 'green' })
  }
  catch (error) {
    if (error instanceof z.ZodError) {
      console.error(error)
    }
    else {
      toast.add({ title: '错误', description: '连接测试失败', color: 'red' })
    }
  }
  finally {
    isTestingConnection.value = false
  }
}
</script>

<template>
  <UModal v-model="modelValue">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            添加服务商
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="modelValue = false"
          />
        </div>
      </template>
      <UForm :schema="schema" :state="formModel" @submit="onSubmit">
        <UFormGroup label="名称" name="name" class="mb-4">
          <UInput v-model="formModel.name" placeholder="输入服务商名称" />
        </UFormGroup>
        <UFormGroup label="API Base" name="apiBase" class="mb-4">
          <UInput v-model="formModel.apiBase" placeholder="输入 API Base" />
        </UFormGroup>
        <UFormGroup label="API KEY" name="apiKey" class="mb-6">
          <UInput v-model="formModel.apiKey" type="password" placeholder="输入 API KEY" />
        </UFormGroup>
        <div class="flex justify-end space-x-4 mt-6">
          <UButton color="gray" :loading="isTestingConnection" @click="testConnection">
            {{ isTestingConnection ? '测试中...' : '测试连接' }}
          </UButton>
          <UButton type="submit" color="primary">
            保存
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
