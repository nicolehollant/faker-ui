<template>
  <SenpModal :open="open" @update:open="(v) => $emit('update:open', v)">
    <div class="grid gap-4 py-4">
      <h1 class="text-2xl">Shared Models</h1>
    </div>
    <div class="max-h-[60vh] overflow-auto text-xs grid divide-y divide-neutral-700/40" v-if="query.data.value?.length">
      <div v-for="model in query.data.value" class="py-4">
        <div class="flex gap-2 items-center justify-between">
          <NuxtLink
            :to="`/?code=${model.code}`"
            class="font-medium text-sm text-neutral-200 hover:text-blue-500 transition"
            :class="{ '!text-blue-400': $route.query?.code === model.code }"
          >
            {{ model.name }} <span class="text-neutral-400 text-xs">({{ model.code }})</span>
          </NuxtLink>
          <SenpButton @click="() => deleteCode.mutate(model.id)"><Icon name="mdi:trash-can"></Icon></SenpButton>
        </div>
      </div>
    </div>
    <div class="h-32 text-xs flex items-center justify-center" v-else>
      <p class="text-lg animate-pulse text-neutral-400">No shared models...</p>
    </div>
  </SenpModal>
</template>

<script setup lang="ts">
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
const queryClient = useQueryClient()

const props = defineProps<{
  open: boolean
}>()

defineEmits<{
  (event: 'update:open', value: boolean): void
}>()

const { $auth } = useNuxtApp()

const query = useQuery({
  queryKey: ['shared'],
  queryFn: async () => {
    const shared = await api.match({
      userID: $auth.account.value?.id,
    })
    return shared
  },
})

const deleteCode = useMutation({
  mutationKey: ['shared', 'destroy'],
  mutationFn: async (id: string) => {
    const res = await api.deleteOneByID(id)
    return res
  },
  onSuccess() {
    queryClient.invalidateQueries({ queryKey: ['shared'] })
  },
})
</script>
