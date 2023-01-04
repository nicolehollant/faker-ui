<template>
  <div class="text-sm shrink-0">
    <div class="w-8 h-8 bg-neutral-600 rounded-full animate-pulse" v-if="loading"></div>
    <NuxtLink v-else-if="!isAuthed" to="/auth/login" class="text-neutral-200 hover:text-blue-400 transition"
      >Sign In</NuxtLink
    >
    <Menu
      v-else
      :options="[
        { label: 'Sign Out', emits: 'signOut' },
        { label: 'Shared Models', emits: 'sharedModels' },
      ]"
      @select="
      (emitKey) => ({
        signOut: ()=> {
          $auth.signOut()
          loading = false
        },
        sharedModels: ()=> {
          modals.shared = true
        }
      }[emitKey as 'signOut' | 'sharedModels']())
      "
    >
      <template #trigger>
        <div class="border-2 border-transparent ring-2 ring-neutral-500 rounded-full">
          <img :src="avatarSvg" alt="Avatar" class="w-8 h-8 rounded-full" />
        </div>
      </template>
    </Menu>
    <SharedModal v-model:open="modals.shared"></SharedModal>
  </div>
</template>

<script setup lang="ts">
import svgToMiniDataURI from 'mini-svg-data-uri'

import { generateFromString } from 'generate-avatar'
const { $auth } = useNuxtApp()
const loading = ref(true)
const isAuthed = ref(false)
const avatarSvg = ref('')
const modals = reactive({
  shared: false,
})

watch($auth.account, () => {
  if ($auth.account.value?.id) {
    avatarSvg.value = svgToMiniDataURI(generateFromString($auth.account.value?.id))
    isAuthed.value = true
  } else {
    isAuthed.value = false
  }
})

onMounted(() => {
  console.log($auth.account.value)
  if ($auth.account.value?.id) {
    avatarSvg.value = svgToMiniDataURI(generateFromString($auth.account.value?.id))
    isAuthed.value = true
  }
  loading.value = false
})
</script>
