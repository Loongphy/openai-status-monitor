<template>
  <div class="p-4">
    <UNotifications :ui="{ position: 'top-0 right-0' }" />

    <UserHeader />
    <slot />
    <UContainer class="py-4 flex justify-center text-gray-600">
      Built with passion 🚀
    </UContainer>
  </div>
</template>
