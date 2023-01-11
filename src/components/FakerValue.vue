<template>
  <SenpModal :open="open" @update:open="(v) => $emit('update:open', v)">
    <div class="grid gap-4 py-4">
      <h1 class="text-2xl">Faker Value</h1>
      <div class="grid gap-1" v-if="modelValue">
        <p class="text text-neutral-200">{{ modelValue }}</p>
        <p class="text-xs text-neutral-400">ex: {{ example }}</p>
      </div>
    </div>
    <div class="h-[60vh] overflow-auto text-xs grid grid-cols-2 gap-2">
      <div class="border rounded-xl border-neutral-700 h-max">
        <details class="p-2">
          <summary>
            <p class="inline ml-2 font-bold" :class="{ 'text-blue-400': active?.module === 'custom' }">Custom</p>
          </summary>
          <div class="flex flex-wrap gap-3 pt-2">
            <button
              v-for="(value, i) of $state.customValues.value"
              :class="{ '!text-blue-400': active?.fn === value.name }"
              class="font-medium text-sm text-neutral-400 hover:text-blue-500 transition"
              @click="$emit('update:modelValue', `custom.${value.name}`)"
            >
              <abbr :title="value.values[0] + ''">
                {{ value.name }}
              </abbr>
            </button>
          </div>
        </details>
      </div>
      <div class="border rounded-xl border-neutral-700 h-max" v-for="(value, key) of fakerModules">
        <details class="p-2">
          <summary>
            <p class="inline ml-2" :class="{ 'text-blue-400': active?.module === key }">{{ key }}</p>
          </summary>
          <div class="flex flex-wrap gap-3 pt-2">
            <button
              v-for="v in value"
              :class="{ '!text-blue-400': active?.fn === v.name }"
              class="font-medium text-sm text-neutral-400 hover:text-blue-500 transition"
              @click="$emit('update:modelValue', `${key}.${v.name}`)"
            >
              <abbr :title="v.example + ''">
                {{ v.name }}
              </abbr>
            </button>
          </div>
        </details>
      </div>
    </div>
  </SenpModal>
</template>

<script setup lang="ts">
import { fakerModules, execFaker } from '@/assets/faker-utils'
const props = defineProps<{
  open: boolean
  modelValue: string
}>()

defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'update:modelValue', value: string): void
}>()

const example = computed(() => {
  if (props.modelValue) {
    return execFaker(props.modelValue)
  }
  return null
})

const active = computed(() => {
  try {
    if (props.modelValue) {
      const [_module, fn] = props.modelValue.split('.')
      return {
        module: _module,
        fn,
      }
    }
  } catch (error) {
    return null
  }
})
</script>
