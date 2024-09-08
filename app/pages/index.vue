<script setup>
const page = ref(1)
const search = ref('')
const isCreateModalOpen = ref(false)
const contributeModal = ref({
  isOpen: false,
  id: '',
  name: '',
})

const { loggedIn } = useUserSession()
const toast = useToast()

const { data, status, error, refresh } = useFetch('/api/providers', {
  query: computed(() => ({
    page: page.value,
    search: search.value,
  })),
})

function openCreateModal() {
  if (!loggedIn.value) {
    toast.add({ id: 'login', title: '为了防止滥用，您需要允许授权 linux.do', callback: handleLogin })
    return
  }
  isCreateModalOpen.value = true
}

function contributeApiKey(provider) {
  if (!loggedIn.value) {
    toast.add({ id: 'login', title: '为了防止滥用，您需要允许授权 linux.do', callback: handleLogin })
    return
  }
  contributeModal.value.isOpen = true
  contributeModal.value.id = provider.id
  contributeModal.value.name = provider.name
}

function handleLogin() {
  window.location.href = '/auth/linuxdo'
}

function loadMore() {
  page.value++
  refresh()
}
</script>

<template>
  <div>
    <UContainer>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">
          OpenAI API 服务商模型——状态监测
        </h1>
        <UButton color="primary" @click="openCreateModal">
          新增服务商
        </UButton>
      </div>

      <UInput
        v-model="search"
        placeholder="搜索服务商..."
        class="mb-4"
        @input="page = 1; refresh()"
      />

      <template v-if="status === 'pending' && !data?.providers?.length">
        <div v-for="i in 3" :key="i" class="mb-8">
          <USkeleton class="h-10 w-3/4 mb-4" />
          <USkeleton class="h-6 w-1/2 mb-2" />
          <USkeleton class="h-6 w-1/3 mb-4" />
          <USkeleton class="h-20 w-full" />
        </div>
      </template>

      <div
        v-else-if="error"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong class="font-bold">错误！</strong>
        <span class="block sm:inline"> {{ error.message }}</span>
      </div>

      <template v-else>
        <UCard v-for="provider in data.providers" :key="provider.id" class="mb-8">
          <template #header>
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-2xl font-semibold">
                  {{ provider.name }}
                </h2>
                <a
                  :href="provider.apiBase"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-gray-500 hover:text-gray-700"
                >
                  {{ provider.apiBase }}
                </a>
              </div>
              <div class="flex gap-2">
                <UButton
                  color="primary"
                  variant="soft"
                  size="sm"
                  icon="i-heroicons-key"
                  @click="contributeApiKey(provider)"
                >
                  贡献 API KEY
                </UButton>
              </div>
            </div>
          </template>

          <ProviderModels :provider-id="provider.id" />

          <template #footer>
            <UButton
              v-if="data.hasMore"
              color="gray"
              variant="soft"
              size="sm"
              @click="loadMore(provider)"
            >
              加载更多模型
            </UButton>
          </template>
        </UCard>

        <div class="text-center mt-8">
          <UButton
            v-if="data.hasMore"
            color="primary"
            variant="soft"
            :loading="status === 'pending'"
            @click="loadMore"
          >
            加载更多服务商
          </UButton>
        </div>
      </template>
    </UContainer>

    <ProviderCreate v-model="isCreateModalOpen" />

    <ContributeApiKeyModal v-model="contributeModal.isOpen" :provider-id="contributeModal.id" :provider-name="contributeModal.name" />
  </div>
</template>
