<template>
  <div class="flex items-center justify-end m-4">
    <div v-if="loggedIn && typedUser" class="flex items-center">
      <UAvatar
        :src="typedUser.avatar"
        alt="用户头像"
        class="w-10 h-10 rounded-full mr-4"
        :chip-text="typedUser?.level"
        chip-position="bottom-right"
      />
      <div class="mr-4">
        <p class="font-semibold">
          {{ typedUser.username }}
        </p>
        <p :class="levelClass">
          {{ levelText }}
        </p>
      </div>
      <UButton color="gray" variant="soft" @click="clear">
        退出登录
      </UButton>
    </div>
    <UButton v-else color="primary" @click="login">
      登录
    </UButton>
  </div>
</template>

<script setup lang="ts">
interface User {
  id: number
  username: string
  name: string
  avatar: string
  level: number
  active: boolean
}

const { loggedIn, user, clear } = useUserSession()
const typedUser = computed(() => user.value as User | null)

const login = () => {
  window.location.href = '/auth/linuxdo'
}

const levelClass = computed(() => {
  switch (typedUser.value?.level) {
    case 1: return 'text-green-500'
    case 2: return 'text-blue-500'
    case 3: return 'text-yellow-500'
    case 4: return 'text-red-500'
    default: return 'text-gray-500'
  }
})

const levelText = computed(() => {
  switch (typedUser.value?.level) {
    case 1: return '初级用户'
    case 2: return '中级用户'
    case 3: return '高级用户'
    case 4: return 'VIP用户'
    default: return '未知等级'
  }
})
</script>
