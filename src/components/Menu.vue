<template>
  <HeadlessMenu as="div" class="relative inline-block text-left">
    <div>
      <HeadlessMenuButton v-slot="{ open }">
        <slot name="trigger" :open="open"></slot>
      </HeadlessMenuButton>
    </div>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-75 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-75 opacity-0"
    >
      <HeadlessMenuItems
        class="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-neutral-800 shadow-lg ring-1 ring-neutral-500 ring-opacity-60 focus:outline-none"
      >
        <div class="px-1 py-1">
          <slot name="items">
            <HeadlessMenuItem v-slot="{ active }" v-for="option in options" :key="option.label">
              <button
                @click="$emit('select', option.emits)"
                :class="[
                  active ? 'bg-blue-700/50 text-white' : 'text-neutral-200',
                  'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                ]"
              >
                {{ option.label }}
              </button>
            </HeadlessMenuItem>
          </slot>
        </div>
      </HeadlessMenuItems>
    </transition>
  </HeadlessMenu>
</template>

<script setup lang="ts">
defineProps<{
  options?: { label: string; emits: string }[]
}>()
defineEmits<{
  (event: 'select', key: string): void
}>()
</script>
